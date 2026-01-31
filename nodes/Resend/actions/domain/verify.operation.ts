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
				operation: ['verify'],
			},
		},
		description: 'The unique identifier of the domain to verify. Triggers a verification check for the domain. Make sure DNS records are configured correctly before verifying.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const domainId = this.getNodeParameter('domainId', index) as string;

	const response = await apiRequest.call(this, 'POST', `/domains/${domainId}/verify`);

	return [{ json: response }];
}
