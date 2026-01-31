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
				description: 'Create a new contact segment for grouping contacts based on criteria or manual assignment',
				action: 'Create a contact segment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a segment by its segment ID. Contacts in the segment are not deleted.',
				action: 'Delete a segment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve details of a specific segment including its name, contact count, and creation date',
				action: 'Get segment details',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all segments in the account with their names, IDs, and contact counts',
				action: 'List all segments',
			},
		],
		default: 'list',
	},
	...create.description,
	...get.description,
	...list.description,
	...deleteSegment.description,
];
