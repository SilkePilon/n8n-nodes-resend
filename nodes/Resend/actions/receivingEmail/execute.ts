import { createOperationRouter } from '../../transport';

import * as get from './get.operation';
import * as list from './list.operation';
import * as listAttachments from './listAttachments.operation';
import * as getAttachment from './getAttachment.operation';

export const execute = createOperationRouter(
	{
		get,
		listAttachments,
		getAttachment,
	},
	{ list },
);
