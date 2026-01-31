import { INodeProperties } from 'n8n-workflow';
import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';
import * as verify from './verify.operation';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['domains'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add a new sending domain for email authentication. Returns DNS records that must be configured for verification.',
				action: 'Add a new sending domain',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove a sending domain from your account. Emails can no longer be sent from this domain after deletion.',
				action: 'Delete a domain',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve details of a domain including DNS records, verification status, and configuration',
				action: 'Get domain details',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all sending domains with their verification status and DNS record requirements',
				action: 'List all domains',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update domain settings such as click tracking, open tracking, or TLS requirements',
				action: 'Update domain settings',
			},
			{
				name: 'Verify',
				value: 'verify',
				description: 'Trigger verification of DNS records for a domain. Use after configuring DNS to check if domain is ready for sending.',
				action: 'Verify domain DNS records',
			},
		],
		default: 'list',
	},
];

export const descriptions: INodeProperties[] = [
	...operations,
	...create.description,
	...get.description,
	...list.description,
	...update.description,
	...del.description,
	...verify.description,
];

export { create, get, list, update, del as delete, verify };
export { execute } from './execute';
