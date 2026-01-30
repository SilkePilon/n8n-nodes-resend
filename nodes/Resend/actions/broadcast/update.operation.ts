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
				operation: ['update'],
			},
		},
		description: 'The ID of the broadcast',
	},
	{
		displayName: 'Update Fields',
		name: 'broadcastUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: 'you@example.com',
				description: 'Sender email address',
			},
			{
				displayName: 'HTML Content',
				name: 'html',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: '<p>Your HTML content here</p>',
				description: 'The HTML version of the message',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'Internal broadcast name',
				description: 'The friendly name of the broadcast. Only used for internal reference.',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				placeholder: 'noreply@example.com',
				description: 'Reply-to email address. For multiple addresses, use comma-separated values.',
			},
			{
				displayName: 'Segment ID',
				name: 'segment_id',
				type: 'string',
				default: '',
				placeholder: 'seg_123456',
				description: 'The ID of the segment you want to send to',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'Newsletter Subject',
				description: 'Email subject',
			},
			{
				displayName: 'Text Content',
				name: 'text',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: 'Your plain text content here',
				description: 'The plain text version of the message',
			},
			{
				displayName: 'Topic ID',
				name: 'topic_id',
				type: 'string',
				default: '',
				placeholder: 'topic_123456',
				description: 'Topic ID that the broadcast will be scoped to',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const broadcastId = this.getNodeParameter('broadcastId', index) as string;
	const updateFields = this.getNodeParameter('broadcastUpdateFields', index, {}) as IDataObject;

	const response = await apiRequest.call(
		this,
		'PATCH',
		`/broadcasts/${broadcastId}`,
		updateFields,
	);

	return [{ json: response }];
}
