import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['delete'],
			},
		},
		description: 'The unique identifier of the webhook to delete. This action is permanent and the webhook will immediately stop receiving events.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);

	return [{ json: response }];
}
