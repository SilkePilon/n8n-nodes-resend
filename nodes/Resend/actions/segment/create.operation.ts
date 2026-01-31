import type {
	INodeProperties,
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
		description: 'The unique identifier of the audience this segment will belong to. Obtain from the List Audiences operation. Segments allow you to group contacts within an audience.',
	},
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
	const audienceId = this.getNodeParameter('audienceId', index) as string;
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
