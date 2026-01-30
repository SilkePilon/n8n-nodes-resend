import { INodeProperties } from 'n8n-workflow';
import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';
import * as send from './send.operation';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['broadcasts'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new broadcast',
				action: 'Create a broadcast',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a broadcast',
				action: 'Delete a broadcast',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a broadcast by ID',
				action: 'Get a broadcast',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all broadcasts',
				action: 'List broadcasts',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a broadcast',
				action: 'Send a broadcast',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a broadcast',
				action: 'Update a broadcast',
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
	...send.description,
];

export { create, get, list, update, del as delete, send };
export { execute } from './execute';
