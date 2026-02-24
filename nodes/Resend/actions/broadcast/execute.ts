import { createOperationRouter } from '../../transport';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as update from './update.operation';
import * as del from './delete.operation';
import * as send from './send.operation';

export const execute = createOperationRouter(
	{
		create,
		get,
		update,
		delete: del,
		send,
	},
	{ list },
);
