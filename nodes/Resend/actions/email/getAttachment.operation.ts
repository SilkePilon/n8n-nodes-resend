import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'emailIdForAttachment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ae2014de-c168-4c61-8267-70d2662a1ce1',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['getAttachment'],
			},
		},
		description: 'The unique identifier of the sent email containing the attachment. Obtain from the Send Email response or List Emails operation.',
	},
	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'att_123456',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['getAttachment'],
			},
		},
		description: 'The unique identifier of the attachment to retrieve. Obtain from the List Attachments operation.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('emailIdForAttachment', index) as string;
	const attachmentId = this.getNodeParameter('attachmentId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
