import { SEND_AND_WAIT_OPERATION } from 'n8n-workflow';
import { createOperationRouter } from '../../transport';

import * as send from './send.operation';
import * as sendAndWait from './sendAndWait.operation';
import * as sendBatch from './sendBatch.operation';
import * as list from './list.operation';
import * as retrieve from './retrieve.operation';
import * as update from './update.operation';
import * as cancel from './cancel.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

export const execute = createOperationRouter(
	{
		send,
		[SEND_AND_WAIT_OPERATION]: sendAndWait,
		sendBatch,
		retrieve,
		update,
		cancel,
		listAttachments,
		getAttachment,
	},
	{ list },
);
