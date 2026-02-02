import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	...createDynamicIdField({
		fieldName: 'audienceId',
		resourceName: 'audience',
		displayName: 'Audience',
		required: true,
		placeholder: 'aud_123456',
		description: 'The audience to retrieve',
		displayOptions: {
			show: {
				resource: ['audiences'],
				operation: ['get'],
			},
		},
	}),
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const audienceId = resolveDynamicIdValue(this, 'audienceId', index);

	const response = await apiRequest.call(
		this,
		'GET',
		`/audiences/${encodeURIComponent(audienceId)}`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
