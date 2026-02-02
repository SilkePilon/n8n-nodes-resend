import type {
	INodeProperties,
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceId',
		resourceName: 'audience',
		displayName: 'Target Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience this segment will belong to. Segments allow you to group contacts within an audience.',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
	}),
	{
		displayName: 'Segment Name',
		name: 'segmentName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Registered Users',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
		description: 'A descriptive name for the segment (e.g., Active Users, Premium Customers). Used to identify the segment when creating broadcasts.',
	},
	{
		displayName: 'Filter (JSON)',
		name: 'segmentFilter',
		type: 'json',
		default: '',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
		description: 'Optional filter conditions as JSON object to automatically include contacts matching certain criteria. See Resend documentation for filter syntax.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = resolveDynamicIdValue(this, 'audienceId', index);
	const segmentName = this.getNodeParameter('segmentName', index) as string;
	const filterInput = this.getNodeParameter('segmentFilter', index, '') as string | IDataObject;

	const body: IDataObject = {
		name: segmentName,
		audience_id: audienceId,
	};

	if (filterInput) {
		if (typeof filterInput === 'string' && filterInput.trim()) {
			body.filter = JSON.parse(filterInput);
		} else if (typeof filterInput === 'object') {
			body.filter = filterInput;
		}
	}

	const response = await apiRequest.call(this, 'POST', '/segments', body);

	return [{ json: response, pairedItem: { item: index } }];
}
