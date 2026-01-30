import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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
				operation: ['delete'],
			},
		},
		description:
			'Select a topic or enter an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const topicId = this.getNodeParameter('topicId', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/topics/${topicId}`);

	return [{ json: response }];
}
