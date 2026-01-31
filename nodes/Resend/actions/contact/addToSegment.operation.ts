import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Audience ID',
		name: 'audienceIdAddSegment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aud_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation or audience creation response.',
	},
	{
		displayName: 'Contact ID',
		name: 'contactIdAddSegment',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The unique identifier of the contact to add to the segment. Obtain from the List Contacts or Create Contact operation.',
	},
	{
		displayName: 'Segment ID',
		name: 'segmentIdAdd',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'seg_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
		description: 'The unique identifier of the segment to add the contact to. Segments allow grouping contacts for targeted broadcasts.',
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
