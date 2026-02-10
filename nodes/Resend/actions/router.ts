import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as email from './email';
import * as templates from './template';
import * as domains from './domain';
import * as broadcasts from './broadcast';
import * as segments from './segment';
import * as topics from './topic';
import * as contacts from './contact';
import * as contactProperties from './contactProperty';
import * as webhooks from './webhook';
import * as audiences from './audience';
import * as receivingEmails from './receivingEmail';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			let executionData: INodeExecutionData[] = [];

			switch (resource) {
				case 'email':
					executionData = await email.execute.call(this, i, operation);
					break;
				case 'templates':
					executionData = await templates.execute.call(this, i, operation);
					break;
				case 'domains':
					executionData = await domains.execute.call(this, i, operation);
					break;
				case 'broadcasts':
					executionData = await broadcasts.execute.call(this, i, operation);
					break;
				case 'segments':
					executionData = await segments.execute.call(this, i, operation);
					break;
				case 'topics':
					executionData = await topics.execute.call(this, i, operation);
					break;
				case 'contacts':
					executionData = await contacts.execute.call(this, i, operation);
					break;
				case 'contactProperties':
					executionData = await contactProperties.execute.call(this, i, operation);
					break;
				case 'webhooks':
					executionData = await webhooks.execute.call(this, i, operation);
					break;
				case 'audiences':
					executionData = await audiences.execute.call(this, i, operation);
					break;
				case 'receivingEmails':
					executionData = await receivingEmails.execute.call(this, i, operation);
					break;
				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
					);
			}

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}
