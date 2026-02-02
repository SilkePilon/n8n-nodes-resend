import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceIdListSegments',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience containing the contact.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listSegments'],
			},
		},
	}),
	createDynamicIdField({
		fieldName: 'contactIdListSegments',
		resourceName: 'contact',
		displayName: 'Contact',
		required: true,
		placeholder: 'con_123456',
		description: 'The contact whose segment memberships to retrieve.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['listSegments'],
			},
		},
	}),
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
				operation: ['listSegments'],
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
	const audienceId = resolveDynamicIdValue(this, 'audienceIdListSegments', index);
	const contactId = resolveDynamicIdValue(this, 'contactIdListSegments', index);
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
