import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Segment Name',
		name: 'segmentName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Registered Users',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
		description: 'The name of the segment',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentName = this.getNodeParameter('segmentName', index) as string;

	const response = await apiRequest.call(this, 'POST', '/segments', {
		name: segmentName,
	});

	return [{ json: response, pairedItem: { item: index } }];
}
