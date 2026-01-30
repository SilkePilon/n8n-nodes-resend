import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Contact Identifier',
		name: 'contactIdentifier',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e169aa45-1ecf-4183-9955-b1499d5701d3 or contact@example.com',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['delete'],
			},
		},
		description: 'The contact ID or email address',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contactIdentifier = this.getNodeParameter('contactIdentifier', index) as string;

	const response = await apiRequest.call(this, 'DELETE', `/contacts/${encodeURIComponent(contactIdentifier)}`);

	return [{ json: response }];
}
