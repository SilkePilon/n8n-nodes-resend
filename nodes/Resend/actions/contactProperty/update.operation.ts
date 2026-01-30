import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Contact Property ID',
		name: 'contactPropertyId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e',
		displayOptions: {
			show: {
				resource: ['contactProperties'],
				operation: ['update'],
			},
		},
		description: 'The ID of the contact property',
	},
	{
		displayName: 'Update Fields',
		name: 'contactPropertyUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contactProperties'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Fallback Value',
				name: 'fallback_value',
				type: 'string',
				default: '',
				placeholder: 'Acme Corp',
				description: 'Default value when the property is not set on a contact',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactPropertyId = this.getNodeParameter('contactPropertyId', index) as string;
	const updateFields = this.getNodeParameter('contactPropertyUpdateFields', index, {}) as {
		fallback_value?: string;
	};

	const response = await apiRequest.call(
		this,
		'PATCH',
		`/contact-properties/${contactPropertyId}`,
		updateFields,
	);

	return [{ json: response }];
}
