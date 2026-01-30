import type { INodeType, INodeTypeDescription, IWebhookFunctions } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { router } from './actions/router';
import * as email from './actions/email';
import * as templates from './actions/template';
import * as domains from './actions/domain';
import * as apiKeys from './actions/apiKey';
import * as broadcasts from './actions/broadcast';
import * as segments from './actions/segment';
import * as topics from './actions/topic';
import * as contacts from './actions/contact';
import * as contactProperties from './actions/contactProperty';
import * as webhooks from './actions/webhook';
import * as audiences from './actions/audience';
import * as receivingEmails from './actions/receivingEmail';
import {
	getAudiences,
	getSegments,
	getTemplateVariables,
	getTemplates,
	getTopics,
} from './methods';
import {
	sendAndWaitWebhooksDescription,
	sendAndWaitWebhook,
	SEND_AND_WAIT_WAITING_TOOLTIP,
} from './utils/sendAndWait';

export class Resend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Resend',
		name: 'resend',
		icon: {
			light: 'file:resend-icon-black.svg',
			dark: 'file:resend-icon-white.svg',
		},
		group: ['output'],
		version: 1,
		description:
			'Interact with Resend API for emails, templates, domains, API keys, broadcasts, segments, topics, contacts, contact properties, and webhooks',
		subtitle:
			'={{(() => { const resourceLabels = { apiKeys: "api key", audiences: "audience", broadcasts: "broadcast", contacts: "contact", contactProperties: "contact property", domains: "domain", email: "email", receivingEmails: "received email", segments: "segment", templates: "template", topics: "topic", webhooks: "webhook" }; const operationLabels = { retrieve: "get", sendBatch: "send batch", listAttachments: "list attachments", getAttachment: "get attachment", addToSegment: "add to segment", listSegments: "list segments", removeFromSegment: "remove from segment", getTopics: "get topics", updateTopics: "update topics" }; const resource = $parameter["resource"]; const operation = $parameter["operation"]; const resourceLabel = resourceLabels[resource] ?? resource; const operationLabel = operationLabels[operation] ?? operation; return operationLabel + ": " + resourceLabel; })() }}',
		defaults: {
			name: 'Resend',
		},
		credentials: [
			{
				name: 'resendApi',
				required: true,
			},
		],
		waitingNodeTooltip: SEND_AND_WAIT_WAITING_TOOLTIP,
		webhooks: sendAndWaitWebhooksDescription,
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'API Key',
						value: 'apiKeys',
						description: 'Manage API keys',
					},
					{
						name: 'Audience',
						value: 'audiences',
						description: 'Manage audiences',
					},
					{
						name: 'Broadcast',
						value: 'broadcasts',
						description: 'Manage email broadcasts',
					},
					{
						name: 'Contact',
						value: 'contacts',
						description: 'Manage contacts',
					},
					{
						name: 'Contact Property',
						value: 'contactProperties',
						description: 'Manage contact properties',
					},
					{
						name: 'Domain',
						value: 'domains',
						description: 'Manage email domains',
					},
					{
						name: 'Email',
						value: 'email',
						description: 'Send and manage emails',
					},
					{
						name: 'Receiving Email',
						value: 'receivingEmails',
						description: 'Manage received emails and attachments',
					},
					{
						name: 'Segment',
						value: 'segments',
						description: 'Manage contact segments',
					},
					{
						name: 'Template',
						value: 'templates',
						description: 'Manage email templates',
					},
					{
						name: 'Topic',
						value: 'topics',
						description: 'Manage subscription topics',
					},
					{
						name: 'Webhook',
						value: 'webhooks',
						description: 'Manage webhooks',
					},
				],
				default: 'email',
			},

			...email.descriptions,
			...templates.descriptions,
			...domains.descriptions,
			...apiKeys.descriptions,
			...broadcasts.descriptions,
			...segments.descriptions,
			...topics.descriptions,
			...contacts.descriptions,
			...contactProperties.descriptions,
			...webhooks.descriptions,
			...audiences.descriptions,
			...receivingEmails.descriptions,
		],
	};

	methods = {
		loadOptions: {
			getTemplateVariables,
			getTemplates,
			getSegments,
			getTopics,
			getAudiences,
		},
	};

	webhook = async function (this: IWebhookFunctions) {
		return sendAndWaitWebhook.call(this);
	};

	execute = router;
}
