import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';
import * as addToSegment from './addToSegment.operation';
import * as listSegments from './listSegments.operation';
import * as removeFromSegment from './removeFromSegment.operation';
import * as getTopics from './getTopics.operation';
import * as updateTopics from './updateTopics.operation';

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
		case 'update':
			return update.execute.call(this, index);
		case 'delete':
			return del.execute.call(this, index);
		case 'addToSegment':
			return addToSegment.execute.call(this, index);
		case 'listSegments':
			return listSegments.execute.call(this, index);
		case 'removeFromSegment':
			return removeFromSegment.execute.call(this, index);
		case 'getTopics':
			return getTopics.execute.call(this, index);
		case 'updateTopics':
			return updateTopics.execute.call(this, index);
		default:
			throw new Error(`Unsupported operation: ${operation}`);
	}
}
