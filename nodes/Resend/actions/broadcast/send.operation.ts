import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'bc_123456',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['send'],
			},
		},
		description: 'The unique identifier of the broadcast to send. Obtain from the Create Broadcast response. The broadcast will be sent to all contacts in its target segment.',
	},
	{
		displayName: 'Send Options',
		name: 'broadcastSendOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'string',
				default: '',
				placeholder: 'in 1 min',
				description: 'Schedule the broadcast for future delivery. Accepts natural language (e.g., "in 1 hour", "tomorrow at 9am") or ISO 8601 format. Leave empty to send immediately.',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const broadcastId = this.getNodeParameter('broadcastId', index) as string;
	const sendOptions = this.getNodeParameter('broadcastSendOptions', index, {}) as {
		scheduled_at?: string;
	};

	const body: IDataObject = {};

	if (sendOptions.scheduled_at) {
		body.scheduled_at = sendOptions.scheduled_at;
	}

	const response = await apiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/send`, body);

	return [{ json: response }];
}
