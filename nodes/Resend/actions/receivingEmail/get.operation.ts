import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'receivedEmailId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'email_123456',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['get'],
			},
		},
		description: 'The unique identifier of the received email to retrieve. Obtain from the List Receiving Emails operation or webhook payload. Returns full email details including sender, subject, body, and headers.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('receivedEmailId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/receiving/${encodeURIComponent(emailId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
