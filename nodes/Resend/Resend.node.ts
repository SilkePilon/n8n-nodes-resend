import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class Resend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Resend',
		name: 'resend',
		icon: 'file:Resend.svg',
		group: ['output'],
		version: 1,
		description: 'Interact with Resend API for emails, domains, API keys, broadcasts, audiences, and contacts',
		defaults: {
			name: 'Resend',
		},
		credentials: [
			{
				name: 'resendApi',
				required: true,
			},
		],
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,				options: [
					{
						name: 'API Key',
						value: 'apiKeys',
						description: 'Manage API keys',
					},
					{
						name: 'Audience',
						value: 'audiences',
						description: 'Manage email audiences',
					},
					{
						name: 'Broadcast',
						value: 'broadcasts',
						description: 'Manage email broadcasts',
					},
					{
						name: 'Contact',
						value: 'contacts',
						description: 'Manage audience contacts',
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
				],
				default: 'email',
			},

			// EMAIL OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['email'],
					},
				},				options: [
					{
						name: 'Cancel',
						value: 'cancel',
						description: 'Cancel a scheduled email',
						action: 'Cancel an email',
					},
					{
						name: 'Retrieve',
						value: 'retrieve',
						description: 'Retrieve an email by ID',
						action: 'Retrieve an email',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send an email',
						action: 'Send an email',
					},
					{
						name: 'Send Batch',
						value: 'sendBatch',
						description: 'Send multiple emails at once',
						action: 'Send batch emails',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an email',
						action: 'Update an email',
					},
				],
				default: 'send',
			},
			{
				displayName: 'Email Format',
				name: 'emailFormat',
				type: 'options',
				options: [
					{
						name: 'HTML',
						value: 'html',
						description: 'Send email with HTML content',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Send email with plain text content',
					},
					{
						name: 'Both',
						value: 'both',
						description: 'Send email with both HTML and text content',
					},
				],
				default: 'html',
				displayOptions: {
					show: {
						operation: ['sendEmail'],
					},
				},
				description: 'Choose the format for your email content. HTML allows rich formatting, text is simple and universally compatible, both provides maximum compatibility.',
			},
			// Properties for "Send Email" operation
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'you@example.com',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				description: 'Sender email address. To include a friendly name, use the format "Your Name &lt;sender@domain.com&gt;".',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'user@example.com',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				description: 'Recipient email address. For multiple addresses, separate with commas (max 50).',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Hello from n8n!',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				description: 'Email subject line',
			},
			{
				displayName: 'HTML Content',
				name: 'html',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: '<p>Your HTML content here</p>',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				description: 'HTML version of the email content',
			},
			{
				displayName: 'Text Content',
				name: 'text',
				type: 'string',
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: 'Your plain text content here',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				description: 'Plain text version of the email content',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
					},
				},
				options: [
					{
						displayName: 'CC',
						name: 'cc',
						type: 'string',
						default: '',
						description: 'CC recipient email addresses (comma-separated)',
					},
					{
						displayName: 'BCC',
						name: 'bcc',
						type: 'string',
						default: '',
						description: 'BCC recipient email addresses (comma-separated)',
					},
					{
						displayName: 'Reply To',
						name: 'reply_to',
						type: 'string',
						default: '',
						description: 'Reply-to email address',
					},
					{
						displayName: 'Scheduled At',
						name: 'scheduled_at',
						type: 'string',
						default: '',
						description: 'Schedule email to be sent later (e.g., "in 1 min" or ISO 8601 format)',
					},
				],
			},

			// EMAIL PROPERTIES - Send Batch operation
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'fixedCollection',
				required: true,
				default: { emails: [{}] },
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendBatch'],
					},
				},
				description: 'Array of emails to send (max 100)',
				options: [
					{
						name: 'emails',
						displayName: 'Email',
						values: [
							{
						displayName: 'From',
						name: 'from',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'you@example.com',
						description: 'Sender email address',
							},
							{
						displayName: 'HTML Content',
						name: 'html',
						type: 'string',
						default: '',
						description: 'HTML content of the email',
							},
							{
						displayName: 'Subject',
						name: 'subject',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'Hello from n8n!',
						description: 'Email subject',
							},
							{
						displayName: 'Text Content',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Plain text content of the email',
							},
							{
						displayName: 'To',
						name: 'to',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'user@example.com',
						description: 'Recipient email address (comma-separated for multiple)',
							},
						],
					},
				],
			},

			// EMAIL PROPERTIES - Retrieve/Update/Cancel operations
			{
				displayName: 'Email ID',
				name: 'emailId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'ae2014de-c168-4c61-8267-70d2662a1ce1',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['retrieve', 'update', 'cancel'],
					},
				},
				description: 'The ID of the email to retrieve, update, or cancel',
			},

			// DOMAIN PROPERTIES
			{
				displayName: 'Domain Name',
				name: 'domainName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'example.com',
				displayOptions: {
					show: {
						resource: ['domains'],
						operation: ['create'],
					},
				},
				description: 'The name of the domain you want to create',
			},
			{
				displayName: 'Domain ID',
				name: 'domainId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
				displayOptions: {
					show: {
						resource: ['domains'],
						operation: ['get', 'verify', 'update', 'delete'],
					},
				},
				description: 'The ID of the domain',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['domains'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Region',
						name: 'region',
						type: 'options',
						options: [
							{ name: 'US East 1', value: 'us-east-1' },
							{ name: 'EU West 1', value: 'eu-west-1' },
							{ name: 'South America East 1', value: 'sa-east-1' },
							{ name: 'Asia Pacific Northeast 1', value: 'ap-northeast-1' },
						],
						default: 'us-east-1',
						description: 'The region where emails will be sent from',
					},
					{
						displayName: 'Custom Return Path',
						name: 'custom_return_path',
						type: 'string',
						default: 'send',
						description: 'Custom subdomain for the Return-Path address',
					},
				],
			},

			// API KEY PROPERTIES
			{
				displayName: 'API Key Name',
				name: 'apiKeyName',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				placeholder: 'My API Key',
				displayOptions: {
					show: {
						resource: ['apiKeys'],
						operation: ['create'],
					},
				},
				description: 'The name of the API key to create',
			},
			{
				displayName: 'API Key ID',
				name: 'apiKeyId',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				placeholder: 'key_123456',
				displayOptions: {
					show: {
						resource: ['apiKeys'],
						operation: ['delete'],
					},
				},
				description: 'The ID of the API key to delete',
			},
			{
				displayName: 'Permission',
				name: 'permission',
				type: 'options',
				options: [
					{ name: 'Full Access', value: 'full_access' },
					{ name: 'Sending Access', value: 'sending_access' },
				],
				default: 'full_access',
				displayOptions: {
					show: {
						resource: ['apiKeys'],
						operation: ['create'],
					},
				},
				description: 'The permission level for the API key',
			},

			// BROADCAST PROPERTIES
			{
				displayName: 'Broadcast Name',
				name: 'broadcastName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'My Newsletter',
				displayOptions: {
					show: {
						resource: ['broadcasts'],
						operation: ['create'],
					},
				},
				description: 'The name of the broadcast',
			},
			{
				displayName: 'Broadcast ID',
				name: 'broadcastId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'bc_123456',
				displayOptions: {
					show: {
						resource: ['broadcasts'],
						operation: ['get', 'update', 'send', 'delete'],
					},
				},
				description: 'The ID of the broadcast',
			},
			{
				displayName: 'Audience ID',
				name: 'audienceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'aud_123456',
				displayOptions: {
					show: {
						resource: ['broadcasts'],
						operation: ['create'],
					},
				},
				description: 'The ID of the audience for this broadcast',
			},

			// AUDIENCE PROPERTIES
			{
				displayName: 'Audience Name',
				name: 'audienceName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Newsletter Subscribers',
				displayOptions: {
					show: {
						resource: ['audiences'],
						operation: ['create'],
					},
				},
				description: 'The name of the audience',
			},
			{
				displayName: 'Audience ID',
				name: 'audienceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'aud_123456',
				displayOptions: {
					show: {
						resource: ['audiences'],
						operation: ['get', 'delete'],
					},
				},
				description: 'The ID of the audience',
			},

			// CONTACT PROPERTIES
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'contact@example.com',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create'],
					},
				},
				description: 'The email address of the contact',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'con_123456',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['get', 'update', 'delete'],
					},
				},
				description: 'The ID of the contact',
			},
			{
				displayName: 'Audience ID',
				name: 'audienceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'aud_123456',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'list'],
					},
				},
				description: 'The ID of the audience',
			},
			{
				displayName: 'Additional Contact Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						description: 'First name of the contact',
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: 'Last name of the contact',
					},
					{
						displayName: 'Unsubscribed',
						name: 'unsubscribed',
						type: 'boolean',
						default: false,
						description: 'Whether the contact is unsubscribed',
					},
				],
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('resendApi');
				const apiKey = credentials.apiKey as string;

				let response: any;

				// EMAIL OPERATIONS
				if (resource === 'email') {
					if (operation === 'send') {
						const from = this.getNodeParameter('from', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const html = this.getNodeParameter('html', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

						const requestBody: any = {
							from,
							to: to.split(',').map((email: string) => email.trim()).filter((email: string) => email),
							subject,
						};

						if (html) requestBody.html = html;
						if (text) requestBody.text = text;
						if (additionalOptions.cc) {
							requestBody.cc = additionalOptions.cc.split(',').map((email: string) => email.trim());
						}
						if (additionalOptions.bcc) {
							requestBody.bcc = additionalOptions.bcc.split(',').map((email: string) => email.trim());
						}
						if (additionalOptions.reply_to) requestBody.reply_to = additionalOptions.reply_to;
						if (additionalOptions.scheduled_at) requestBody.scheduled_at = additionalOptions.scheduled_at;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/emails',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

					} else if (operation === 'sendBatch') {
						const emailsData = this.getNodeParameter('emails', i) as any;
						const emails = emailsData.emails.map((email: any) => ({
							from: email.from,
							to: email.to.split(',').map((e: string) => e.trim()).filter((e: string) => e),
							subject: email.subject,
							...(email.html && { html: email.html }),
							...(email.text && { text: email.text }),
						}));

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/emails/batch',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: emails,
							json: true,
						});

					} else if (operation === 'retrieve') {
						const emailId = this.getNodeParameter('emailId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/emails/${emailId}`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'update') {
						const emailId = this.getNodeParameter('emailId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/emails/${emailId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});

					} else if (operation === 'cancel') {
						const emailId = this.getNodeParameter('emailId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/emails/${emailId}/cancel`,
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});
					}

				// DOMAIN OPERATIONS
				} else if (resource === 'domains') {
					if (operation === 'create') {
						const domainName = this.getNodeParameter('domainName', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

						const requestBody: any = { name: domainName };
						if (additionalOptions.region) requestBody.region = additionalOptions.region;
						if (additionalOptions.custom_return_path) requestBody.custom_return_path = additionalOptions.custom_return_path;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/domains',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

					} else if (operation === 'get') {
						const domainId = this.getNodeParameter('domainId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/domains/${domainId}`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'verify') {
						const domainId = this.getNodeParameter('domainId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/domains/${domainId}/verify`,
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});

					} else if (operation === 'update') {
						const domainId = this.getNodeParameter('domainId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/domains/${domainId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});

					} else if (operation === 'list') {
						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/domains',
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'delete') {
						const domainId = this.getNodeParameter('domainId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/domains/${domainId}`,
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});
					}

				// API KEY OPERATIONS
				} else if (resource === 'apiKeys') {
					if (operation === 'create') {
						const apiKeyName = this.getNodeParameter('apiKeyName', i) as string;
						const permission = this.getNodeParameter('permission', i) as string;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/api-keys',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {
								name: apiKeyName,
								permission,
							},
							json: true,
						});

					} else if (operation === 'list') {
						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/api-keys',
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'delete') {
						const apiKeyId = this.getNodeParameter('apiKeyId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/api-keys/${apiKeyId}`,
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});
					}

				// BROADCAST OPERATIONS
				} else if (resource === 'broadcasts') {
					if (operation === 'create') {
						const broadcastName = this.getNodeParameter('broadcastName', i) as string;
						const audienceId = this.getNodeParameter('audienceId', i) as string;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/broadcasts',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {
								name: broadcastName,
								audience_id: audienceId,
							},
							json: true,
						});

					} else if (operation === 'get') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/broadcasts/${broadcastId}`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'update') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/broadcasts/${broadcastId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});

					} else if (operation === 'send') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/broadcasts/${broadcastId}/send`,
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {},
							json: true,
						});

					} else if (operation === 'list') {
						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/broadcasts',
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'delete') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/broadcasts/${broadcastId}`,
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});
					}

				// AUDIENCE OPERATIONS
				} else if (resource === 'audiences') {
					if (operation === 'create') {
						const audienceName = this.getNodeParameter('audienceName', i) as string;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/audiences',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: {
								name: audienceName,
							},
							json: true,
						});

					} else if (operation === 'get') {
						const audienceId = this.getNodeParameter('audienceId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/audiences/${audienceId}`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'list') {
						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/audiences',
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'delete') {
						const audienceId = this.getNodeParameter('audienceId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/audiences/${audienceId}`,
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});
					}

				// CONTACT OPERATIONS
				} else if (resource === 'contacts') {
					if (operation === 'create') {
						const email = this.getNodeParameter('email', i) as string;
						const audienceId = this.getNodeParameter('audienceId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const requestBody: any = {
							email,
							audience_id: audienceId,
						};

						if (additionalFields.first_name) requestBody.first_name = additionalFields.first_name;
						if (additionalFields.last_name) requestBody.last_name = additionalFields.last_name;
						if (additionalFields.unsubscribed !== undefined) requestBody.unsubscribed = additionalFields.unsubscribed;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/contacts',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

					} else if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/contacts/${contactId}`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const requestBody: any = {};
						if (additionalFields.first_name) requestBody.first_name = additionalFields.first_name;
						if (additionalFields.last_name) requestBody.last_name = additionalFields.last_name;
						if (additionalFields.unsubscribed !== undefined) requestBody.unsubscribed = additionalFields.unsubscribed;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/contacts/${contactId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

					} else if (operation === 'list') {
						const audienceId = this.getNodeParameter('audienceId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/audiences/${audienceId}/contacts`,
							method: 'GET',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});

					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/contacts/${contactId}`,
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
							json: true,
						});
					}
				}

				returnData.push({ json: response, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error);
			}
		}
		return [returnData];
	}
}
