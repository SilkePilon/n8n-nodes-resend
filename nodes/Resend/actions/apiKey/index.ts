import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as list from './list.operation';
import * as deleteApiKey from './delete.operation';

export { create, list, deleteApiKey };
export { execute } from './execute';

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['apiKeys'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Generate a new API key with specified permissions for authenticating with the Resend API',
				action: 'Create a new API key',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Revoke and permanently delete an API key. Any applications using this key will lose access.',
				action: 'Delete an API key',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all API keys in your account with their names, permissions, and creation dates',
				action: 'List all API keys',
			},
		],
		default: 'list',
	},
	...create.description,
	...list.description,
	...deleteApiKey.description,
];
