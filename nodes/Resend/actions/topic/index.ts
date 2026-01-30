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
				resource: ['topics'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new topic',
				action: 'Create a topic',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a topic',
				action: 'Delete a topic',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a topic by ID',
				action: 'Get a topic',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all topics',
				action: 'List topics',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a topic',
				action: 'Update a topic',
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
