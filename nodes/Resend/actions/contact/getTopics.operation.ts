import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdGetTopics',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
			},
		},
		description: 'The ID of the audience the contact belongs to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdGetTopics',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['getTopics'],
			},
		},
		description: 'The ID of the contact',
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Max number of results to return',
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
