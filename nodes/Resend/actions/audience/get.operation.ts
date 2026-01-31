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
				operation: ['get'],
			},
		},
		description: 'The unique identifier of the audience to retrieve. Obtain from the Create Audience response or List Audiences operation. Returns audience details including name and creation date.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceId', index) as string;

	const response = await apiRequest.call(
		this,
		'GET',
		`/audiences/${encodeURIComponent(audienceId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
