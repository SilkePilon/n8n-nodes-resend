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
				description: 'Create a new audience (contact list) for organizing and managing email recipients',
				action: 'Create an audience',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete an audience and all its contacts by audience ID',
				action: 'Delete an audience',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve details of a specific audience including its name, contact count, and creation date',
				action: 'Get audience details',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all audiences in the account with their names, IDs, and contact counts',
				action: 'List all audiences',
			},
		],
		default: 'list',
	},
	...create.description,
	...get.description,
	...list.description,
	...del.description,
];
