import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdListSegments',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listSegments'],
			},
		},
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation.',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdListSegments',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listSegments'],
			},
		},
		description: 'The unique identifier of the contact whose segment memberships to retrieve. Returns all segments this contact belongs to.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listSegments'],
			},
		},
		description: 'Whether to return all segment memberships or only up to the specified limit. Set to true to retrieve all segments regardless of quantity.',
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
				operation: ['listSegments'],
				returnAll: [false],
			},
		},
		description: 'Maximum number of segment memberships to return. Use a smaller value for faster responses.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceIdListSegments', index) as string;
	const contactId = this.getNodeParameter('contactIdListSegments', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: IDataObject = {};
	if (!returnAll) {
		qs.limit = limit;
	}

	const response = await apiRequest.call(
		this,
		'GET',
		`/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactId)}/segments`,
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
