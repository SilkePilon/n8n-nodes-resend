import type { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { requestList, createListExecutionData } from '../../transport';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[]> {
	const items = await requestList.call(this, '/api-keys');

	return createListExecutionData.call(this, items);
}
