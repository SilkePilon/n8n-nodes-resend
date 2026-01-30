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
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['create'],
			},
		},
		description: 'The ID of the audience this segment belongs to',
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
		description: 'The name of the segment',
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
		description: 'Filter conditions for the segment as JSON object',
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
