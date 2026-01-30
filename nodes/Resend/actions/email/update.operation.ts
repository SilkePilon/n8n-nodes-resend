import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ae2014de-c168-4c61-8267-70d2662a1ce1',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['update'],
			},
		},
		description: 'The ID of the email to update',
	},
	{
		displayName: 'Scheduled At',
		name: 'scheduled_at',
		type: 'string',
		default: '',
		placeholder: '2024-08-05T11:52:01.858Z',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['update'],
			},
		},
		description:
			'Schedule email to be sent later. The date should be in ISO 8601 format (e.g., 2024-08-05T11:52:01.858Z).',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('emailId', index) as string;
	const scheduledAt = this.getNodeParameter('scheduled_at', index) as string;

	const body: IDataObject = {};
	if (scheduledAt) {
		body.scheduled_at = scheduledAt;
	}

	const response = await apiRequest.call(this, 'PATCH', `/emails/${emailId}`, body);

	return [{ json: response }];
}
