import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'broadcastId',
		resourceName: 'broadcast',
		displayName: 'Broadcast',
		required: true,
		placeholder: 'bc_123456',
		description: 'The unique identifier of the broadcast to update. Only unsent broadcasts can be modified. Obtain from the Create Broadcast response.',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['update'],
			},
		},
	}),
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
			description: 'Sender email address for the broadcast. Must be from a verified domain. Format: "Name &lt;email@domain.com&gt;" or just "email@domain.com".',
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
				description: 'The HTML body of the broadcast email. Use {{{VARIABLE|fallback}}} for personalization and include {{{RESEND_UNSUBSCRIBE_URL}}} for the required unsubscribe link.',
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
				name: 'replyTo',
				type: 'string',
				default: '',
				placeholder: 'noreply@example.com',
				description: 'Reply-to email address. For multiple addresses, use comma-separated values.',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'Newsletter Subject',
				description: 'Email subject line. Keep concise and compelling to maximize open rates.',
			},
			{
				displayName: 'Target Segment',
				name: 'segmentId',
				type: 'string',
				default: '',
				placeholder: 'seg_123456',
				typeOptions: {
					loadOptionsMethod: 'getSegments',
				},
				description: 'The segment to target. All contacts in this segment will receive the broadcast.',
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
				description: 'Plain text version of the email for clients that do not support HTML. If omitted, Resend will auto-generate from HTML.',
			},
			{
				displayName: 'Topic',
				name: 'topicId',
				type: 'string',
				default: '',
				placeholder: 'topic_123456',
				typeOptions: {
					loadOptionsMethod: 'getTopics',
				},
				description: 'Topic to scope the broadcast to',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const broadcastId = resolveDynamicIdValue(this, 'broadcastId', index);
	const updateFields = this.getNodeParameter('broadcastUpdateFields', index, {}) as IDataObject;

	const response = await apiRequest.call(
		this,
		'PATCH',
		`/broadcasts/${encodeURIComponent(broadcastId)}`,
		updateFields,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
