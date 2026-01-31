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
				operation: ['get'],
			},
		},
		description: 'The unique identifier of the broadcast to retrieve. Obtain from the Create Broadcast response or List Broadcasts operation. Returns full broadcast details including content and status.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const broadcastId = this.getNodeParameter('broadcastId', index) as string;

	const response = await apiRequest.call(this, 'GET', `/broadcasts/${broadcastId}`);

	return [{ json: response }];
}
