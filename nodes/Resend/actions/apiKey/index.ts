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
				description: 'Create a new API key',
				action: 'Create an API key',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an API key',
				action: 'Delete an API key',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all API keys',
				action: 'List API keys',
			},
		],
		default: 'list',
	},
	...create.description,
	...list.description,
	...deleteApiKey.description,
];
