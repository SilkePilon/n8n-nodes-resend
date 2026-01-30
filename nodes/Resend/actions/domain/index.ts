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
				description: 'Create a new domain',
				action: 'Create a domain',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a domain',
				action: 'Delete a domain',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a domain by ID',
				action: 'Get a domain',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all domains',
				action: 'List domains',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a domain',
				action: 'Update a domain',
			},
			{
				name: 'Verify',
				value: 'verify',
				description: 'Verify a domain',
				action: 'Verify a domain',
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
