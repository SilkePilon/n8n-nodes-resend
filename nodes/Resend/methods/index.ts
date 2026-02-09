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
	const getParameterValue = (name: string): string | undefined => {
		const currentParameters = this.getCurrentNodeParameters();

		const paramValue = currentParameters?.[name];
		if (paramValue && typeof paramValue === 'object' && 'value' in paramValue) {
			return getStringValue((paramValue as { value: unknown }).value);
		}

		const fromCurrentParameters = getStringValue(paramValue);
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

/**
 * Contacts are scoped to audiences. This method reads the currently selected
 * audience ID from node parameters and fetches contacts from that audience.
 */
export async function getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	// Helper to safely get string value
	const getStringValue = (value: unknown) =>
		typeof value === 'string' && value.trim() ? value : undefined;

	const safeGet = (getter: () => unknown) => {
		try {
			return getter();
		} catch {
			return undefined;
		}
	};

	// Try to get audience ID from various possible parameter names
	const getParameterValue = (name: string): string | undefined => {
		const currentParameters = this.getCurrentNodeParameters();

		// Check if it's a resourceLocator object
		const paramValue = currentParameters?.[name];
		if (paramValue && typeof paramValue === 'object' && 'value' in paramValue) {
			return getStringValue((paramValue as { value: unknown }).value);
		}

		const fromCurrentParameters = getStringValue(paramValue);
		if (fromCurrentParameters) {
			return fromCurrentParameters;
		}

		const fromCurrentNodeParameter = getStringValue(
			safeGet(() => this.getCurrentNodeParameter(name)),
		);
		if (fromCurrentNodeParameter) {
			return fromCurrentNodeParameter;
		}

		return undefined;
	};

	// Check all possible audience field names used across contact operations
	const audienceFieldNames = [
		'audienceIdCreate',
		'audienceIdList',
		'audienceIdGet',
		'audienceIdUpdate',
		'audienceIdDelete',
		'audienceIdAddSegment',
		'audienceIdListSegments',
		'audienceIdRemoveSegment',
		'audienceIdGetTopics',
		'audienceIdUpdateTopics',
		'audienceId',
	];

	let audienceId: string | undefined;
	for (const fieldName of audienceFieldNames) {
		audienceId = getParameterValue(fieldName);
		if (audienceId) break;
	}

	if (!audienceId) {
		// No audience selected yet, return empty list
		return [];
	}

	// Skip if it's an expression
	if (audienceId.startsWith('={{') || audienceId.includes('{{')) {
		return [];
	}

	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	try {
		const response = await this.helpers.httpRequest({
			url: `${RESEND_API_BASE}/audiences/${encodeURIComponent(audienceId)}/contacts`,
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
			.map((item: { id: string; email?: string; first_name?: string; last_name?: string }) => {
				const displayParts: string[] = [];
				if (item.first_name || item.last_name) {
					displayParts.push([item.first_name, item.last_name].filter(Boolean).join(' '));
				}
				if (item.email) {
					displayParts.push(item.email);
				}
				const displayName = displayParts.length > 0
					? `${displayParts.join(' - ')} (${item.id})`
					: item.id;
				return {
					name: displayName,
					value: item.id,
				};
			});
	} catch {
		// If API call fails (e.g., invalid audience ID), return empty list
		return [];
	}
}

export async function getDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/domains');
}

/**
 * Load webhooks with endpoint URL in display name.
 */
export async function getWebhooks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/webhooks`,
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
		.map((item: { id: string; endpoint?: string; status?: string }) => {
			let displayName = item.id;
			if (item.endpoint) {
				// Truncate long URLs for display
				const shortEndpoint = item.endpoint.length > 50
					? item.endpoint.substring(0, 47) + '...'
					: item.endpoint;
				const statusLabel = item.status ? ` [${item.status}]` : '';
				displayName = `${shortEndpoint}${statusLabel} (${item.id})`;
			}
			return { name: displayName, value: item.id };
		});
}

export async function getApiKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/api-keys');
}

export async function getContactProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return loadDropdownOptions(this, '/contact-properties');
}

/**
 * Load sent emails with subject and date in display name.
 */
export async function getEmails(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/emails`,
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
		.map((item: { id: string; subject?: string; created_at?: string }) => {
			const parts: string[] = [];
			if (item.subject) {
				// Truncate long subjects
				parts.push(item.subject.length > 50 ? item.subject.substring(0, 47) + '...' : item.subject);
			}
			if (item.created_at) {
				// Format date as DD/MM/YYYY
				const date = new Date(item.created_at);
				const day = date.getDate().toString().padStart(2, '0');
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const year = date.getFullYear();
				parts.push(`${day}/${month}/${year}`);
			}
			const displayName = parts.length > 0
				? `${parts.join(' - ')} (${item.id})`
				: item.id;
			return { name: displayName, value: item.id };
		});
}

/**
 * Load received emails with subject and date in display name.
 */
export async function getReceivedEmails(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/emails/receiving`,
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
		.map((item: { id: string; subject?: string; created_at?: string }) => {
			const parts: string[] = [];
			if (item.subject) {
				// Truncate long subjects
				parts.push(item.subject.length > 50 ? item.subject.substring(0, 47) + '...' : item.subject);
			}
			if (item.created_at) {
				// Format date as DD/MM/YYYY
				const date = new Date(item.created_at);
				const day = date.getDate().toString().padStart(2, '0');
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const year = date.getFullYear();
				parts.push(`${day}/${month}/${year}`);
			}
			const displayName = parts.length > 0
				? `${parts.join(' - ')} (${item.id})`
				: item.id;
			return { name: displayName, value: item.id };
		});
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

export async function getTemplateVariablesListSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return wrapForListSearch(this, getTemplateVariables, filter);
}
