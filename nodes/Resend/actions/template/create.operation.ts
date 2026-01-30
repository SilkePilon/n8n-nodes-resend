import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'templateName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'order-confirmation',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['create'],
			},
		},
		description: 'The name of the template',
	},
	{
		displayName: 'From',
		name: 'templateFrom',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Resend Store <store@resend.com>',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['create'],
			},
		},
		description:
			'Sender email address. To include a friendly name, use the format "Your Name &lt;sender@domain.com&gt;".',
	},
	{
		displayName: 'Subject',
		name: 'templateSubject',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Thanks for your order!',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['create'],
			},
		},
		description: 'Default subject line for the template',
	},
	{
		displayName: 'HTML Content',
		name: 'templateHtml',
		type: 'string',
		required: true,
		default: '',
		typeOptions: {
			multiline: true,
			rows: 4,
		},
		placeholder: '<p>Name: {{{PRODUCT}}}</p><p>Total: {{{PRICE}}}</p>',
		displayOptions: {
			show: {
				resource: ['templates'],
				operation: ['create'],
			},
		},
		description: 'HTML version of the template',
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
				operation: ['create'],
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
	const name = this.getNodeParameter('templateName', index) as string;
	const from = this.getNodeParameter('templateFrom', index) as string;
	const subject = this.getNodeParameter('templateSubject', index) as string;
	const html = this.getNodeParameter('templateHtml', index) as string;
	const templateVariables = this.getNodeParameter('templateVariables', index, {
		variables: [],
	}) as { variables: TemplateVariable[] };

	const body: IDataObject = {
		name,
		from,
		subject,
		html,
	};

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

	const response = await apiRequest.call(this, 'POST', '/templates', body);

	return [{ json: response }];
}
