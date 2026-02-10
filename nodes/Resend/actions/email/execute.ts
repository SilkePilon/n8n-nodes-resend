import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError, SEND_AND_WAIT_OPERATION } from 'n8n-workflow';

import * as send from './send.operation';
import * as sendAndWait from './sendAndWait.operation';
import * as sendBatch from './sendBatch.operation';
import * as list from './list.operation';
import * as retrieve from './retrieve.operation';
import * as update from './update.operation';
import * as cancel from './cancel.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

export async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'send':
			return send.execute.call(this, index);
		case SEND_AND_WAIT_OPERATION:
			return sendAndWait.execute.call(this, index);
		case 'sendBatch':
			return sendBatch.execute.call(this, index);
		case 'list':
			return list.execute.call(this);
		case 'retrieve':
			return retrieve.execute.call(this, index);
		case 'update':
			return update.execute.call(this, index);
		case 'cancel':
			return cancel.execute.call(this, index);
		case 'listAttachments':
			return listAttachments.execute.call(this, index);
		case 'getAttachment':
			return getAttachment.execute.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported operation: ${operation}`,
			);
	}
}
