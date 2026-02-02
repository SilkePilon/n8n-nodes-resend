import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { normalizeEmailList, buildTemplateSendVariables, RESEND_API_BASE } from '../../transport';

export const description: INodeProperties[] = [
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
		description: 'Array of emails to send in a single API call. Maximum 100 emails per batch. Each email can have different recipients, content, and options.',
		options: [
			{
				name: 'emails',
				displayName: 'Email',
				values: [
					{
						displayName: 'Additional Options',
						name: 'additionalOptions',
						type: 'collection',
						default: {},
						placeholder: 'Add Option',
						options: [
							{
								displayName: 'Attachments',
								name: 'attachments',
								type: 'fixedCollection',
								default: {},
								options: [
											{
												name: 'attachments',
												displayName: 'Attachment',
													values:	[
													{
														displayName: 'Attachment Type',
														name: 'attachmentType',
														type: 'options',
														default: 'binaryData',
														options: [
																	{
																		name: 'Binary Data',
																		value: 'binaryData',
																		description: 'Use binary data from a previous node (e.g., Read File, HTTP Request)',
																	},
																	{
																		name: 'Remote URL',
																		value: 'url',
																		description: 'Use a publicly accessible URL to fetch the file for attachment',
																	},
																]
													},
													{
														displayName: 'Binary Property',
														name: 'binaryPropertyName',
														type: 'string',
														default: 'data',
														placeholder: 'data',
														description: 'Name of the binary property containing the file. Usually "data" from Read File or HTTP Request nodes.',
													},
													{
														displayName: 'Content ID',
														name: 'content_id',
														type: 'string',
														default: '',
														placeholder: 'image-1',
														description: 'Content ID for inline images. Reference in HTML as &lt;img src="cid:image-1"&gt;.',
													},
													{
														displayName: 'Content Type',
														name: 'content_type',
														type: 'string',
														default: '',
														placeholder: 'application/pdf',
														description: 'MIME type of the attachment (e.g., application/pdf). Auto-detected if not specified.',
													},
													{
														displayName: 'File Name',
														name: 'filename',
														type: 'string',
														default: '',
														placeholder: 'document.pdf',
														description: 'Filename shown to the recipient. Required for all attachments.',
													},
													{
														displayName: 'File URL',
														name: 'fileUrl',
														type: 'string',
														default: '',
														placeholder: 'https://example.com/file.pdf',
														description: 'Publicly accessible URL to the file. Resend will download and attach it.',
													},
													]
											},
									],
								description: 'File attachments. Use Binary Data for files from previous nodes or Remote URL for web files.',
							},
							{
								displayName: 'BCC',
								name: 'bcc',
								type: 'string',
								default: '',
								description: 'Blind carbon copy recipients. Comma-separated. Recipients will not see other BCC addresses.',
							},
							{
								displayName: 'CC',
								name: 'cc',
								type: 'string',
								default: '',
								description: 'Carbon copy recipients. Comma-separated. All recipients will see CC addresses.',
							},
							{
								displayName: 'Headers',
								name: 'headers',
								type: 'fixedCollection',
								default: {},
								options: [
											{
												name: 'headers',
												displayName: 'Header',
													values:	[
													{
														displayName: 'Name',
														name: 'name',
														type: 'string',
															required:	true,
														default: '',
													},
													{
														displayName: 'Value',
														name: 'value',
														type: 'string',
														default: '',
													},
													]
											},
									],
								description: 'Custom email headers for advanced use cases like email threading or tracking',
							},
							{
								displayName: 'Reply To',
								name: 'reply_to',
								type: 'string',
								default: '',
								description: 'Email address where replies should be sent. Can be different from the sender address.',
							},
							{
								displayName: 'Tags',
								name: 'tags',
								type: 'fixedCollection',
								default: {},
								options: [
											{
												name: 'tags',
												displayName: 'Tag',
													values:	[
													{
														displayName: 'Name',
														name: 'name',
														type: 'string',
															required:	true,
														default: '',
													},
													{
														displayName: 'Value',
														name: 'value',
														type: 'string',
															required:	true,
														default: '',
													},
													]
											},
									],
								description: 'Key-value tags for email categorization and analytics. Use for tracking campaigns or custom metadata.',
							},
							{
								displayName: 'Topic ID',
								name: 'topic_id',
								type: 'string',
								default: '',
								description: 'Topic identifier for subscription preferences. Obtain from the List Topics operation.',
							},
					]
					},
					{
						displayName: 'Email Format',
						name: 'emailFormat',
						type: 'options',
						options: [
							{
								name: 'HTML',
								value: 'html',
								description: 'Send email with HTML content only. Plain text auto-generated.',
							},
							{
								name: 'HTML and Text',
								value: 'both',
								description: 'Send email with both HTML and custom plain text',
							},
							{
								name: 'Text',
								value: 'text',
								description: 'Send email with plain text content only',
							},
					],
						default: 'html',
						description: 'Choose the content format for your email. HTML recommended for rich formatting.',
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'you@example.com',
						description: 'Sender email address. Must be from a verified domain. Format: "Name &lt;email@domain.com&gt;" or just email.',
					},
					{
						displayName: 'HTML Content',
						name: 'html',
						type: 'string',
						default: '',
						description: 'HTML body of the email. Use for rich formatting, images, and links.',
						placeholder: '<p>Your HTML content here</p>',
					},
					{
						displayName: 'Subject',
						name: 'subject',
						type: 'string',
							required:	true,
						default: '',
						placeholder: 'Hello from n8n!',
						description: 'Email subject line. Keep concise and descriptive.',
					},
					{
						displayName: 'Template Name or ID',
						name: 'templateId',
						type: 'string',
						default: '',
						placeholder: '34a080c9-b17d-4187-ad80-5af20266e535',
						description: 'Template ID or alias to use instead of HTML content. Obtain from List Templates operation.',
					},
					{
						displayName: 'Template Variables',
						name: 'templateVariables',
						type: 'fixedCollection',
						default: {},
						description: 'Key-value pairs to replace template placeholders. Keys must match the template variable names.',
						options: [
							{
								name: 'variables',
								displayName: 'Variable',
									values:	[
											{
												displayName: 'Key',
												name: 'key',
												type: 'string',
													required:	true,
												default: '',
											description: 'Variable name as defined in the template (e.g., FIRST_NAME, PRODUCT_NAME)',
										},
										{
											displayName: 'Value',
											name: 'value',
											type: 'string',
											default: '',
											description: 'The value to replace the variable placeholder with',
											},
									]
							},
					]
					},
					{
						displayName: 'Text Content',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Plain text content of the email',
						placeholder: 'Your plain text content here',
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
					{
						displayName: 'Use Template',
						name: 'useTemplate',
						type: 'boolean',
						default: false,
						description: 'Whether to send using a published template instead of HTML/Text content',
					},
			],
			},
		],
	},
	{
		displayName: 'Batch Options',
		name: 'batchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['sendBatch'],
			},
		},
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotency_key',
				type: 'string',
				default: '',
				description: 'Unique key to ensure the batch request is processed only once',
			},
			{
				displayName: 'Validation Mode',
				name: 'validation_mode',
				type: 'options',
				default: 'strict',
				options: [
					{
						name: 'Strict',
						value: 'strict',
						description: 'Reject the entire batch if any email fails validation',
					},
					{
						name: 'Permissive',
						value: 'permissive',
						description: 'Send valid emails and return errors for invalid ones',
					},
				],
				description: 'How Resend should validate the batch',
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

interface EmailInput {
	from: string;
	to: string;
	subject: string;
	useTemplate?: boolean;
	emailFormat?: string;
	html?: string;
	text?: string;
	templateId?: string;
	templateVariables?: { variables?: Array<{ key: string; value?: unknown }> };
	additionalOptions?: {
		attachments?: { attachments: AttachmentInput[] };
		bcc?: string;
		cc?: string;
		headers?: { headers: Array<{ name: string; value?: string }> };
		reply_to?: string;
		tags?: { tags: Array<{ name: string; value?: string }> };
		topic_id?: string;
	};
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const items = this.getInputData();
	const emailsData = this.getNodeParameter('emails', index) as { emails: EmailInput[] };
	const batchOptions = this.getNodeParameter('batchOptions', index, {}) as {
		idempotency_key?: string;
		validation_mode?: string;
	};

	const emails = emailsData.emails.map((email) => {
		const useTemplate = email.useTemplate ?? false;
		const emailFormat = email.emailFormat ?? 'html';
		const contentType = useTemplate ? 'template' : emailFormat;
		const additionalOptions = email.additionalOptions ?? {};

		const emailObj: Record<string, unknown> = {
			from: email.from,
			to: normalizeEmailList(email.to),
			subject: email.subject,
		};

		// Handle CC
		const ccValue = additionalOptions.cc;
		if (ccValue) {
			const ccList = normalizeEmailList(ccValue);
			if (ccList.length) {
				emailObj.cc = ccList;
			}
		}

		// Handle BCC
		const bccValue = additionalOptions.bcc;
		if (bccValue) {
			const bccList = normalizeEmailList(bccValue);
			if (bccList.length) {
				emailObj.bcc = bccList;
			}
		}

		// Handle Reply To
		const replyToValue = additionalOptions.reply_to;
		if (replyToValue) {
			const replyToList = normalizeEmailList(replyToValue);
			if (replyToList.length) {
				emailObj.reply_to = replyToList;
			}
		}

		// Handle Attachments
		const attachments = additionalOptions.attachments;
		if (attachments?.attachments?.length) {
			emailObj.attachments = attachments.attachments
				.map((attachment) => {
					const contentId = attachment.content_id;
					const contentType = attachment.content_type;
					const attachmentType = attachment.attachmentType ?? 'binaryData';

					if (attachmentType === 'binaryData') {
						const binaryPropertyName = attachment.binaryPropertyName || 'data';
						const binaryData = items[index].binary?.[binaryPropertyName];
						if (!binaryData) {
							throw new NodeOperationError(
								this.getNode(),
								`Binary property "${binaryPropertyName}" not found in item ${index}`,
								{ itemIndex: index },
							);
						}
						if (!attachment.filename) {
							throw new NodeOperationError(
								this.getNode(),
								'File Name is required for batch email attachments.',
								{ itemIndex: index },
							);
						}

						const attachmentEntry: Record<string, unknown> = {
							filename: attachment.filename,
							content: binaryData.data,
						};
						if (contentId) {
							attachmentEntry.content_id = contentId;
						}
						if (contentType) {
							attachmentEntry.content_type = contentType;
						}
						return attachmentEntry;
					} else if (attachmentType === 'url') {
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

		// Handle Headers
		const headersInput = additionalOptions.headers;
		if (headersInput?.headers?.length) {
			const headers: Record<string, string> = {};
			for (const header of headersInput.headers) {
				if (header.name) {
					headers[header.name] = header.value ?? '';
				}
			}
			if (Object.keys(headers).length) {
				emailObj.headers = headers;
			}
		}

		// Handle Tags
		const tagsInput = additionalOptions.tags;
		if (tagsInput?.tags?.length) {
			emailObj.tags = tagsInput.tags
				.filter((tag) => tag.name)
				.map((tag) => ({
					name: tag.name,
					value: tag.value ?? '',
				}));
		}

		// Handle Topic ID
		const topicId = additionalOptions.topic_id;
		if (topicId) {
			emailObj.topic_id = topicId;
		}

		// Handle content
		if (contentType === 'template') {
			if (!email.templateId) {
				throw new NodeOperationError(
					this.getNode(),
					'Template Name or ID is required for batch emails when using templates.',
					{ itemIndex: index },
				);
			}
			if (email.html || email.text) {
				throw new NodeOperationError(
					this.getNode(),
					'HTML/Text Content cannot be used when sending batch emails with templates.',
					{ itemIndex: index },
				);
			}
			emailObj.template = { id: email.templateId };
			const variables = buildTemplateSendVariables(email.templateVariables);
			if (variables && Object.keys(variables).length) {
				(emailObj.template as Record<string, unknown>).variables = variables;
			}
		} else {
			if (contentType === 'html' || contentType === 'both') {
				if (!email.html) {
					throw new NodeOperationError(
						this.getNode(),
						'HTML Content is required for batch emails.',
						{ itemIndex: index },
					);
				}
				emailObj.html = email.html;
			}

			if (contentType === 'text' || contentType === 'both') {
				if (!email.text) {
					throw new NodeOperationError(
						this.getNode(),
						'Text Content is required for batch emails.',
						{ itemIndex: index },
					);
				}
				emailObj.text = email.text;
			}
		}

		return emailObj;
	});

	const credentials = await this.getCredentials('resendApi');
	const apiKey = credentials.apiKey as string;

	const qs: Record<string, string> = {};
	if (batchOptions.validation_mode) {
		qs.validation_mode = batchOptions.validation_mode;
	}

	const headers: Record<string, string> = {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json',
	};
	if (batchOptions.idempotency_key) {
		headers['Idempotency-Key'] = batchOptions.idempotency_key;
	}

	const response = await this.helpers.httpRequest({
		url: `${RESEND_API_BASE}/emails/batch`,
		method: 'POST',
		headers,
		qs: Object.keys(qs).length ? qs : undefined,
		body: emails,
		json: true,
	});

	return [{ json: response }];
}
