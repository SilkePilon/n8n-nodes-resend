import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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
				operation: ['cancel'],
			},
		},
		description: 'The unique identifier of the scheduled email to cancel. Only works for emails that have been scheduled for future delivery and have not yet been sent.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('emailId', index) as string;

	const response = await apiRequest.call(this, 'POST', `/emails/${emailId}/cancel`);

	return [{ json: response }];
}
