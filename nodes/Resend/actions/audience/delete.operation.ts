import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['audiences'],
				operation: ['delete'],
			},
		},
		description: 'The unique identifier of the audience to delete. This action is permanent and will also delete all contacts and segments within this audience.',
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
