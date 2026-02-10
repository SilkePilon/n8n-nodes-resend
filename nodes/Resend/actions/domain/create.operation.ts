import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'After adding a domain, you must configure DNS records (SPF, DKIM, DMARC) and verify the domain before sending emails.',
		name: 'domainNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['domains'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		displayOptions: {
			show: {
				resource: ['domains'],
				operation: ['create'],
			},
		},
		description: 'The domain name to add to Resend (e.g., example.com). After adding, you must configure DNS records to verify ownership before sending emails.',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['domains'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Region',
				name: 'region',
				type: 'options',
				options: [
					{ name: 'US East 1', value: 'us-east-1' },
					{ name: 'EU West 1', value: 'eu-west-1' },
					{ name: 'South America East 1', value: 'sa-east-1' },
					{ name: 'Asia Pacific Northeast 1', value: 'ap-northeast-1' },
				],
				default: 'us-east-1',
				description: 'The AWS region where emails will be sent from. Choose a region closest to your recipients for better deliverability.',
			},
			{
				displayName: 'Custom Return Path',
				name: 'custom_return_path',
				type: 'string',
				default: 'send',
				description: 'Custom subdomain for email bounce handling (Return-Path address). Defaults to "send". This subdomain needs to be configured in your DNS.',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('domainName', index) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as {
		region?: string;
		custom_return_path?: string;
	};

	const body: IDataObject = { name };

	if (additionalOptions.region) {
		body.region = additionalOptions.region;
	}
	if (additionalOptions.custom_return_path) {
		body.custom_return_path = additionalOptions.custom_return_path;
	}

	const response = await apiRequest.call(this, 'POST', '/domains', body);

	return [{ json: response, pairedItem: { item: index } }];
}
