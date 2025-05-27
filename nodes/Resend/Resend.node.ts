import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	SEND_AND_WAIT_OPERATION,
	WAIT_INDEFINITELY, // Ensure this is imported
	IWebhookFunctions, // Added for webhook
	// IDataObject, // If needed for body data, can be added later
} from 'n8n-workflow';

// Imports for HITL functionality
import { getSendAndWaitConfig, createButton } from '../../packages/nodes-base/utils/sendAndWait/utils';
import { createEmailBodyWithN8nAttribution, createEmailBodyWithoutN8nAttribution } from '../../packages/nodes-base/utils/sendAndWait/email-templates';
import { configureWaitTillDate } from '../../packages/nodes-base/utils/sendAndWait/configureWaitTillDate.util';
import type { SendAndWaitConfig } from '../../packages/nodes-base/utils/sendAndWait/utils'; // For type usage

// Imports for Webhook functionality
import { ACTION_RECORDED_PAGE } from '../../packages/nodes-base/utils/sendAndWait/email-templates';
// import { prepareFormData } from '../../packages/nodes-base/utils/sendAndWait/utils'; // prepareFormData might be too complex, direct construction used

export class Resend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Resend',
		name: 'resend',
		icon: 'file:resend-icon-white.svg',
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
				noDataExpression: true, options: [
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
				}, options: [
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
						name: 'Send and Wait for Response',
						value: 'sendAndWait',
						description: 'Send an email and wait for a user response via a webhook',
						action: 'Send an email and wait for response',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an email',
						action: 'Update an email',
					},
				],
				default: 'send',
			}, {
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
				],
				default: 'html',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send', 'sendBatch'], // sendAndWait will have its own email format property
					},
				},
				description: 'Choose the format for your email content. HTML allows rich formatting, text is simple and universally compatible.',
			},
			// Properties for "Send Email" operation (operation: send)
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
					rows: 4,
				},
				placeholder: '<p>Your HTML content here</p>',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
						emailFormat: ['html'],
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
					rows: 4,
				},
				placeholder: 'Your plain text content here',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['send'],
						emailFormat: ['text'],
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
						displayName: 'Attachments',
						name: 'attachments',
						type: 'fixedCollection',
						default: { attachments: [] },
						typeOptions: {
							multipleValues: true,
						},
						description: 'Email attachments (not supported with scheduled emails or batch emails)',
						options: [
							{
								name: 'attachments',
								displayName: 'Attachment',
								values: [
									{
										displayName: 'Attachment Type',
										name: 'attachmentType',
										type: 'options',
										default: 'binaryData',
										options: [
											{
												name: 'Binary Data',
												value: 'binaryData',
												description: 'Use binary data from previous node',
											},
											{
												name: 'Remote URL',
												value: 'url',
												description: 'Use a URL to a remote file',
											},
										],
									},
									{
										displayName: 'Binary Property',
										name: 'binaryPropertyName',
										type: 'string',
										default: 'data',
										placeholder: 'data',
										description: 'Name of the binary property which contains the file data',
										displayOptions: {
											show: {
												attachmentType: ['binaryData'],
											},
										},
									},
									{
										displayName: 'File URL',
										name: 'fileUrl',
										type: 'string',
										default: '',
										placeholder: 'https://example.com/file.pdf',
										description: 'URL to the remote file',
										displayOptions: {
											show: {
												attachmentType: ['url'],
											},
										},
									},									{
										displayName: 'File Name',
										name: 'filename',
										type: 'string',
										default: '',
										placeholder: 'document.pdf',
										description: 'Name for the attached file (required for both binary data and URL)',
									},
								],
							},
						],
					},
					{
						displayName: 'BCC',
						name: 'bcc',
						type: 'string',
						default: '',
						description: 'BCC recipient email addresses (comma-separated)',
					},
					{
						displayName: 'CC',
						name: 'cc',
						type: 'string',
						default: '',
						description: 'CC recipient email addresses (comma-separated)',
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
				description: 'Array of emails to send (max 100). Note: Attachments are not supported with batch emails.',
				options: [{
					name: 'emails',
					displayName: 'Email',
					values: [
						{
							displayName: 'From',
							name: 'from',
							type: 'string',
							required: true,
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
							placeholder: '<p>Your HTML content here</p>',
							typeOptions: {
								rows: 4
							},
							displayOptions: {
								show: {
									'/emailFormat': ['html'],
								},
							},
						},
						{
							displayName: 'Subject',
							name: 'subject',
							type: 'string',
							required: true,
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
							typeOptions: {
								rows: 4
							},
							placeholder: 'Your plain text content here',
							displayOptions: {
								show: {
									'/emailFormat': ['text'],
								},
							},
						},
						{
							displayName: 'To',
							name: 'to',
							type: 'string',
							required: true,
							default: '',
							placeholder: 'user@example.com',
							description: 'Recipient email address (comma-separated for multiple)',
						},
					],
				},
				],
			},

			// Properties for "Send and Wait for Response" Email Operation (value: sendAndWait)
			{
				displayName: 'From (HITL)',
				name: 'fromHitl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'you@example.com',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				description: 'Sender email address for HITL. Format: "Your Name <sender@domain.com>".',
			},
			{
				displayName: 'To (HITL)',
				name: 'toHitl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'user@example.com',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				description: 'Recipient email address for HITL.',
			},
			{
				displayName: 'Subject (HITL)',
				name: 'subjectHitl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Approval Required: Action Needed',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				description: 'Email subject line for HITL.',
			},
			{
				displayName: 'Message (HITL)',
				name: 'messageHitl',
				type: 'string',
				required: true,
				default: '',
				typeOptions: {
					rows: 4,
					multiline: true,
				},
				placeholder: 'Please review the following request...',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				description: 'The main message content of the email asking for a response.',
			},
			{
				displayName: 'Response Type (HITL)',
				name: 'responseTypeHitl',
				type: 'options',
				default: 'approval',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				options: [
					{
						name: 'Approval',
						value: 'approval',
						description: 'User can approve/disapprove from within the message',
					},
					{
						name: 'Free Text',
						value: 'freeText',
						description: 'User can submit a response via a form',
					},
				],
				description: 'The type of response expected from the user for HITL.',
			},
			// --- Approval Options for HITL ---
			{
				displayName: 'Approval Options (HITL)',
				name: 'approvalOptionsHitl',
				type: 'fixedCollection',
				placeholder: 'Add approval option',
				default: {},
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
						responseTypeHitl: ['approval'],
					},
				},
				options: [
					{
						displayName: 'Values',
						name: 'values',
						values: [
							{
								displayName: 'Type of Approval',
								name: 'approvalType',
								type: 'options',
								default: 'single',
								options: [
									{ name: 'Approve Only', value: 'single' },
									{ name: 'Approve and Disapprove', value: 'double' },
								],
							},
							{
								displayName: 'Approve Button Label',
								name: 'approveLabel',
								type: 'string',
								default: 'Approve',
							},
							{
								displayName: 'Approve Button Style',
								name: 'buttonApprovalStyle',
								type: 'options',
								default: 'primary',
								options: [
									{ name: 'Primary', value: 'primary' },
									{ name: 'Secondary', value: 'secondary' },
								],
							},
							{
								displayName: 'Disapprove Button Label',
								name: 'disapproveLabel',
								type: 'string',
								default: 'Decline',
								displayOptions: { show: { approvalType: ['double'] } },
							},
							{
								displayName: 'Disapprove Button Style',
								name: 'buttonDisapprovalStyle',
								type: 'options',
								default: 'secondary',
								options: [
									{ name: 'Primary', value: 'primary' },
									{ name: 'Secondary', value: 'secondary' },
								],
								displayOptions: { show: { approvalType: ['double'] } },
							},
						],
					},
				],
			},
			// --- Options for Free Text HITL ---
			{
				displayName: 'Free Text Options (HITL)',
				name: 'freeTextOptionsHitl',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
						responseTypeHitl: ['freeText'],
					},
				},
				options: [
					{
						displayName: 'Message Button Label',
						name: 'messageButtonLabel',
						type: 'string',
						default: 'Respond',
					},
					{
						displayName: 'Response Form Title',
						name: 'responseFormTitle',
						type: 'string',
						default: 'Provide Your Response',
					},
					{
						displayName: 'Response Form Description',
						name: 'responseFormDescription',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Response Form Button Label',
						name: 'responseFormButtonLabel',
						type: 'string',
						default: 'Submit',
					},
				],
			},
			// --- General HITL Settings ---
			{
				displayName: 'HITL Settings',
				name: 'hitlSettings',
				type: 'collection',
				placeholder: 'Add setting',
				default: {},
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['sendAndWait'],
					},
				},
				options: [
					{
						displayName: 'Limit Wait Time',
						name: 'limitWaitTime',
						type: 'fixedCollection',
						description: 'Whether the workflow will automatically resume execution after the specified limit type',
						default: { values: { limitType: 'afterTimeInterval', resumeAmount: 45, resumeUnit: 'minutes' } },
						options: [
							{
								displayName: 'Values',
								name: 'values',
								values: [
									{
										displayName: 'Limit Type',
										name: 'limitType',
										type: 'options',
										default: 'afterTimeInterval',
										options: [
											{ name: 'After Time Interval', value: 'afterTimeInterval' },
											{ name: 'Until Specific Date/Time', value: 'specificDateTime' },
										],
									},
									{
										displayName: 'Resume After',
										name: 'resumeAmount',
										type: 'number',
										default: 45,
										typeOptions: { minValue: 1 },
										displayOptions: { show: { limitType: ['afterTimeInterval'] } },
									},
									{
										displayName: 'Unit',
										name: 'resumeUnit',
										type: 'options',
										default: 'minutes',
										options: [
											{ name: 'Minutes', value: 'minutes' },
											{ name: 'Hours', value: 'hours' },
											{ name: 'Days', value: 'days' },
										],
										displayOptions: { show: { limitType: ['afterTimeInterval'] } },
									},
									{
										displayName: 'Date & Time',
										name: 'maxDateAndTime',
										type: 'dateTime',
										default: '',
										displayOptions: { show: { limitType: ['specificDateTime'] } },
									},
								],
							},
						],
					},
					{
						displayName: 'Append n8n Attribution',
						name: 'appendAttribution',
						type: 'boolean',
						default: true,
						description: 'Whether to include n8n branding in the email.',
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
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'string',
				default: '',
				placeholder: '2024-08-05T11:52:01.858Z',
				displayOptions: {
					show: {
						resource: ['email'],
						operation: ['update'],
					},
				},
				description: 'Schedule email to be sent later. The date should be in ISO 8601 format (e.g., 2024-08-05T11:52:01.858Z).',
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
			{
				displayName: 'Domain Update Options',
				name: 'domainUpdateOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['domains'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Click Tracking',
						name: 'click_tracking',
						type: 'boolean',
						default: false,
						description: 'Whether to track clicks within the body of each HTML email',
					},
					{
						displayName: 'Open Tracking',
						name: 'open_tracking',
						type: 'boolean',
						default: false,
						description: 'Whether to track the open rate of each email',
					},
					{
						displayName: 'TLS',
						name: 'tls',
						type: 'options',
						options: [
							{ name: 'Opportunistic', value: 'opportunistic' },
							{ name: 'Enforced', value: 'enforced' },
						],
						default: 'opportunistic',
						description: 'TLS setting for email delivery. Opportunistic attempts secure connection but falls back to unencrypted if needed. Enforced requires TLS and will not send if unavailable.',
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
			{
				displayName: 'Domain ID',
				name: 'domainId',
				type: 'string',
				default: '',
				placeholder: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
				displayOptions: {
					show: {
						resource: ['apiKeys'],
						operation: ['create'],
						permission: ['sending_access'],
					},
				},
				description: 'Restrict an API key to send emails only from a specific domain. This is only used when the permission is set to sending access.',
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
			{
				displayName: 'Broadcast Content',
				name: 'broadcastContent',
				type: 'collection',
				placeholder: 'Add Content',
				default: {},
				displayOptions: {
					show: {
						resource: ['broadcasts'],
						operation: ['create', 'update'],
					},
				}, options: [
					{
						displayName: 'Audience ID',
						name: 'audience_id',
						type: 'string',
						default: '',
						placeholder: 'aud_123456',
						displayOptions: {
							show: {
								'/operation': ['update'],
							},
						},
						description: 'The ID of the audience you want to send to (for update operation)',
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'string',
						default: '',
						placeholder: 'you@example.com',
						description: 'Sender email address. To include a friendly name, use the format &quot;Your Name &lt;sender@domain.com&gt;&quot;.',
					},
					{
						displayName: 'HTML Content',
						name: 'html',
						type: 'string',
						default: '',
						typeOptions: {
							multiline: true,
						},
						placeholder: '<p>Your HTML content here with {{{FIRST_NAME|there}}} and {{{RESEND_UNSUBSCRIBE_URL}}}</p>',
						description: 'The HTML version of the message. You can use variables like {{{FIRST_NAME|fallback}}} and {{{RESEND_UNSUBSCRIBE_URL}}}.',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'Internal broadcast name',
						description: 'The friendly name of the broadcast. Only used for internal reference.',
					},
					{
						displayName: 'Reply To',
						name: 'reply_to',
						type: 'string',
						default: '',
						placeholder: 'noreply@example.com',
						description: 'Reply-to email address. For multiple addresses, use comma-separated values.',
					},
					{
						displayName: 'Subject',
						name: 'subject',
						type: 'string', default: '',
						placeholder: 'Newsletter Subject',
						description: 'Email subject',
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
						description: 'The plain text version of the message',
					},
				],
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
				displayName: 'Update By',
				name: 'updateBy',
				type: 'options',
				options: [
					{ name: 'Contact ID', value: 'id' },
					{ name: 'Email Address', value: 'email' },
				],
				default: 'id',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['update'],
					},
				},
				description: 'Choose whether to update the contact by ID or email address',
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
						operation: ['get', 'delete'],
					},
				},
				description: 'The ID of the contact',
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
						operation: ['update'],
						updateBy: ['id'],
					},
				},
				description: 'The ID of the contact to update',
			},
			{
				displayName: 'Contact Email',
				name: 'contactEmail',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'contact@example.com',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['update'],
						updateBy: ['email'],
					},
				},
				description: 'The email address of the contact to update',
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
						operation: ['create', 'list', 'update'],
					},
				},
				description: 'The ID of the audience',
			},
			{
				displayName: 'Additional Fields',
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
						description: 'The first name of the contact',
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: 'The last name of the contact',
					},
					{
						displayName: 'Unsubscribed',
						name: 'unsubscribed',
						type: 'boolean',
						default: false,
						description: 'Whether the contact is unsubscribed from emails',
					},
				],
			},

			// DOMAIN OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['domains'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new domain',
						action: 'Create a domain',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a domain',
						action: 'Delete a domain',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a domain by ID',
						action: 'Get a domain',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all domains',
						action: 'List domains',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a domain',
						action: 'Update a domain',
					},
					{
						name: 'Verify',
						value: 'verify',
						description: 'Verify a domain',
						action: 'Verify a domain',
					},
				],
				default: 'list',
			},

			// API KEY OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['apiKeys'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new API key',
						action: 'Create an API key',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an API key',
						action: 'Delete an API key',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all API keys',
						action: 'List API keys',
					},
				],
				default: 'list',
			},

			// BROADCAST OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['broadcasts'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new broadcast',
						action: 'Create a broadcast',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a broadcast',
						action: 'Delete a broadcast',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a broadcast by ID',
						action: 'Get a broadcast',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all broadcasts',
						action: 'List broadcasts',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a broadcast',
						action: 'Send a broadcast',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a broadcast',
						action: 'Update a broadcast',
					},
				],
				default: 'list',
			},

			// AUDIENCE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['audiences'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new audience',
						action: 'Create an audience',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an audience',
						action: 'Delete an audience',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an audience by ID',
						action: 'Get an audience',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all audiences',
						action: 'List audiences',
					},
				],
				default: 'list',
			},

			// CONTACT OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new contact',
						action: 'Create a contact',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact by ID',
						action: 'Get a contact',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List contacts in an audience',
						action: 'List contacts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
						action: 'Update a contact',
					},
				],
				default: 'list',
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
					if (operation === SEND_AND_WAIT_OPERATION) {
						const fromHitl = this.getNodeParameter('fromHitl', i) as string;
						const toHitl = this.getNodeParameter('toHitl', i) as string;
						const subjectHitl = this.getNodeParameter('subjectHitl', i) as string;
						const messageHitl = this.getNodeParameter('messageHitl', i) as string;

						const responseTypeHitl = this.getNodeParameter('responseTypeHitl', i, 'approval') as string;
						// For fixedCollection, .values is conventional to get the inner object
						const approvalOptionsActualValues = this.getNodeParameter('approvalOptionsHitl.values', i, {}) as any;
						// For collection, parameters are usually direct children
						const freeTextOptionsActualValues = this.getNodeParameter('freeTextOptionsHitl', i, {}) as any;
						const hitlSettingsActualValues = this.getNodeParameter('hitlSettings', i, {}) as any;

						const resumeUrl = this.evaluateExpression('{{ $execution?.resumeUrl }}', i) as string;
						const nodeId = this.evaluateExpression('{{ $nodeId }}', i) as string;
						const fullWebhookUrl = `${resumeUrl}/${nodeId}`;

						const config: SendAndWaitConfig = {
							title: subjectHitl,
							message: messageHitl,
							url: fullWebhookUrl,
							options: [],
							appendAttribution: hitlSettingsActualValues.appendAttribution !== false,
						};

						if (responseTypeHitl === 'approval') {
							if (approvalOptionsActualValues.approvalType === 'double') {
								config.options.push({
									label: approvalOptionsActualValues.disapproveLabel || 'Decline',
									value: 'false',
									style: approvalOptionsActualValues.buttonDisapprovalStyle || 'secondary',
								});
								config.options.push({
									label: approvalOptionsActualValues.approveLabel || 'Approve',
									value: 'true',
									style: approvalOptionsActualValues.buttonApprovalStyle || 'primary',
								});
							} else { // single approval
								config.options.push({
									label: approvalOptionsActualValues.approveLabel || 'Approve',
									value: 'true',
									style: approvalOptionsActualValues.buttonApprovalStyle || 'primary',
								});
							}
						} else if (responseTypeHitl === 'freeText') {
							config.options.push({
								label: freeTextOptionsActualValues.messageButtonLabel || 'Respond',
								value: 'true', // Value for freeText can be generic 'true'
								style: 'primary',
							});
						}

						const buttons: string[] = [];
						for (const option of config.options) {
							buttons.push(createButton(config.url, option.label, option.value, option.style));
						}

						let htmlBody: string;
						const instanceId = this.getInstanceId?.() ?? '';
						if (config.appendAttribution) {
							htmlBody = createEmailBodyWithN8nAttribution(config.message, buttons.join('\n'), instanceId);
						} else {
							htmlBody = createEmailBodyWithoutN8nAttribution(config.message, buttons.join('\n'));
						}

						const requestBody: any = {
							from: fromHitl,
							to: toHitl.split(',').map((email: string) => email.trim()).filter((email: string) => email),
							subject: config.title,
							html: htmlBody,
						};

						// Ensure 'response' is declared in the loop's scope, e.g., let response: any;
						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/emails',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`, // apiKey from the loop's scope
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

						let waitTill = WAIT_INDEFINITELY;
						const limitWaitTimeCollection = hitlSettingsActualValues.limitWaitTime as any;
						// Check if limitWaitTimeCollection and its 'values' property exist
						const limitWaitTimeValues = limitWaitTimeCollection?.values;

						if (limitWaitTimeValues && Object.keys(limitWaitTimeValues).length > 0) {
							try {
								if (limitWaitTimeValues.limitType === 'afterTimeInterval') {
									let waitAmount = (limitWaitTimeValues.resumeAmount as number) || 45;
									const resumeUnit = (limitWaitTimeValues.resumeUnit as string) || 'minutes';
									if (resumeUnit === 'minutes') waitAmount *= 60;
									else if (resumeUnit === 'hours') waitAmount *= 60 * 60;
									else if (resumeUnit === 'days') waitAmount *= 60 * 60 * 24;
									waitAmount *= 1000;
									waitTill = new Date(new Date().getTime() + waitAmount);
								} else if (limitWaitTimeValues.limitType === 'specificDateTime') {
									waitTill = new Date(limitWaitTimeValues.maxDateAndTime as string);
								}
								if (isNaN(waitTill.getTime())) {
									throw new NodeOperationError(this.getNode(), 'Invalid date format for HITL wait time limit.', { itemIndex: i });
								}
							} catch (error: any) {
								throw new NodeOperationError(this.getNode(), `Could not configure HITL Limit Wait Time: ${error.message}`, {
									itemIndex: i,
									description: error.message,
								});
							}
						}

						const webhookResponseData = await this.putExecutionToWait(waitTill);

						if (webhookResponseData && webhookResponseData.length > 0) {
							// Assuming webhookResponseData is INodeExecutionData[] for the current item.
							// Each piece of INodeExecutionData should be paired with the input item index 'i'.
							const finalOutputItems = webhookResponseData.map(data => ({ 
								json: data.json, 
								binary: data.binary, 
								pairedItem: { item: i } 
							}));
							returnData.push(...finalOutputItems);
						} else {
							// Handle timeout or empty response: n8n convention is often to return original input data.
							returnData.push(items[i]); 
						}
						continue; // Important: skip default response handling for this item
					} else if (operation === 'send') {
						const from = this.getNodeParameter('from', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const emailFormat = this.getNodeParameter('emailFormat', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

						const requestBody: any = {
							from,
							to: to.split(',').map((email: string) => email.trim()).filter((email: string) => email),
							subject,
						};

						// Add content based on selected format
						if (emailFormat === 'html') {
							const html = this.getNodeParameter('html', i) as string;
							if (html) requestBody.html = html;
						} else if (emailFormat === 'text') {
							const text = this.getNodeParameter('text', i) as string;
							if (text) requestBody.text = text;
						}
						if (additionalOptions.cc) {
							requestBody.cc = additionalOptions.cc.split(',').map((email: string) => email.trim());
						}
						if (additionalOptions.bcc) {
							requestBody.bcc = additionalOptions.bcc.split(',').map((email: string) => email.trim());
						}						if (additionalOptions.reply_to) requestBody.reply_to = additionalOptions.reply_to;
						if (additionalOptions.scheduled_at) requestBody.scheduled_at = additionalOptions.scheduled_at;
						
						// Validate that attachments aren't used with scheduled emails
						if (additionalOptions.attachments && additionalOptions.attachments.attachments && additionalOptions.attachments.attachments.length > 0 && additionalOptions.scheduled_at) {
							throw new NodeOperationError(this.getNode(), 'Attachments cannot be used with scheduled emails. Please remove either the attachments or the scheduled time.', { itemIndex: i });
						}

						// Handle attachments
						if (additionalOptions.attachments && additionalOptions.attachments.attachments && additionalOptions.attachments.attachments.length > 0) {
							requestBody.attachments = additionalOptions.attachments.attachments.map((attachment: any) => {
								if (attachment.attachmentType === 'binaryData') {
									// Get binary data from the current item
									const binaryPropertyName = attachment.binaryPropertyName || 'data';
									const binaryData = items[i].binary?.[binaryPropertyName];
											if (!binaryData) {
										throw new NodeOperationError(this.getNode(), `Binary property "${binaryPropertyName}" not found in item ${i}`, { itemIndex: i });
									}
									
									return {
										filename: attachment.filename,
										content: binaryData.data, // This should be base64 content
									};
								} else if (attachment.attachmentType === 'url') {
									return {
										filename: attachment.filename,
										path: attachment.fileUrl,
									};
								}
								return null;
							}).filter((attachment: any) => attachment !== null);
						}

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
						const emailFormat = this.getNodeParameter('emailFormat', i) as string;

						const emails = emailsData.emails.map((email: any) => {
							const emailObj: any = {
								from: email.from,
								to: email.to.split(',').map((e: string) => e.trim()).filter((e: string) => e),
								subject: email.subject,
							};

							// Add content based on selected format
							if (emailFormat === 'html' && email.html) {
								emailObj.html = email.html;
							} else if (emailFormat === 'text' && email.text) {
								emailObj.text = email.text;
							}

							return emailObj;
						});

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
						const scheduledAt = this.getNodeParameter('scheduled_at', i) as string;

						const requestBody: any = {};
						if (scheduledAt) requestBody.scheduled_at = scheduledAt;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/emails/${emailId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
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
						const domainUpdateOptions = this.getNodeParameter('domainUpdateOptions', i, {}) as any;

						const requestBody: any = {};
						if (domainUpdateOptions.click_tracking !== undefined) requestBody.click_tracking = domainUpdateOptions.click_tracking;
						if (domainUpdateOptions.open_tracking !== undefined) requestBody.open_tracking = domainUpdateOptions.open_tracking;
						if (domainUpdateOptions.tls) requestBody.tls = domainUpdateOptions.tls;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/domains/${domainId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
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
						const domainId = this.getNodeParameter('domainId', i, '') as string;

						const requestBody: any = {
							name: apiKeyName,
							permission,
						};

						if (permission === 'sending_access' && domainId) {
							requestBody.domain_id = domainId;
						}

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/api-keys',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
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
						const broadcastContent = this.getNodeParameter('broadcastContent', i, {}) as any;

						const requestBody: any = {
							name: broadcastName,
							audience_id: audienceId,
						};

						// Add optional content fields for create operation
						if (broadcastContent.from) requestBody.from = broadcastContent.from;
						if (broadcastContent.subject) requestBody.subject = broadcastContent.subject;
						if (broadcastContent.reply_to) requestBody.reply_to = broadcastContent.reply_to;
						if (broadcastContent.html) requestBody.html = broadcastContent.html;
						if (broadcastContent.text) requestBody.text = broadcastContent.text;
						if (broadcastContent.name) requestBody.name = broadcastContent.name;

						response = await this.helpers.httpRequest({
							url: 'https://api.resend.com/broadcasts',
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
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
						const broadcastContent = this.getNodeParameter('broadcastContent', i, {}) as any;

						const requestBody: any = {};
						if (broadcastContent.audience_id) requestBody.audience_id = broadcastContent.audience_id;
						if (broadcastContent.from) requestBody.from = broadcastContent.from;
						if (broadcastContent.subject) requestBody.subject = broadcastContent.subject;
						if (broadcastContent.reply_to) requestBody.reply_to = broadcastContent.reply_to;
						if (broadcastContent.html) requestBody.html = broadcastContent.html;
						if (broadcastContent.text) requestBody.text = broadcastContent.text;
						if (broadcastContent.name) requestBody.name = broadcastContent.name;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/broadcasts/${broadcastId}`,
							method: 'PATCH',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							body: requestBody,
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
				} else if (resource === 'contacts') {					if (operation === 'create') {
						const email = this.getNodeParameter('email', i) as string;
						const audienceId = this.getNodeParameter('audienceId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;						const requestBody: any = {
							email,
							audienceId,
						};

						if (additionalFields.first_name) requestBody.firstName = additionalFields.first_name;
						if (additionalFields.last_name) requestBody.lastName = additionalFields.last_name;
						if (additionalFields.unsubscribed !== undefined) requestBody.unsubscribed = additionalFields.unsubscribed;

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/audiences/${audienceId}/contacts`,
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
						const audienceId = this.getNodeParameter('audienceId', i) as string;
						const updateBy = this.getNodeParameter('updateBy', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const requestBody: any = {};
						if (additionalFields.first_name) requestBody.first_name = additionalFields.first_name;
						if (additionalFields.last_name) requestBody.last_name = additionalFields.last_name;
						if (additionalFields.unsubscribed !== undefined) requestBody.unsubscribed = additionalFields.unsubscribed;

						let contactIdentifier: string;
						if (updateBy === 'id') {
							contactIdentifier = this.getNodeParameter('contactId', i) as string;
						} else {
							contactIdentifier = this.getNodeParameter('contactEmail', i) as string;
						}

						response = await this.helpers.httpRequest({
							url: `https://api.resend.com/audiences/${audienceId}/contacts/${contactIdentifier}`,
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
					// Note: The 'continue;' statement for SEND_AND_WAIT_OPERATION 
					// prevents the code below from executing for that operation.
				}


				// For operations other than SEND_AND_WAIT_OPERATION, or if resource is not 'email',
				// this will push the API response.
				// If operation was SEND_AND_WAIT_OPERATION, 'continue' would have skipped this.
				if (operation !== SEND_AND_WAIT_OPERATION || resource !== 'email') {
					returnData.push({ json: response, pairedItem: { item: i } });
				}
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

	// ======== WEBHOOK METHOD START ==========
	async webhook(this: IWebhookFunctions): Promise<any> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		// Get the responseTypeHitl from the node's saved parameters
		// Note: In a webhook, we don't have itemIndex, so we use 0 or assume it's consistent for the node.
		const responseTypeHitl = this.getNodeParameter('responseTypeHitl', 0, 'approval') as string;

		if (responseTypeHitl === 'approval') {
			const query = req.query as { approved?: 'true' | 'false' | string };
			const approved = query.approved === 'true';

			return {
				webhookResponse: ACTION_RECORDED_PAGE,
				workflowData: [[{ json: { data: { approved } } }]],
			};
		} else if (responseTypeHitl === 'freeText') {
			const freeTextOptions = this.getNodeParameter('freeTextOptionsHitl', 0, {}) as any;

			if (req.method === 'GET') {
				const formTitle = freeTextOptions.responseFormTitle || 'Provide Your Response';
				// Using messageHitl as the primary source for form description as per instruction, fallback if needed
				let formDescription = this.getNodeParameter('messageHitl', 0, '') as string;
				if (!formDescription && freeTextOptions.responseFormDescription) {
					formDescription = freeTextOptions.responseFormDescription;
				}
				const buttonLabel = freeTextOptions.responseFormButtonLabel || 'Submit';

				// Simplified form data preparation for a single textarea
				const data = {
					formTitle: formTitle,
					formDescription: formDescription.replace(/\n/g, '<br>'), // Ensure newlines are rendered as <br> in HTML
					formSubmittedHeader: 'Got it, thanks',
					formSubmittedText: 'This page can be closed now',
					buttonLabel: buttonLabel,
					formFields: [
						{
							fieldLabel: 'Response',
							fieldType: 'textarea',
							fieldName: 'responseText', // fieldName for the textarea
							requiredField: true,
						},
					],
					// Additional fields that might be expected by 'form-trigger' template
					httpMethod: 'POST', // Usually form submission method
					webhookUrl: req.url,   // The URL the form should post to
				};

				// The 'form-trigger' template is part of n8n's core views.
				res.render('form-trigger', data);
				return { noWebhookResponse: true };

			} else if (req.method === 'POST') {
				const bodyData = this.getBodyData() as { responseText?: string }; // Assuming fieldName is 'responseText'
				const textResponse = bodyData.responseText || '';

				return {
					webhookResponse: ACTION_RECORDED_PAGE,
					workflowData: [[{ json: { data: { text: textResponse } } }]],
				};
			}
		}

		// Fallback or error for unhandled response types or methods
		res.status(404).send('Webhook response type not configured or method not supported.');
		return { noWebhookResponse: true };
	}
	// ======== WEBHOOK METHOD END ==========
}
