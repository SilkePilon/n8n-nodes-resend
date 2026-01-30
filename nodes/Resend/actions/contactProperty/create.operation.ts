import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Key',
		name: 'contactPropertyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'company_name',
		displayOptions: {
			show: {
				resource: ['contactProperties'],
				operation: ['create'],
			},
		},
		description: 'Key for the contact property (letters, numbers, underscores)',
	},
	{
		displayName: 'Type',
		name: 'contactPropertyType',
		type: 'options',
		required: true,
		default: 'string',
		displayOptions: {
			show: {
				resource: ['contactProperties'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'String', value: 'string' },
			{ name: 'Number', value: 'number' },
		],
		description: 'Data type for the contact property',
	},
	{
		displayName: 'Fallback Value',
		name: 'contactPropertyFallbackValue',
		type: 'string',
		default: '',
		placeholder: 'Acme Corp',
		displayOptions: {
			show: {
				resource: ['contactProperties'],
				operation: ['create'],
			},
		},
		description: 'Default value when the property is not set on a contact',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const key = this.getNodeParameter('contactPropertyKey', index) as string;
	const type = this.getNodeParameter('contactPropertyType', index) as string;
	const fallbackValue = this.getNodeParameter('contactPropertyFallbackValue', index, '') as string;

	const body: IDataObject = { key, type };

	if (fallbackValue) {
		body.fallback_value = fallbackValue;
	}

	const response = await apiRequest.call(this, 'POST', '/contact-properties', body);

	return [{ json: response }];
}
