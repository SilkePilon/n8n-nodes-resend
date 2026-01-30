import { INodeProperties } from 'n8n-workflow';
import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contactProperties'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a contact property',
				action: 'Create a contact property',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact property',
				action: 'Delete a contact property',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a contact property',
				action: 'Get a contact property',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List contact properties',
				action: 'List contact properties',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact property',
				action: 'Update a contact property',
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
];

export { create, get, list, update, del as delete };
export { execute } from './execute';
