import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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
				operation: ['update'],
			},
		},
		description:
			'Select a template or enter an ID/alias using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Update Fields',
		name: 'templateUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				default: '',
				description: 'Template alias',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				description: 'Sender email address',
			},
			{
				displayName: 'HTML Content',
				name: 'html',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
					rows: 4,
				},
				description: 'HTML content of the template',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Template name',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				description: 'Reply-to email address. For multiple addresses, use comma-separated values.',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Default subject line for the template',
			},
			{
				displayName: 'Text Content',
				name: 'text',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
					rows: 4,
				},
				description:
					'Plain text content. Set to an empty string to disable automatic plain text generation.',
			},
		],
	},
	{
		displayName: 'Template Variables',
		name: 'templateVariables',
		type: 'fixedCollection',
		default: { variables: [] },
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['update'],
			},
		},
		description: 'Define variables used in the template',
		options: [
			{
				name: 'variables',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						required: true,
						default: '',
						description: 'Variable name (we recommend uppercase, e.g. PRODUCT)',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						default: 'string',
						options: [
							{ name: 'String', value: 'string' },
							{ name: 'Number', value: 'number' },
						],
						description: 'Variable data type',
					},
					{
						displayName: 'Fallback Value',
						name: 'fallbackValue',
						type: 'string',
						default: '',
						description: 'Fallback value used when a variable is not provided',
					},
				],
			},
		],
	},
];

interface TemplateVariable {
	key: string;
	type: string;
	fallbackValue?: string;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', index) as string;
	const updateFields = this.getNodeParameter('templateUpdateFields', index, {}) as {
		alias?: string;
		from?: string;
		html?: string;
		name?: string;
		reply_to?: string;
		subject?: string;
		text?: string;
	};
	const templateVariables = this.getNodeParameter('templateVariables', index, {
		variables: [],
	}) as { variables: TemplateVariable[] };

	const body: IDataObject = { ...updateFields };

	if (templateVariables.variables && templateVariables.variables.length > 0) {
		const variables: Record<string, { type: string; fallback_value?: string }> = {};
		for (const v of templateVariables.variables) {
			variables[v.key] = { type: v.type };
			if (v.fallbackValue) {
				variables[v.key].fallback_value = v.fallbackValue;
			}
		}
		body.variables = variables;
	}

	const response = await apiRequest.call(this, 'PATCH', `/templates/${templateId}`, body);

	return [{ json: response }];
}
