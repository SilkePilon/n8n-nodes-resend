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
		description: 'Sends emails via Resend API',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Email',
						value: 'sendEmail',
						action: 'Send an email',
						routing: {
							request: {
								method: 'POST',
								url: 'https://api.resend.com/emails',
							},
						},
					},
				],
				default: 'sendEmail',			},			// Email Format Selection
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
				name: 'fromEmail',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'you@example.com',
				displayOptions: {
					show: {
						operation: ['sendEmail'],
					},
				},
				description: 'Sender email address',
			},
			{
				displayName: 'To',
				name: 'toEmail',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'user@example.com',
				displayOptions: {
					show: {
						operation: ['sendEmail'],
					},
				},
				description: 'Comma-separated list of recipient email addresses',
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
						operation: ['sendEmail'],
					},
				},
			},			{
				displayName: 'HTML Content',
				name: 'htmlBody',
				type: 'string',
				required: true,
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: '<p>Your HTML content here</p>',
				displayOptions: {
					show: {
						operation: ['sendEmail'],
						emailFormat: ['html', 'both'],
					},
				},
				description: 'HTML content of the email',
			},			{
				displayName: 'Text Content',
				name: 'textBody',
				type: 'string',
				required: true,
				default: '',
				typeOptions: {
					multiline: true,
				},
				placeholder: 'Your plain text content here',
				displayOptions: {
					show: {
						operation: ['sendEmail'],
						emailFormat: ['text', 'both'],
					},
				},
				description: 'Plain text content of the email',
			},			// Optional Options Section
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['sendEmail'],
					},
				},
				description: 'Optional email settings like CC, BCC, Reply-To, and tags',options: [
					{
						displayName: 'BCC',
						name: 'bccEmail',
						type: 'string',
						default: '',
						placeholder: 'bcc@example.com',
						description: 'Comma-separated list of BCC email addresses',
					},
					{
						displayName: 'CC',
						name: 'ccEmail',
						type: 'string',
						default: '',
						placeholder: 'cc@example.com',
						description: 'Comma-separated list of CC email addresses',
					},
					{
						displayName: 'Reply To',
						name: 'replyToEmail',
						type: 'string',
						default: '',
						placeholder: 'reply@example.com',
						description: 'Email address to set as reply-to',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'fixedCollection',
						default: {},
						placeholder: 'Add Tag',
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								name: 'tag',
								displayName: 'Tag',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the tag',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the tag',
									},
								],
							},
						],
						description: 'Tags to categorize the email',
					},
					{
						displayName: 'Text Content (Fallback)',
						name: 'textBodyFallback',
						type: 'string',
						default: '',
						typeOptions: {
							multiline: true,
						},
						placeholder: 'Plain text fallback for HTML emails',
						displayOptions: {
							show: {
								'/emailFormat': ['html'],
							},
						},
						description: 'Optional plain text version for HTML emails',
					},],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('resendApi');
				const apiKey = credentials.apiKey as string;				if (operation === 'sendEmail') {
					const fromEmail = this.getNodeParameter('fromEmail', i) as string;
					const toEmail = this.getNodeParameter('toEmail', i) as string;
					const subject = this.getNodeParameter('subject', i) as string;
					const emailFormat = this.getNodeParameter('emailFormat', i) as string;
					
					// Get content based on format
					const htmlBody = (emailFormat === 'html' || emailFormat === 'both') 
						? this.getNodeParameter('htmlBody', i) as string 
						: '';
					const textBody = (emailFormat === 'text' || emailFormat === 'both') 
						? this.getNodeParameter('textBody', i) as string 
						: '';					// Get options
					const options = this.getNodeParameter('options', i, {}) as any;
					const ccEmail = options.ccEmail || '';
					const bccEmail = options.bccEmail || '';
					const replyToEmail = options.replyToEmail || '';
					const textBodyFallback = options.textBodyFallback || '';
					const tagsData = options.tags || { tag: [] };// Build request body
					const requestBody: any = {
						from: fromEmail,
						to: toEmail.split(',').map((email: string) => email.trim()).filter((email: string) => email),
						subject: subject,
					};

					// Add content based on format
					if (emailFormat === 'html' || emailFormat === 'both') {
						requestBody.html = htmlBody;
					}
					if (emailFormat === 'text' || emailFormat === 'both') {
						requestBody.text = textBody;
					} else if (emailFormat === 'html' && textBodyFallback) {
						// Use fallback text for HTML-only emails
						requestBody.text = textBodyFallback;
					}

					// Add optional fields
					if (ccEmail) {
						requestBody.cc = ccEmail.split(',').map((email: string) => email.trim()).filter((email: string) => email);
					}
					if (bccEmail) {
						requestBody.bcc = bccEmail.split(',').map((email: string) => email.trim()).filter((email: string) => email);
					}
					if (replyToEmail) {
						requestBody.reply_to = replyToEmail;
					}					if (tagsData.tag && tagsData.tag.length > 0) {
						requestBody.tags = tagsData.tag.map((t: { name: string; value: string }) => ({ name: t.name, value: t.value }));
					}

					const response = await this.helpers.httpRequest({
						url: 'https://api.resend.com/emails',
						method: 'POST',
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body: requestBody,
						json: true,
					});

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
}
