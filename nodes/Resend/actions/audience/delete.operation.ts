import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['audiences'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the audience to delete',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceId', index) as string;

	const response = await apiRequest.call(
		this,
		'DELETE',
		`/audiences/${encodeURIComponent(audienceId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
