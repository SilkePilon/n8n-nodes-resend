import type { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as list from './list.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

export { get, list, listAttachments, getAttachment };
export { execute } from './execute';

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['receivingEmails'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a received email by ID',
				action: 'Get a received email',
			},
			{
				name: 'Get Attachment',
				value: 'getAttachment',
				description: 'Get an attachment from a received email',
				action: 'Get an attachment from received email',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all received emails',
				action: 'List received emails',
			},
			{
				name: 'List Attachments',
				value: 'listAttachments',
				description: 'List attachments for a received email',
				action: 'List attachments for received email',
			},
		],
		default: 'list',
	},
	...list.description,
	...get.description,
	...listAttachments.description,
	...getAttachment.description,
];
