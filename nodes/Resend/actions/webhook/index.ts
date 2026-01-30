import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';

export const webhookEventOptions: INodePropertyOptions[] = [
	{ name: 'Contact Created', value: 'contact.created' },
	{ name: 'Contact Deleted', value: 'contact.deleted' },
	{ name: 'Contact Updated', value: 'contact.updated' },
	{ name: 'Domain Created', value: 'domain.created' },
	{ name: 'Domain Deleted', value: 'domain.deleted' },
	{ name: 'Domain Updated', value: 'domain.updated' },
	{ name: 'Email Bounced', value: 'email.bounced' },
	{ name: 'Email Clicked', value: 'email.clicked' },
	{ name: 'Email Complained', value: 'email.complained' },
	{ name: 'Email Delivered', value: 'email.delivered' },
	{ name: 'Email Delivery Delayed', value: 'email.delivery_delayed' },
	{ name: 'Email Opened', value: 'email.opened' },
	{ name: 'Email Sent', value: 'email.sent' },
];

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhooks'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a webhook',
				action: 'Get a webhook',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List webhooks',
				action: 'List webhooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook',
				action: 'Update a webhook',
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
