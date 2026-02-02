import type { INodeProperties, IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceIdAddSegment',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The unique identifier of the audience containing the contact. Obtain from the List Audiences operation or audience creation response.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
	}),
	createDynamicIdField({
		fieldName: 'contactIdAddSegment',
		resourceName: 'contact',
		displayName: 'Contact',
		required: true,
		placeholder: 'con_123456',
		description: 'The unique identifier of the contact to add to the segment. Obtain from the List Contacts or Create Contact operation.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
	}),
	createDynamicIdField({
		fieldName: 'segmentIdAdd',
		resourceName: 'segment',
		displayName: 'Segment',
		required: true,
		placeholder: 'seg_123456',
		description: 'The unique identifier of the segment to add the contact to. Segments allow grouping contacts for targeted broadcasts.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['addToSegment'],
			},
		},
	}),
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = resolveDynamicIdValue(this, 'audienceIdAddSegment', index);
	const contactId = resolveDynamicIdValue(this, 'contactIdAddSegment', index);
	const segmentId = resolveDynamicIdValue(this, 'segmentIdAdd', index);

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
