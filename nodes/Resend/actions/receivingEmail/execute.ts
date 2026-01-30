import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as get from './get.operation';
import * as list from './list.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

export async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return list.execute.call(this);
		case 'get':
			return get.execute.call(this, index);
		case 'listAttachments':
			return listAttachments.execute.call(this, index);
		case 'getAttachment':
			return getAttachment.execute.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
