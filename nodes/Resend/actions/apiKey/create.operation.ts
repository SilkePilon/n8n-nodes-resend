import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'API Key Name',
		name: 'apiKeyName',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		placeholder: 'My API Key',
		displayOptions: {
			show: {
				resource: ['apiKeys'],
				operation: ['create'],
			},
		},
		description: 'A descriptive name for the API key (e.g., Production Emails, Dev Testing). Helps identify the key in the dashboard.',
	},
	{
		displayName: 'Permission',
		name: 'permission',
		type: 'options',
		options: [
			{ name: 'Full Access', value: 'full_access' },
			{ name: 'Sending Access', value: 'sending_access' },
		],
		default: 'full_access',
		displayOptions: {
			show: {
				resource: ['apiKeys'],
				operation: ['create'],
			},
		},
		description: 'Permission level for the API key. Full Access allows all operations; Sending Access only allows sending emails (optionally restricted to a specific domain).',
	},
	{
		displayName: 'Domain ID',
		name: 'domainId',
		type: 'string',
		default: '',
		placeholder: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
		displayOptions: {
			show: {
				resource: ['apiKeys'],
				operation: ['create'],
				permission: ['sending_access'],
			},
		},
		description:
			'Optional: Restrict this API key to only send emails from a specific verified domain. Obtain the Domain ID from the List Domains operation.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const apiKeyName = this.getNodeParameter('apiKeyName', index) as string;
	const permission = this.getNodeParameter('permission', index) as string;
	const domainId = this.getNodeParameter('domainId', index, '') as string;

	const requestBody: IDataObject = {
		name: apiKeyName,
		permission,
	};

	if (permission === 'sending_access' && domainId) {
		requestBody.domain_id = domainId;
	}

	const response = await apiRequest.call(this, 'POST', '/api-keys', requestBody);

	return [{ json: response, pairedItem: { item: index } }];
}
