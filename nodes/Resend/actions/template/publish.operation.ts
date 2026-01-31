import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateIdPublish',
		type: 'string',
		required: true,
		default: '',
		placeholder: '34a080c9-b17d-4187-ad80-5af20266e535',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['publish'],
			},
		},
		description: 'The unique identifier or alias of the template to publish. Publishing makes the template available for sending emails. Obtain from Create Template or List Templates.',
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
