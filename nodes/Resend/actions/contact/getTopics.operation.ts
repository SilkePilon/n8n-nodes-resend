import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdGetTopics',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
			},
		},
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation.',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdGetTopics',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
			},
		},
		description: 'The unique identifier of the contact whose topic subscriptions to retrieve. Returns all topics and their subscription status.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
			},
		},
		description: 'Whether to return all topic subscriptions or only up to the specified limit. Set to true to retrieve all topics regardless of quantity.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
				returnAll: [false],
			},
		},
		description: 'Maximum number of topic subscriptions to return. Use a smaller value for faster responses.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceIdGetTopics', index) as string;
	const contactId = this.getNodeParameter('contactIdGetTopics', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: IDataObject = {};
	if (!returnAll) {
		qs.limit = limit;
	}

	const response = await apiRequest.call(
		this,
		'GET',
		`/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactId)}/topics`,
		undefined,
		qs,
	);

	const items = (response as { data?: IDataObject[] }).data ?? [];
	const inputData = this.getInputData();

	return items.map((item, i) => ({
		json: item,
		pairedItem: { item: i < inputData.length ? i : 0 },
	}));
}
