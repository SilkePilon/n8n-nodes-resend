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
				resource: ['templates'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new template',
				action: 'Create a template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a template',
				action: 'Delete a template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a template by ID',
				action: 'Get a template',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all templates',
				action: 'List templates',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a template',
				action: 'Update a template',
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
