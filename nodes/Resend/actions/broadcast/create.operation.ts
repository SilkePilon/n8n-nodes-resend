import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'seg_123456',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['create'],
			},
		},
		description: 'The unique identifier of the segment to target with this broadcast. Obtain from the List Segments operation. All contacts in this segment will receive the broadcast.',
	},
	{
		displayName: 'From',
		name: 'broadcastFrom',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'you@example.com',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['create'],
			},
		},
		description:
			'Sender email address for the broadcast. Must be from a verified domain. To include a friendly name, use the format "Your Name &lt;sender@domain.com&gt;".',
	},
	{
		displayName: 'Subject',
		name: 'broadcastSubject',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Newsletter Subject',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['create'],
			},
		},
		description: 'The subject line of the broadcast email. Keep it concise and compelling to maximize open rates.',
	},
	{
		displayName: 'HTML Content',
		name: 'broadcastHtml',
		type: 'string',
		required: true,
		default: '',
		typeOptions: {
			multiline: true,
		},
		placeholder:
			'<p>Your HTML content here with {{{FIRST_NAME|there}}} and {{{RESEND_UNSUBSCRIBE_URL}}}</p>',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['create'],
			},
		},
		description:
			'The HTML content of the broadcast email. Use variables like {{{FIRST_NAME|fallback}}} for personalization and {{{RESEND_UNSUBSCRIBE_URL}}} for the required unsubscribe link.',
	},
	{
		displayName: 'Create Options',
		name: 'broadcastCreateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['create'],
			},
		},
		options: [
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
				displayName: 'Text Content',
				name: 'text',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: 'Your plain text content here',
				description: 'Plain text version of the email for clients that do not support HTML. If omitted, Resend will auto-generate from the HTML content.',
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
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const from = this.getNodeParameter('broadcastFrom', index) as string;
	const subject = this.getNodeParameter('broadcastSubject', index) as string;
	const html = this.getNodeParameter('broadcastHtml', index) as string;
	const createOptions = this.getNodeParameter('broadcastCreateOptions', index, {}) as {
		name?: string;
		reply_to?: string;
		text?: string;
		topic_id?: string;
	};

	const body: IDataObject = {
		segment_id: segmentId,
		from,
		subject,
		html,
	};

	if (createOptions.name) {
		body.name = createOptions.name;
	}
	if (createOptions.reply_to) {
		body.reply_to = createOptions.reply_to;
	}
	if (createOptions.text) {
		body.text = createOptions.text;
	}
	if (createOptions.topic_id) {
		body.topic_id = createOptions.topic_id;
	}

	const response = await apiRequest.call(this, 'POST', '/broadcasts', body);

	return [{ json: response }];
}
