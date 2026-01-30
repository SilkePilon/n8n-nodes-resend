import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'emailIdForAttachment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['getAttachment'],
			},
		},
		description: 'The ID of the sent email',
	},
	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['email'],
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
	const emailId = this.getNodeParameter('emailIdForAttachment', index) as string;
	const attachmentId = this.getNodeParameter('attachmentId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
