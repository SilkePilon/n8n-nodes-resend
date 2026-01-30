import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as del from './delete.operation';

export { create, get, list, del as delete };
export { execute } from './execute';

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['audiences'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new audience',
				action: 'Create an audience',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an audience',
				action: 'Delete an audience',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an audience by ID',
				action: 'Get an audience',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all audiences',
				action: 'List audiences',
			},
		],
		default: 'list',
	},
	...create.description,
	...get.description,
	...list.description,
	...del.description,
];
