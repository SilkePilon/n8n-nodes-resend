import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IDataObject,
	INodeExecutionData,
	IHttpRequestOptions,
	INode,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';

interface ResendApiError {
	name: string;
	message: string;
	statusCode: number;
}

function formatResendErrorTitle(name: string): string {
	return name
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function extractResendError(error: unknown): ResendApiError | undefined {
	if (!error || typeof error !== 'object') return undefined;

	const isResendShape = (obj: unknown): obj is ResendApiError => {
		if (!obj || typeof obj !== 'object') return false;
		const o = obj as Record<string, unknown>;
		return (
			typeof o.name === 'string' &&
			typeof o.message === 'string' &&
			o.name !== 'Error' &&
			o.name !== 'NodeApiError' &&
			o.name !== 'NodeOperationError' &&
			o.name !== 'AxiosError'
		);
	};

	const tryJson = (value: unknown): ResendApiError | undefined => {
		if (typeof value !== 'string') return undefined;
		const trimmed = value.trim();
		if (!trimmed.startsWith('{')) return undefined;
		try {
			const parsed = JSON.parse(trimmed) as unknown;
			if (isResendShape(parsed)) return parsed;
		} catch { /* not JSON */ }
		return undefined;
	};

	if (isResendShape(error)) return error;

	const err = error as Record<string, unknown>;

	let result = tryJson(err.message) ?? tryJson(err.description);
	if (result) return result;

	if (err.cause && typeof err.cause === 'object') {
		const cause = err.cause as Record<string, unknown>;

		if (cause.response && typeof cause.response === 'object') {
			const resp = cause.response as Record<string, unknown>;
			if (isResendShape(resp.data)) {
				result = resp.data as ResendApiError;
				if (!result.statusCode && typeof resp.status === 'number') {
					result = { ...result, statusCode: resp.status };
				}
				return result;
			}
			result = tryJson(resp.data);
			if (result) return result;
		}

		if (isResendShape(cause.body)) return cause.body as ResendApiError;
		result = tryJson(cause.body);
		if (result) return result;

		if (cause.cause && typeof cause.cause === 'object') {
			const inner = cause.cause as Record<string, unknown>;
			if (inner.response && typeof inner.response === 'object') {
				const resp = inner.response as Record<string, unknown>;
				if (isResendShape(resp.data)) return resp.data as ResendApiError;
				result = tryJson(resp.data);
				if (result) return result;
			}
		}
	}

	return undefined;
}

function sanitizeErrorMessage(message: string): string {
	return message
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/`/g, "'");
}

export function handleResendApiError(
	node: INode,
	error: unknown,
	itemIndex?: number,
): never {
	const resendError = extractResendError(error);

	if (resendError) {
		const sanitizedMessage = sanitizeErrorMessage(resendError.message);
		throw new NodeApiError(node, {
			message: sanitizedMessage,
			name: resendError.name,
			statusCode: resendError.statusCode,
		} as unknown as JsonObject, {
			message: `${formatResendErrorTitle(resendError.name)} (${resendError.statusCode})`,
			description: sanitizedMessage,
			httpCode: String(resendError.statusCode),
			...(itemIndex !== undefined ? { itemIndex } : {}),
		});
	}

	if (error instanceof NodeApiError || error instanceof NodeOperationError) {
		throw error;
	}

	throw new NodeApiError(node, (error ?? {}) as JsonObject, {
		...(itemIndex !== undefined ? { itemIndex } : {}),
	});
}

export const RESEND_API_BASE = 'https://api.resend.com';

export async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject | IDataObject[],
	qs?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		url: `${RESEND_API_BASE}${endpoint}`,
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (body) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'resendApi',
			options,
		);
	} catch (error) {
		handleResendApiError(this.getNode(), error);
	}
}

export async function requestList(
	this: IExecuteFunctions,
	endpoint: string,
	extraQs?: IDataObject,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', 0, false) as boolean;
	const limit = this.getNodeParameter('limit', 0, 50) as number;

	const targetLimit = returnAll ? Infinity : (limit ?? 50);
	const pageSize = Math.min(targetLimit, 100);
	const qs: Record<string, string | number> = { limit: pageSize, ...extraQs };

	const requestPage = async () => {
		try {
			return await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
				url: `${RESEND_API_BASE}${endpoint}`,
				method: 'GET',
				qs,
				json: true,
			});
		} catch (error) {
			handleResendApiError(this.getNode(), error);
		}
	};

	const allItems: IDataObject[] = [];
	let hasMore = true;
	let isFirstRequest = true;

	while (hasMore) {
		if (!isFirstRequest) {
			await sleep(1000);
		}
		isFirstRequest = false;

		const response = await requestPage();
		const responseData = Array.isArray((response as { data?: IDataObject[] }).data)
			? ((response as { data?: IDataObject[] }).data as IDataObject[])
			: [];
		allItems.push(...responseData);

		if (allItems.length >= targetLimit) {
			break;
		}

		hasMore = Boolean((response as { has_more?: boolean }).has_more);
		if (!hasMore || responseData.length === 0) {
			break;
		}

		const lastItem = responseData[responseData.length - 1] as { id?: string } | undefined;
		if (!lastItem?.id) {
			break;
		}

		qs.after = lastItem.id;
	}

	return allItems.slice(0, targetLimit);
}

export function normalizeEmailList(value: string | string[] | undefined): string[] {
	if (Array.isArray(value)) {
		return value.map((email) => String(email).trim()).filter((email) => email);
	}
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((email) => email.trim())
			.filter((email) => email);
	}
	return [];
}

export function parseTemplateVariables(
	executeFunctions: IExecuteFunctions,
	variablesInput:
		| { variables?: Array<{ key: string; type: string; fallbackValue?: unknown }> }
		| undefined,
	fallbackKey: 'fallbackValue' | 'fallback_value',
	itemIndex: number,
): Array<Record<string, unknown>> | undefined {
	if (!variablesInput?.variables?.length) {
		return undefined;
	}

	return variablesInput.variables.map((variable) => {
		const variableEntry: Record<string, unknown> = {
			key: variable.key,
			type: variable.type,
		};

		const fallbackValue = variable.fallbackValue;
		if (fallbackValue !== undefined && fallbackValue !== '') {
			let parsedFallback: string | number = fallbackValue as string;
			if (variable.type === 'number') {
				const numericFallback =
					typeof fallbackValue === 'number' ? fallbackValue : Number(fallbackValue);
				if (Number.isNaN(numericFallback)) {
					throw new NodeOperationError(
						executeFunctions.getNode(),
						`Variable "${variable.key}" fallback value must be a number`,
						{ itemIndex },
					);
				}
				parsedFallback = numericFallback;
			}
			variableEntry[fallbackKey] = parsedFallback;
		}

		return variableEntry;
	});
}

export function buildTemplateSendVariables(
	variablesInput: { variables?: Array<{ key: string | { mode?: string; value?: unknown }; value?: unknown }> } | undefined,
): Record<string, unknown> | undefined {
	if (!variablesInput?.variables?.length) {
		return undefined;
	}
	const variables: Record<string, unknown> = {};
	for (const variable of variablesInput.variables) {
		let keyValue: string | undefined;
		if (typeof variable.key === 'object' && variable.key !== null && 'value' in variable.key) {
			const extracted = variable.key.value;
			if (typeof extracted === 'string') {
				const trimmed = extracted.trim();
				if (trimmed) {
					keyValue = trimmed;
				}
			}
		} else if (typeof variable.key === 'string') {
			const trimmed = variable.key.trim();
			if (trimmed) {
				keyValue = trimmed;
			}
		}

		if (!keyValue) {
			continue;
		}
		variables[keyValue] = variable.value ?? '';
	}

	return Object.keys(variables).length ? variables : undefined;
}

export function assertHttpsEndpoint(node: INode, endpoint: string): void {
	const normalizedEndpoint = endpoint.trim().toLowerCase();
	if (normalizedEndpoint.startsWith('http://')) {
		throw new NodeOperationError(
			node,
			'Invalid webhook endpoint scheme. Resend requires a publicly reachable HTTPS URL.',
		);
	}
}

export function createListExecutionData(
	this: IExecuteFunctions,
	items: IDataObject[],
): INodeExecutionData[] {
	return items.map((item) => ({
		json: item,
		pairedItem: { item: 0 },
	}));
}
