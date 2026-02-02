import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'receivedEmailIdForAttachment',
		resourceName: 'receivedEmail',
		displayName: 'Email',
		required: true,
		placeholder: 'email_123456',
		description: 'The received email containing the attachment. Obtain from the List Receiving Emails operation.',
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
				operation: ['getAttachment'],
			},
		},
	}),
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
	const emailId = resolveDynamicIdValue(this, 'receivedEmailIdForAttachment', index);
	const attachmentId = this.getNodeParameter('receivedAttachmentId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
