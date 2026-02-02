import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'apiKeyId',
		resourceName: 'apiKey',
		displayName: 'API Key',
		required: true,
		placeholder: 'key_123456',
		description: 'The API key to delete. This action is permanent and the key will immediately stop working. Obtain from the List API Keys operation.',
		displayOptions: {
			show: {
				resource: ['apiKeys'],
				operation: ['delete'],
			},
		},
	}),
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const apiKeyId = resolveDynamicIdValue(this, 'apiKeyId', index);

	const response = await apiRequest.call(this, 'DELETE', `/api-keys/${apiKeyId}`);

	return [{ json: response, pairedItem: { item: index } }];
}
