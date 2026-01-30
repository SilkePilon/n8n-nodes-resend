import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest, assertHttpsEndpoint } from '../../transport';
import { webhookEventOptions } from './index';

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
				operation: ['update'],
			},
		},
		description: 'The ID of the webhook',
	},
	{
		displayName: 'Update Fields',
		name: 'webhookUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhooks'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/webhooks/resend',
				description: 'Public HTTPS URL where webhook events will be delivered',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: ['email.sent'],
				options: webhookEventOptions,
				description: 'Events that should trigger webhook delivery',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'enabled',
				options: [
					{ name: 'Enabled', value: 'enabled' },
					{ name: 'Disabled', value: 'disabled' },
				],
				description: 'Whether the webhook should be enabled or disabled',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const updateFields = this.getNodeParameter('webhookUpdateFields', index, {}) as {
		endpoint?: string;
		events?: string[];
		status?: string;
	};

	if (updateFields.endpoint) {
		assertHttpsEndpoint(updateFields.endpoint);
	}

	const response = await apiRequest.call(this, 'PATCH', `/webhooks/${webhookId}`, updateFields);

	return [{ json: response }];
}
