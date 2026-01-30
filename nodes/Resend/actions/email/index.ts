import { INodeProperties } from 'n8n-workflow';
import * as send from './send.operation';
import * as sendBatch from './sendBatch.operation';
import * as list from './list.operation';
import * as retrieve from './retrieve.operation';
import * as update from './update.operation';
import * as cancel from './cancel.operation';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a scheduled email',
				action: 'Cancel an email',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List sent emails',
				action: 'List emails',
			},
			{
				name: 'Retrieve',
				value: 'retrieve',
				description: 'Retrieve an email by ID',
				action: 'Retrieve an email',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send an email',
				action: 'Send an email',
			},
			{
				name: 'Send Batch',
				value: 'sendBatch',
				description: 'Send multiple emails at once',
				action: 'Send batch emails',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an email',
				action: 'Update an email',
			},
		],
		default: 'send',
	},
];

export const descriptions: INodeProperties[] = [
	...operations,
	...send.description,
	...sendBatch.description,
	...list.description,
	...retrieve.description,
	...update.description,
	...cancel.description,
];

export { execute } from './execute';
export { send, sendBatch, list, retrieve, update, cancel };
