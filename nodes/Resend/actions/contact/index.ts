import { INodeProperties } from 'n8n-workflow';
import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';
import * as addToSegment from './addToSegment.operation';
import * as listSegments from './listSegments.operation';
import * as removeFromSegment from './removeFromSegment.operation';
import * as getTopics from './getTopics.operation';
import * as updateTopics from './updateTopics.operation';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contacts'],
			},
		},
		options: [
			{
				name: 'Add to Segment',
				value: 'addToSegment',
				description: 'Add a contact to a segment',
				action: 'Add contact to segment',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create a contact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete a contact',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a contact by ID',
				action: 'Get a contact',
			},
			{
				name: 'Get Topics',
				value: 'getTopics',
				description: 'Get topics for a contact',
				action: 'Get contact topics',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List contacts',
				action: 'List contacts',
			},
			{
				name: 'List Segments',
				value: 'listSegments',
				description: 'List segments for a contact',
				action: 'List contact segments',
			},
			{
				name: 'Remove From Segment',
				value: 'removeFromSegment',
				description: 'Remove a contact from a segment',
				action: 'Remove contact from segment',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update a contact',
			},
			{
				name: 'Update Topics',
				value: 'updateTopics',
				description: 'Update topic subscriptions for a contact',
				action: 'Update contact topics',
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
	...addToSegment.description,
	...listSegments.description,
	...removeFromSegment.description,
	...getTopics.description,
	...updateTopics.description,
];

export { create, get, list, update, del as delete, addToSegment, listSegments, removeFromSegment, getTopics, updateTopics };
export { execute } from './execute';
