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
				operation: ['get'],
			},
		},
		description: 'The unique identifier of the contact property to retrieve. Obtain from the Create Contact Property response or List Contact Properties operation.',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactPropertyId = this.getNodeParameter('contactPropertyId', index) as string;

	const response = await apiRequest.call(this, 'GET', `/contact-properties/${contactPropertyId}`);

	return [{ json: response }];
}
