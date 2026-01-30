import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'API Key ID',
		name: 'apiKeyId',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		placeholder: 'key_123456',
		displayOptions: {
			show: {
				resource: ['apiKeys'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the API key to delete',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const apiKeyId = this.getNodeParameter('apiKeyId', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/api-keys/${apiKeyId}`);

	return [{ json: response, pairedItem: { item: index } }];
}
