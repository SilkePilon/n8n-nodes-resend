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
	getApiKeys,
	getAudiences,
	getBroadcasts,
	getContactProperties,
	getContacts,
	getDomains,
	getEmails,
	getReceivedEmails,
	getSegments,
	getTemplateVariables,
	getTemplates,
	getTopics,
	getWebhooks,
	getApiKeysListSearch,
	getAudiencesListSearch,
	getBroadcastsListSearch,
	getContactPropertiesListSearch,
	getContactsListSearch,
	getDomainsListSearch,
	getEmailsListSearch,
	getReceivedEmailsListSearch,
	getSegmentsListSearch,
	getTemplatesListSearch,
	getTopicsListSearch,
	getWebhooksListSearch,
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
		usableAsTool: true,
		description:
			'Send emails, manage contacts, create broadcasts, handle templates, domains, API keys, segments, topics, and webhooks using the Resend email platform',
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
						description: 'Create, list, or delete API keys for authenticating with the Resend API',
					},
					{
						name: 'Audience',
						value: 'audiences',
						description: 'Create, get, list, or delete audiences (contact lists) for organizing email recipients',
					},
					{
						name: 'Broadcast',
						value: 'broadcasts',
						description: 'Create, send, update, or delete email broadcasts to reach multiple contacts at once',
					},
					{
						name: 'Contact',
						value: 'contacts',
						description: 'Add, update, delete, or list contacts (email subscribers) and manage their segment and topic memberships',
					},
					{
						name: 'Contact Property',
						value: 'contactProperties',
						description: 'Create, update, delete, or list custom contact properties (metadata fields) for storing additional contact information',
					},
					{
						name: 'Domain',
						value: 'domains',
						description: 'Add, verify, update, or delete sending domains for email authentication and deliverability',
					},
					{
						name: 'Email',
						value: 'email',
						description: 'Send single or batch emails, retrieve sent emails, cancel scheduled emails, or manage email attachments',
					},
					{
						name: 'Receiving Email',
						value: 'receivingEmails',
						description: 'List and retrieve received emails and their attachments from inbound email processing',
					},
					{
						name: 'Segment',
						value: 'segments',
						description: 'Create, update, delete, or list contact segments for grouping contacts based on criteria',
					},
					{
						name: 'Template',
						value: 'templates',
						description: 'Create, update, publish, duplicate, or delete reusable email templates with dynamic variables',
					},
					{
						name: 'Topic',
						value: 'topics',
						description: 'Create, update, delete, or list subscription topics for managing email preferences',
					},
					{
						name: 'Webhook',
						value: 'webhooks',
						description: 'Create, update, delete, or list webhooks for receiving real-time notifications about email events',
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
			getApiKeys,
			getAudiences,
			getBroadcasts,
			getContactProperties,
			getContacts,
			getDomains,
			getEmails,
			getReceivedEmails,
			getSegments,
			getTemplateVariables,
			getTemplates,
			getTopics,
			getWebhooks,
		},
		listSearch: {
			getApiKeys: getApiKeysListSearch,
			getAudiences: getAudiencesListSearch,
			getBroadcasts: getBroadcastsListSearch,
			getContactProperties: getContactPropertiesListSearch,
			getContacts: getContactsListSearch,
			getDomains: getDomainsListSearch,
			getEmails: getEmailsListSearch,
			getReceivedEmails: getReceivedEmailsListSearch,
			getSegments: getSegmentsListSearch,
			getTemplates: getTemplatesListSearch,
			getTopics: getTopicsListSearch,
			getWebhooks: getWebhooksListSearch,
		},
	};

	webhook = async function (this: IWebhookFunctions) {
		return sendAndWaitWebhook.call(this);
	};

	execute = router;
}
