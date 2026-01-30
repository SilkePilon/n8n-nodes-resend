import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as deleteSegment from './delete.operation';

export { create, get, list, deleteSegment };
export { execute } from './execute';

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['segments'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new segment',
				action: 'Create a segment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a segment',
				action: 'Delete a segment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a segment by ID',
				action: 'Get a segment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all segments',
				action: 'List segments',
			},
		],
		default: 'list',
	},
	...create.description,
	...get.description,
	...list.description,
	...deleteSegment.description,
];
