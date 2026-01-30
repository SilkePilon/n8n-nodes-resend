import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		required: true,
		default: '',
		placeholder: '34a080c9-b17d-4187-ad80-5af20266e535',
		typeOptions: {
			loadOptionsMethod: 'getTemplates',
		},
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['get'],
			},
		},
		description:
			'Select a template or enter an ID/alias using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;

	const response = await apiRequest.call(this, 'GET', `/templates/${templateId}`);

	return [{ json: response }];
}
