import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Domain ID',
		name: 'domainId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
		displayOptions: {
			show: {
				resource: ['domains'],
				operation: ['get'],
			},
		},
		description: 'The unique identifier of the domain to retrieve. Obtain from the Create Domain response or List Domains operation. Returns domain details including verification status and DNS records.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domainId = this.getNodeParameter('domainId', index) as string;

	const response = await apiRequest.call(this, 'GET', `/domains/${domainId}`);

	return [{ json: response }];
}
