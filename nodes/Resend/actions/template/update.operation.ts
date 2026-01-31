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
				description: 'A human-readable shortcut to reference the template instead of its UUID. Use lowercase letters, numbers, and hyphens.',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				description: 'Default sender email address. Must be from a verified domain. Format: "Name &lt;email@domain.com&gt;" or just email.',
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
				description: 'HTML body of the template. Use {{VARIABLE_NAME}} syntax for dynamic content.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Internal display name for the template. Used to identify templates in Resend dashboard.',
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
				description: 'Default subject line for emails using this template. Can include {{VARIABLE}} placeholders for personalization.',
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
		description: 'Define variables used in the template. These become placeholders that get replaced with actual values when sending emails using the Send Email or Send Batch operation.',
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
						description: 'Data type of the variable. Use String for text values (names, messages) or Number for numeric values (prices, quantities).',
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
