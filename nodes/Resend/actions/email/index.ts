import { INodeProperties, SEND_AND_WAIT_OPERATION } from 'n8n-workflow';
import * as send from './send.operation';
import * as sendBatch from './sendBatch.operation';
import * as sendAndWait from './sendAndWait.operation';
import * as list from './list.operation';
import * as retrieve from './retrieve.operation';
import * as update from './update.operation';
import * as cancel from './cancel.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

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
				name: 'Get Attachment',
				value: 'getAttachment',
				description: 'Get an attachment from a sent email',
				action: 'Get an attachment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List sent emails',
				action: 'List emails',
			},
			{
				name: 'List Attachments',
				value: 'listAttachments',
				description: 'List attachments for a sent email',
				action: 'List attachments',
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
				name: 'Send and Wait for Response',
				value: SEND_AND_WAIT_OPERATION,
				description: 'Send an email and wait for the recipient to respond',
				action: 'Send message and wait for response',
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
	...sendAndWait.description,
	...sendBatch.description,
	...list.description,
	...retrieve.description,
	...update.description,
	...cancel.description,
	...listAttachments.description,
	...getAttachment.description,
];

export { execute } from './execute';
export { send, sendAndWait, sendBatch, list, retrieve, update, cancel, listAttachments, getAttachment };
