import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Topic Name or ID',
		name: 'topicId',
		type: 'options',
		required: true,
		default: '',
		placeholder: 'topic_123456',
		typeOptions: {
			loadOptionsMethod: 'getTopics',
		},
		displayOptions: {
			show: {
				resource: ['topics'],
				operation: ['update'],
			},
		},
		description:
			'Select a topic or enter an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Update Fields',
		name: 'topicUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['topics'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the topic',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the topic',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				default: 'private',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
				],
				description: 'Visibility on the unsubscribe page',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const topicId = this.getNodeParameter('topicId', index) as string;
	const updateFields = this.getNodeParameter('topicUpdateFields', index, {}) as {
		name?: string;
		description?: string;
		visibility?: string;
	};

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}
	if (updateFields.description) {
		body.description = updateFields.description;
	}
	if (updateFields.visibility) {
		body.visibility = updateFields.visibility;
	}

	const response = await apiRequest.call(this, 'PATCH', `/topics/${topicId}`, body);

	return [{ json: response }];
}
