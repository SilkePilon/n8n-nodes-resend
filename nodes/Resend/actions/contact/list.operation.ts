import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { requestList, createListExecutionData } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	createDynamicIdField({
		fieldName: 'audienceIdList',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience to list contacts from. Contacts are scoped to audiences.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['list'],
			},
		},
	}),
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const audienceId = resolveDynamicIdValue(this, 'audienceIdList', 0);
	const items = await requestList.call(this, `/audiences/${encodeURIComponent(audienceId)}/contacts`);
	return createListExecutionData.call(this, items);
}
