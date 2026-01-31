import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'receivedEmailIdForAttachment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'email_123456',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['getAttachment'],
			},
		},
		description: 'The unique identifier of the received email containing the attachment. Obtain from the List Receiving Emails operation.',
	},
	{
		displayName: 'Attachment ID',
		name: 'receivedAttachmentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'att_123456',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['getAttachment'],
			},
		},
		description: 'The unique identifier of the attachment to retrieve. Obtain from the List Receiving Email Attachments operation.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('receivedEmailIdForAttachment', index) as string;
	const attachmentId = this.getNodeParameter('receivedAttachmentId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
