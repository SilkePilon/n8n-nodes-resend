import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Email ID',
		name: 'emailIdForAttachments',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ae2014de-c168-4c61-8267-70d2662a1ce1',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['listAttachments'],
			},
		},
		description: 'The unique identifier of the sent email whose attachments to list. Obtain from the Send Email response or List Emails operation.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['listAttachments'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['listAttachments'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailId = this.getNodeParameter('emailIdForAttachments', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: IDataObject = {};
	if (!returnAll) {
		qs.limit = limit;
	}

	const response = await apiRequest.call(
		this,
		'GET',
		`/emails/${encodeURIComponent(emailId)}/attachments`,
		undefined,
		qs,
	);

	const items = (response as { data?: IDataObject[] }).data ?? [];
	const inputData = this.getInputData();

	return items.map((item, i) => ({
		json: item,
		pairedItem: { item: i < inputData.length ? i : 0 },
	}));
}
