import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateIdDuplicate',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['duplicate'],
			},
		},
		description: 'The ID or alias of the template to duplicate',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateIdDuplicate', index) as string;

	const response = await apiRequest.call(
		this,
		'POST',
		`/templates/${encodeURIComponent(templateId)}/duplicate`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
