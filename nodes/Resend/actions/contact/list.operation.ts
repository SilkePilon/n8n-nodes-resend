import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { requestList, createListExecutionData } from '../../transport';

export const description: INodeProperties[] = [
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const items = await requestList.call(this, '/contacts');
	return createListExecutionData.call(this, items);
}
