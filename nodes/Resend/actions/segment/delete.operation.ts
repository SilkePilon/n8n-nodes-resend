import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Segment Name or ID',
		name: 'segmentId',
		type: 'options',
		required: true,
		default: '',
		placeholder: 'seg_123456',
		typeOptions: {
			loadOptionsMethod: 'getSegments',
		},
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['delete'],
			},
		},
		description:
			'Select a segment or enter an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/segments/${segmentId}`);

	return [{ json: response, pairedItem: { item: index } }];
}
