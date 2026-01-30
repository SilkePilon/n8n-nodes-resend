import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience Name',
		name: 'audienceName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Registered Users',
		displayOptions: {
			show: {
				resource: ['audiences'],
				operation: ['create'],
			},
		},
		description: 'The name of the audience',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceName = this.getNodeParameter('audienceName', index) as string;

	const response = await apiRequest.call(this, 'POST', '/audiences', {
		name: audienceName,
	});

	return [{ json: response, pairedItem: { item: index } }];
}
