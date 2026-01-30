import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Update By',
		name: 'updateBy',
		type: 'options',
		options: [
			{ name: 'Contact ID', value: 'id' },
			{ name: 'Email Address', value: 'email' },
		],
		default: 'id',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['update'],
			},
		},
		description: 'Choose whether to update the contact by ID or email address',
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'con_123456',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['update'],
				updateBy: ['id'],
			},
		},
		description: 'The ID of the contact to update',
	},
	{
		displayName: 'Contact Email',
		name: 'contactEmail',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'contact@example.com',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['update'],
				updateBy: ['email'],
			},
		},
		description: 'The email address of the contact to update',
	},
	{
		displayName: 'Update Fields',
		name: 'contactUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'The first name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'The last name of the contact',
			},
			{
				displayName: 'Unsubscribed',
				name: 'unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether the contact is unsubscribed from emails',
			},
			{
				displayName: 'Properties',
				name: 'properties',
				type: 'fixedCollection',
				default: { properties: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'properties',
						displayName: 'Property',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								required: true,
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	},
];

interface PropertyItem {
	key: string;
	value: string;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const updateBy = this.getNodeParameter('updateBy', index) as string;
	const updateFields = this.getNodeParameter('contactUpdateFields', index, {}) as {
		first_name?: string;
		last_name?: string;
		unsubscribed?: boolean;
		properties?: { properties: PropertyItem[] };
	};

	let identifier: string;
	if (updateBy === 'id') {
		identifier = this.getNodeParameter('contactId', index) as string;
	} else {
		identifier = this.getNodeParameter('contactEmail', index) as string;
	}

	const body: IDataObject = {};

	if (updateFields.first_name) {
		body.first_name = updateFields.first_name;
	}
	if (updateFields.last_name) {
		body.last_name = updateFields.last_name;
	}
	if (updateFields.unsubscribed !== undefined) {
		body.unsubscribed = updateFields.unsubscribed;
	}

	if (updateFields.properties?.properties?.length) {
		const props: Record<string, string> = {};
		for (const p of updateFields.properties.properties) {
			props[p.key] = p.value;
		}
		body.properties = props;
	}

	const response = await apiRequest.call(this, 'PATCH', `/contacts/${encodeURIComponent(identifier)}`, body);

	return [{ json: response }];
}
