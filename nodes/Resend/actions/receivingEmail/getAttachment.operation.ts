import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'receivedEmailIdForAttachment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['getAttachment'],
			},
		},
		description: 'The ID of the received email',
	},
	{
		displayName: 'Attachment ID',
		name: 'receivedAttachmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['getAttachment'],
			},
		},
		description: 'The ID of the attachment to retrieve',
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
