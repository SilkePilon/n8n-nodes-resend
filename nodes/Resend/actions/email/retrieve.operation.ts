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
				operation: ['retrieve'],
			},
		},
		description: 'The unique identifier of the email to retrieve details for. Obtain from the Send Email response or List Emails operation. Returns email metadata including delivery status, timestamps, and recipient information.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('emailId', index) as string;

	const response = await apiRequest.call(this, 'GET', `/emails/${emailId}`);

	return [{ json: response }];
}
