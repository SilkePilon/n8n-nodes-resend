import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as del from './delete.operation';

export async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'create':
			return create.execute.call(this, index);
		case 'get':
			return get.execute.call(this, index);
		case 'list':
			return list.execute.call(this);
		case 'delete':
			return del.execute.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
