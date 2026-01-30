import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdAddSegment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The ID of the audience the contact belongs to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdAddSegment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The ID of the contact',
	},
	{
		displayName: 'Segment ID',
		name: 'segmentIdAdd',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The ID of the segment to add the contact to',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceIdAddSegment', index) as string;
	const contactId = this.getNodeParameter('contactIdAddSegment', index) as string;
	const segmentId = this.getNodeParameter('segmentIdAdd', index) as string;

	const body: IDataObject = {
		segment_id: segmentId,
	};

	const response = await apiRequest.call(
		this,
		'POST',
		`/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactId)}/segments`,
		body,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
