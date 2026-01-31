import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdRemoveSegment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation.',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdRemoveSegment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The unique identifier of the contact to remove from the segment. Obtain from the List Contacts operation.',
	},
	{
		displayName: 'Segment ID',
		name: 'segmentIdRemove',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'seg_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['removeFromSegment'],
			},
		},
		description: 'The unique identifier of the segment to remove the contact from. The contact will no longer receive broadcasts targeting this segment.',
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
