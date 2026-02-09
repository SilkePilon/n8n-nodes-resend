import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

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
	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const options: {
		url: string;
		method: IHttpRequestMethods;
		headers: Record<string, string>;
		body?: IDataObject | IDataObject[];
		qs?: IDataObject;
		json: boolean;
	} = {
		url: `${RESEND_API_BASE}${endpoint}`,
		method,
		headers: {
			Authorization: `Bearer ${apiKey}`,
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

	return this.helpers.httpRequest(options);
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
	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const targetLimit = returnAll ? 1000 : (limit ?? 50);
	const pageSize = Math.min(targetLimit, 100); // Resend API max is 100
	const qs: Record<string, string | number> = { limit: pageSize };

	const requestPage = () =>
		this.helpers.httpRequest({
			url: `${RESEND_API_BASE}${endpoint}`,
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			qs,
			json: true,
		});

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const allItems: IDataObject[] = [];
	let hasMore = true;
	let isFirstRequest = true;

	while (hasMore) {
		// Rate limiting: wait 1 second between requests (Resend allows 2 req/sec)
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
			keyValue = variable.key.value as string;
		} else if (typeof variable.key === 'string') {
			keyValue = variable.key;
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
export function assertHttpsEndpoint(endpoint: string): void {
	const normalizedEndpoint = endpoint.trim().toLowerCase();
	if (normalizedEndpoint.startsWith('http://')) {
		throw new Error(
			'Invalid webhook endpoint scheme. Resend requires a publicly reachable HTTPS URL.',
		);
	}
}

/**
 * Create execution data for list operations.
 */
export function createListExecutionData(
	this: IExecuteFunctions,
	items: IDataObject[],
): INodeExecutionData[] {
	const inputData = this.getInputData();
	return items.map((item, index) => ({
		json: item,
		pairedItem: { item: index < inputData.length ? index : 0 },
	}));
}
