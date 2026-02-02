import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { createDynamicIdField, resolveDynamicIdValue } from '../../utils/dynamicFields';

export const description: INodeProperties[] = [
	...createDynamicIdField({
		fieldName: 'templateId',
		resourceName: 'template',
		displayName: 'Template',
		required: true,
		placeholder: 'template_123456',
		description: 'The template to publish',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['publish'],
			},
		},
	}),
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = resolveDynamicIdValue(this, 'templateId', index);

	const response = await apiRequest.call(
		this,
		'POST',
		`/templates/${encodeURIComponent(templateId)}/publish`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
