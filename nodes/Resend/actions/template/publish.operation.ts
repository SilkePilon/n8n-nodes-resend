import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateIdPublish',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['publish'],
			},
		},
		description: 'The ID or alias of the template to publish',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateIdPublish', index) as string;

	const response = await apiRequest.call(
		this,
		'POST',
		`/templates/${encodeURIComponent(templateId)}/publish`,
	);

	return [{ json: response, pairedItem: { item: index } }];
}
