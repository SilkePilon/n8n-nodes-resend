import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdUpdateTopics',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
		description: 'The ID of the audience the contact belongs to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdUpdateTopics',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
		description: 'The ID of the contact',
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
						description: 'The ID of the topic',
					},
					{
						displayName: 'Subscribed',
						name: 'subscribed',
						type: 'boolean',
						required: true,
						default: true,
						description: 'Whether the contact should be subscribed to this topic',
					},
				],
			},
		],
		description: 'Topics to update for the contact',
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
