import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IDataObject,
	INodeExecutionData,
	IHttpRequestOptions,
	INode,
} from 'n8n-workflow';
import { NodeOperationError, sleep } from 'n8n-workflow';

export const RESEND_API_BASE = 'https://api.resend.com';

/**
 * Helper to make authenticated requests to the Resend API.
 */
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

	return await this.helpers.httpRequestWithAuthentication.call(
		this,
		'resendApi',
		options,
	);
}

/**
 * Fetch list items with pagination support.
 * Returns an array of items (not the wrapper object).
 * @param endpoint - The API endpoint path (e.g., '/emails')
 */
export async function requestList(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', 0, false) as boolean;
	const limit = this.getNodeParameter('limit', 0, 50) as number;

	const targetLimit = returnAll ? Infinity : (limit ?? 50);
	const pageSize = Math.min(targetLimit, 100); // Resend API max is 100
	const qs: Record<string, string | number> = { limit: pageSize };

	const requestPage = async () => {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
			url: `${RESEND_API_BASE}${endpoint}`,
			method: 'GET',
			qs,
			json: true,
		});
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

		// Stop if we have enough items
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

	// Return just the items array, sliced to exact limit
	return allItems.slice(0, targetLimit);
}

/**
 * Normalize email list input to array format.
 */
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

/**
 * Parse template variables from input format.
 */
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

/**
 * Build template send variables object.
 * Handles both plain string keys and resourceLocator format keys.
 */
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

/**
 * Assert that endpoint uses HTTPS scheme.
 */
export function assertHttpsEndpoint(node: INode, endpoint: string): void {
	const normalizedEndpoint = endpoint.trim().toLowerCase();
	if (normalizedEndpoint.startsWith('http://')) {
		throw new NodeOperationError(
			node,
			'Invalid webhook endpoint scheme. Resend requires a publicly reachable HTTPS URL.',
		);
	}
}

/**
 * Create execution data for list operations.
 * All list results are produced from a single API call, so they should all
 * pair back to input item 0 (the item that triggered the list operation).
 */
export function createListExecutionData(
	this: IExecuteFunctions,
	items: IDataObject[],
): INodeExecutionData[] {
	return items.map((item) => ({
		json: item,
		pairedItem: { item: 0 },
	}));
}
