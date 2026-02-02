import type { ILoadOptionsFunctions, INodePropertyOptions, INodeListSearchResult } from 'n8n-workflow';

const RESEND_API_BASE = 'https://api.resend.com';

/**
 * Load options for dropdown fields (max 100 items).
 * Used by getTemplates, getSegments, getTopics.
 */
async function loadDropdownOptions(
	loadOptionsFunctions: ILoadOptionsFunctions,
	endpoint: string,
): Promise<INodePropertyOptions[]> {
	const credentials = await loadOptionsFunctions.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await loadOptionsFunctions.helpers.httpRequest({
		url: `${RESEND_API_BASE}${endpoint}`,
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		qs: { limit: 100 },
		json: true,
	});

	const items = response?.data ?? [];
	return items
		.filter((item: { id?: string }) => item?.id)
		.map((item: { id: string; name?: string }) => ({
			name: item.name ? `${item.name} (${item.id})` : item.id,
			value: item.id,
		}));
}

export async function getTemplateVariables(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const getStringValue = (value: unknown) =>
		typeof value === 'string' && value.trim() ? value : undefined;
	const safeGet = (getter: () => unknown) => {
		try {
			return getter();
		} catch {
			return undefined;
		}
	};
	const getParameterValue = (name: string) => {
		const currentParameters = this.getCurrentNodeParameters();
		const fromCurrentParameters = getStringValue(currentParameters?.[name]);
		if (fromCurrentParameters) {
			return fromCurrentParameters;
		}

		const fromCurrentNodeParameter = getStringValue(
			safeGet(() => this.getCurrentNodeParameter(name)),
		);
		if (fromCurrentNodeParameter) {
			return fromCurrentNodeParameter;
		}

		const fromNodeParameter = getStringValue(safeGet(() => this.getNodeParameter(name, '')));
		if (fromNodeParameter) {
			return fromNodeParameter;
		}

		return undefined;
	};

	const templateId = getParameterValue('emailTemplateId') ??
					  getParameterValue('emailTemplateIdDropdown') ??
					  getParameterValue('emailTemplateIdManual') ??
					  getParameterValue('templateId') ??
					  getParameterValue('templateIdDropdown') ??
					  getParameterValue('templateIdManual');
	if (!templateId) {
		return [];
	}
	const normalizedTemplateId = templateId.trim();
	if (normalizedTemplateId.startsWith('={{') || normalizedTemplateId.includes('{{')) {
		return [];
	}

	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/templates/${encodeURIComponent(normalizedTemplateId)}`,
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		json: true,
	});

	const variables = response?.variables ?? [];

	return variables
		.filter((variable: { key?: string }) => variable?.key)
		.map((variable: { key: string; type?: string }) => {
			const typeLabel = variable.type ? ` (${variable.type})` : '';
			return {
				name: `${variable.key}${typeLabel}`,
				value: variable.key,
			};
		});
}

export async function getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/templates');
}

export async function getSegments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/segments');
}

export async function getTopics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/topics');
}

export async function getAudiences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/audiences');
}

export async function getBroadcasts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/broadcasts');
}

export async function getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/contacts');
}

export async function getDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/domains');
}

export async function getWebhooks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/webhooks');
}

export async function getApiKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/api-keys');
}

export async function getContactProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/contact-properties');
}

export async function getEmails(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/emails');
}

export async function getReceivedEmails(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/emails/received');
}

// ListSearch wrapper functions for resourceLocator
// These convert the loadOptions format to listSearch format

/**
 * Generic wrapper to convert loadOptions methods to listSearch format
 */
async function wrapForListSearch(
	loadOptionsFunctions: ILoadOptionsFunctions,
	loadOptionsMethod: () => Promise<INodePropertyOptions[]>,
	filter?: string,
): Promise<INodeListSearchResult> {
	const options = await loadOptionsMethod.call(loadOptionsFunctions);

	let filteredOptions = options;
	if (filter) {
		const filterLower = filter.toLowerCase();
		filteredOptions = options.filter(option =>
			option.name.toLowerCase().includes(filterLower) ||
			option.value.toString().toLowerCase().includes(filterLower)
		);
	}

	return {
		results: filteredOptions.map(option => ({
			name: option.name,
			value: option.value,
		}))
	};
}

export async function getApiKeysListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getApiKeys, filter);
}

export async function getAudiencesListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getAudiences, filter);
}

export async function getBroadcastsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getBroadcasts, filter);
}

export async function getContactPropertiesListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getContactProperties, filter);
}

export async function getContactsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getContacts, filter);
}

export async function getDomainsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getDomains, filter);
}

export async function getEmailsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getEmails, filter);
}

export async function getReceivedEmailsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getReceivedEmails, filter);
}

export async function getSegmentsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getSegments, filter);
}

export async function getTemplatesListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getTemplates, filter);
}

export async function getTopicsListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getTopics, filter);
}

export async function getWebhooksListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getWebhooks, filter);
}
