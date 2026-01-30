import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdRemoveSegment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The ID of the audience the contact belongs to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdRemoveSegment',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The ID of the contact',
	},
	{
		displayName: 'Segment ID',
		name: 'segmentIdRemove',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The ID of the segment to remove the contact from',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = this.getNodeParameter('audienceIdRemoveSegment', index) as string;
	const contactId = this.getNodeParameter('contactIdRemoveSegment', index) as string;
	const segmentId = this.getNodeParameter('segmentIdRemove', index) as string;

	const response = await apiRequest.call(
		this,
		'DELETE',
		`/audiences/${encodeURIComponent(audienceId)}/contacts/${encodeURIComponent(contactId)}/segments/${encodeURIComponent(segmentId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
