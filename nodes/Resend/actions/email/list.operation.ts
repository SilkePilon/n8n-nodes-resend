import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { requestList, createListExecutionData } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['list'],
			},
		},
		description: 'Whether to return all sent emails or only up to the specified limit. Set to true to retrieve all emails regardless of quantity.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		description: 'Maximum number of emails to return. Use a smaller value for faster responses when you only need recent emails.',
	},
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const items = await requestList.call(this, '/emails');
	return createListExecutionData.call(this, items);
}
