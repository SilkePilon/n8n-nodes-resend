import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { normalizeEmailList, buildTemplateSendVariables, RESEND_API_BASE } from '../../transport';

export const description: INodeProperties[] = [
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
		description:
			'Sender email address. To include a friendly name, use the format "Your Name &lt;sender@domain.com&gt;".',
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
		displayName: 'Use Template',
		name: 'useTemplate',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send'],
			},
		},
		description: 'Whether to send using a published template instead of HTML/Text content',
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
				name: 'HTML and Text',
				value: 'both',
				description: 'Send email with both HTML and text content',
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
				operation: ['send'],
				useTemplate: [false],
			},
		},
		description:
			'Choose the format for your email content. HTML allows rich formatting, text is simple and universally compatible.',
	},
	{
		displayName: 'Template Name or ID',
		name: 'emailTemplateId',
		type: 'options',
		required: true,
		default: '',
		placeholder: '34a080c9-b17d-4187-ad80-5af20266e535',
		typeOptions: {
			loadOptionsMethod: 'getTemplates',
		},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send'],
				useTemplate: [true],
			},
		},
		description:
			'Select a template or enter an ID/alias using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Template Variables',
		name: 'emailTemplateVariables',
		type: 'fixedCollection',
		default: { variables: [] },
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['send'],
				useTemplate: [true],
			},
		},
		description: 'Variables to render the template with',
		options: [
			{
				name: 'variables',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Key Name or ID',
						name: 'key',
						type: 'options',
						required: true,
						default: '',
						typeOptions: {
							loadOptionsMethod: 'getTemplateVariables',
							loadOptionsDependsOn: ['emailTemplateId'],
							allowCustomValues: true,
						},
						description:
							'Template variable name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value for the template variable',
					},
				],
			},
		],
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
				emailFormat: ['html', 'both'],
				useTemplate: [false],
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
				emailFormat: ['text', 'both'],
				useTemplate: [false],
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
				description: 'Email attachments (not supported with scheduled emails)',
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
								displayName: 'Content ID',
								name: 'content_id',
								type: 'string',
								default: '',
								placeholder: 'image-1',
								description: 'Content ID for embedding inline attachments via cid:',
							},
							{
								displayName: 'Content Type',
								name: 'content_type',
								type: 'string',
								default: '',
								placeholder: 'image/png',
								description: 'Content type for the attachment',
							},
							{
								displayName: 'File Name',
								name: 'filename',
								type: 'string',
								default: '',
								placeholder: 'document.pdf',
								description: 'Name for the attached file (required for both binary data and URL)',
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
				displayName: 'Headers',
				name: 'headers',
				type: 'fixedCollection',
				default: { headers: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'headers',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				description: 'Custom headers to add to the email',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				description: 'Reply-to email address. For multiple addresses, use comma-separated values.',
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'string',
				default: '',
				description: 'Schedule email to be sent later (e.g., "in 1 min" or ISO 8601 format)',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'fixedCollection',
				default: { tags: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'tags',
						displayName: 'Tag',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								required: true,
								default: '',
							},
						],
					},
				],
				description: 'Tags to attach to the email',
			},
			{
				displayName: 'Topic ID',
				name: 'topic_id',
				type: 'string',
				default: '',
				description: 'Topic ID to scope the email to',
			},
		],
	},
];

interface AttachmentInput {
	attachmentType: 'binaryData' | 'url';
	binaryPropertyName?: string;
	filename?: string;
	fileUrl?: string;
	content_id?: string;
	content_type?: string;
}

interface HeaderInput {
	name: string;
	value?: string;
}

interface TagInput {
	name: string;
	value?: string;
}

interface AdditionalOptions {
	attachments?: { attachments: AttachmentInput[] };
	bcc?: string;
	cc?: string;
	headers?: { headers: HeaderInput[] };
	reply_to?: string;
	scheduled_at?: string;
	tags?: { tags: TagInput[] };
	topic_id?: string;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const items = this.getInputData();
	const from = this.getNodeParameter('from', index) as string;
	const toValue = this.getNodeParameter('to', index) as string | string[];
	const subject = this.getNodeParameter('subject', index) as string;
	const useTemplate = this.getNodeParameter('useTemplate', index) as boolean;
	const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as AdditionalOptions;

	const requestBody: Record<string, unknown> = {
		from,
		to: normalizeEmailList(toValue),
		subject,
	};

	if (useTemplate) {
		const templateId = this.getNodeParameter('emailTemplateId', index) as string;
		const templateVariables = this.getNodeParameter('emailTemplateVariables', index, {}) as {
			variables?: Array<{ key: string; value?: unknown }>;
		};

		if (!templateId) {
			throw new NodeOperationError(
				this.getNode(),
				'Template Name or ID is required when sending with a template.',
				{ itemIndex: index },
			);
		}

		const html = this.getNodeParameter('html', index, '') as string;
		const text = this.getNodeParameter('text', index, '') as string;
		if (html || text) {
			throw new NodeOperationError(
				this.getNode(),
				'HTML/Text Content cannot be used when sending with a template.',
				{ itemIndex: index },
			);
		}

		requestBody.template = { id: templateId };
		const variables = buildTemplateSendVariables(templateVariables);
		if (variables && Object.keys(variables).length) {
			(requestBody.template as Record<string, unknown>).variables = variables;
		}
	} else {
		const emailFormat = this.getNodeParameter('emailFormat', index) as string;
		if (emailFormat === 'html' || emailFormat === 'both') {
			const html = this.getNodeParameter('html', index) as string;
			if (!html) {
				throw new NodeOperationError(this.getNode(), 'HTML Content is required.', {
					itemIndex: index,
				});
			}
			requestBody.html = html;
		}
		if (emailFormat === 'text' || emailFormat === 'both') {
			const text = this.getNodeParameter('text', index) as string;
			if (!text) {
				throw new NodeOperationError(this.getNode(), 'Text Content is required.', {
					itemIndex: index,
				});
			}
			requestBody.text = text;
		}
	}

	// Handle CC
	if (additionalOptions.cc) {
		const ccList = normalizeEmailList(additionalOptions.cc);
		if (ccList.length) {
			requestBody.cc = ccList;
		}
	}

	// Handle BCC
	if (additionalOptions.bcc) {
		const bccList = normalizeEmailList(additionalOptions.bcc);
		if (bccList.length) {
			requestBody.bcc = bccList;
		}
	}

	// Handle Reply To
	if (additionalOptions.reply_to) {
		const replyToList = normalizeEmailList(additionalOptions.reply_to);
		if (replyToList.length) {
			requestBody.reply_to = replyToList;
		}
	}

	// Handle Headers
	if (additionalOptions.headers?.headers?.length) {
		const headers: Record<string, string> = {};
		for (const header of additionalOptions.headers.headers) {
			if (header.name) {
				headers[header.name] = header.value ?? '';
			}
		}
		if (Object.keys(headers).length) {
			requestBody.headers = headers;
		}
	}

	// Handle Tags
	if (additionalOptions.tags?.tags?.length) {
		requestBody.tags = additionalOptions.tags.tags
			.filter((tag) => tag.name)
			.map((tag) => ({
				name: tag.name,
				value: tag.value ?? '',
			}));
	}

	// Handle Topic ID
	if (additionalOptions.topic_id) {
		requestBody.topic_id = additionalOptions.topic_id;
	}

	// Handle Scheduled At
	if (additionalOptions.scheduled_at) {
		requestBody.scheduled_at = additionalOptions.scheduled_at;
	}

	// Validate attachments + scheduled_at
	if (
		additionalOptions.attachments?.attachments?.length &&
		additionalOptions.scheduled_at
	) {
		throw new NodeOperationError(
			this.getNode(),
			'Attachments cannot be used with scheduled emails. Please remove either the attachments or the scheduled time.',
			{ itemIndex: index },
		);
	}

	// Handle Attachments
	if (additionalOptions.attachments?.attachments?.length) {
		requestBody.attachments = additionalOptions.attachments.attachments
			.map((attachment) => {
				const contentId = attachment.content_id;
				const contentType = attachment.content_type;

				if (attachment.attachmentType === 'binaryData') {
					const binaryPropertyName = attachment.binaryPropertyName || 'data';
					const binaryData = items[index].binary?.[binaryPropertyName];
					if (!binaryData) {
						throw new NodeOperationError(
							this.getNode(),
							`Binary property "${binaryPropertyName}" not found in item ${index}`,
							{ itemIndex: index },
						);
					}

					const filename = attachment.filename || binaryData.fileName;
					if (!filename) {
						throw new NodeOperationError(
							this.getNode(),
							'File Name is required for binary attachments.',
							{ itemIndex: index },
						);
					}

					const attachmentEntry: Record<string, unknown> = {
						filename,
						content: binaryData.data,
					};
					if (contentId) {
						attachmentEntry.content_id = contentId;
					}
					if (contentType) {
						attachmentEntry.content_type = contentType;
					}
					return attachmentEntry;
				} else if (attachment.attachmentType === 'url') {
					if (!attachment.filename) {
						throw new NodeOperationError(
							this.getNode(),
							'File Name is required for URL attachments.',
							{ itemIndex: index },
						);
					}
					if (!attachment.fileUrl) {
						throw new NodeOperationError(
							this.getNode(),
							'File URL is required for URL attachments.',
							{ itemIndex: index },
						);
					}
					const attachmentEntry: Record<string, unknown> = {
						filename: attachment.filename,
						path: attachment.fileUrl,
					};
					if (contentId) {
						attachmentEntry.content_id = contentId;
					}
					if (contentType) {
						attachmentEntry.content_type = contentType;
					}
					return attachmentEntry;
				}
				return null;
			})
			.filter((attachment): attachment is Record<string, unknown> => attachment !== null);
	}

	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/emails`,
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: requestBody,
		json: true,
	});

	return [{ json: response }];
}
