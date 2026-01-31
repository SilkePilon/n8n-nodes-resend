import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdUpdateTopics',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation.',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdUpdateTopics',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
		description: 'The unique identifier of the contact whose topic subscriptions to update. Allows subscribing or unsubscribing from multiple topics.',
	},
	{
		displayName: 'Topics',
		name: 'topicsToUpdate',
		type: 'fixedCollection',
		required: true,
		default: { topics: [] },
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
		options: [
			{
				name: 'topics',
				displayName: 'Topic',
				values: [
					{
						displayName: 'Topic ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'topic_123456',
						description: 'The unique identifier of the topic. Obtain from the List Topics operation.',
					},
					{
						displayName: 'Subscribed',
						name: 'subscribed',
						type: 'boolean',
						required: true,
						default: true,
						description: 'Whether the contact should be subscribed (true) or unsubscribed (false) from this topic. Unsubscribed contacts will not receive emails scoped to this topic.',
					},
				],
			},
		],
		description: 'List of topics to update subscription status for. Each topic requires its ID and a boolean subscribed value.',
	},
];

interface TopicItem {
	id: string;
	subscribed: boolean;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceIdUpdateTopics', index) as string;
	const contactId = this.getNodeParameter('contactIdUpdateTopics', index) as string;
	const topicsInput = this.getNodeParameter('topicsToUpdate', index, { topics: [] }) as {
		topics: TopicItem[];
	};

	const body: IDataObject = {
		topics: topicsInput.topics.map((t) => ({
			id: t.id,
			subscribed: t.subscribed,
		})),
	};

	const response = await apiRequest.call(
		this,
		'PATCH',
		`/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactId)}/topics`,
		body,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
