import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Topic Name',
		name: 'topicName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Weekly Newsletter',
		displayOptions: {
			show: {
				resource: ['topics'],
				operation: ['create'],
			},
		},
		description: 'The name of the topic',
	},
	{
		displayName: 'Default Subscription',
		name: 'topicDefaultSubscription',
		type: 'options',
		required: true,
		default: 'opt_in',
		displayOptions: {
			show: {
				resource: ['topics'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Opt In', value: 'opt_in' },
			{ name: 'Opt Out', value: 'opt_out' },
		],
		description: 'Default subscription preference for new contacts',
	},
	{
		displayName: 'Create Options',
		name: 'topicCreateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['topics'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Short description of the topic',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				default: 'private',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
				],
				description: 'Visibility on the unsubscribe page',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('topicName', index) as string;
	const defaultSubscription = this.getNodeParameter('topicDefaultSubscription', index) as string;
	const createOptions = this.getNodeParameter('topicCreateOptions', index, {}) as {
		description?: string;
		visibility?: string;
	};

	const body: IDataObject = {
		name,
		default_subscription: defaultSubscription,
	};

	if (createOptions.description) {
		body.description = createOptions.description;
	}
	if (createOptions.visibility) {
		body.visibility = createOptions.visibility;
	}

	const response = await apiRequest.call(this, 'POST', '/topics', body);

	return [{ json: response }];
}
