import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceIdUpdateTopics',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience containing the contact to update topic subscriptions.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
	}),
	createDynamicIdField({
		fieldName: 'contactIdUpdateTopics',
		resourceName: 'contact',
		displayName: 'Contact',
		required: true,
		placeholder: 'con_123456',
		description: 'The contact whose topic subscriptions to update.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['updateTopics'],
			},
		},
	}),
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
						displayName: 'Topic',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'topic_123456',
						typeOptions: {
							loadOptionsMethod: 'getTopics',
						},
						description: 'The topic to update subscription for',
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
	const audienceId = resolveDynamicIdValue(this, 'audienceIdUpdateTopics', index);
	const contactId = resolveDynamicIdValue(this, 'contactIdUpdateTopics', index);
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
