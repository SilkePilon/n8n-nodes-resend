import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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
				operation: ['delete'],
			},
		},
		description: 'The ID of the broadcast',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const broadcastId = this.getNodeParameter('broadcastId', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/broadcasts/${broadcastId}`);

	return [{ json: response }];
}
