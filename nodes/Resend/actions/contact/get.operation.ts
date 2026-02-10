import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceIdGet',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience containing the contact. Contacts are scoped to audiences.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['get'],
			},
		},
	}),
	createDynamicIdField({
		fieldName: 'contactIdentifier',
		resourceName: 'contact',
		displayName: 'Contact',
		required: true,
		placeholder: 'e169aa45-1ecf-4183-9955-b1499d5701d3 or contact@example.com',
		description: 'The contact to retrieve, specified by either UUID (e.g., e169aa45-1ecf-4183-9955-b1499d5701d3) or email address (e.g., contact@example.com). Returns full contact details including name, subscription status, and custom properties.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['get'],
			},
		},
	}),
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = resolveDynamicIdValue(this, 'audienceIdGet', index);
	const contactIdentifier = resolveDynamicIdValue(this, 'contactIdentifier', index);

	const response = await apiRequest.call(this, 'GET', `/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactIdentifier)}`);

	return [{ json: response, pairedItem: { item: index } }];
}
