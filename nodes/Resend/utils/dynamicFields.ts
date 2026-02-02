import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';

/**
 * Maps resource names to their corresponding API methods for loading dropdown options.
 * Used to dynamically determine which method to call for each resource type.
 */
export const RESOURCE_METHOD_MAP = {
	audience: 'getAudiences',
	broadcast: 'getBroadcasts',
	contact: 'getContacts',
	domain: 'getDomains',
	webhook: 'getWebhooks',
	apiKey: 'getApiKeys',
	contactProperty: 'getContactProperties',
	email: 'getEmails',
	receivedEmail: 'getReceivedEmails',
	segment: 'getSegments',
	template: 'getTemplates',
	topic: 'getTopics',
} as const;

/**
 * Maps resource names to their human-readable display names.
 * Used for generating consistent field labels across the application.
 */
export const RESOURCE_DISPLAY_MAP = {
	audience: 'Audience',
	broadcast: 'Broadcast',
	contact: 'Contact',
	domain: 'Domain',
	webhook: 'Webhook',
	apiKey: 'API Key',
	contactProperty: 'Contact Property',
	email: 'Email',
	receivedEmail: 'Received Email',
	segment: 'Segment',
	template: 'Template',
	topic: 'Topic',
} as const;

/**
 * Configuration options for creating dynamic ID fields.
 */
export interface DynamicIdFieldOptions {
	/** Base name for the field (e.g., 'contactId', 'templateId') */
	fieldName: string;
	/** Resource name (e.g., 'contact', 'template') - must match keys in RESOURCE_METHOD_MAP */
	resourceName: keyof typeof RESOURCE_METHOD_MAP;
	/** Human-readable display name for the field */
	displayName: string;
	/** Whether the field is required */
	required?: boolean;
	/** Placeholder text for the manual input field */
	placeholder?: string;
	/** Additional description for the field */
	description?: string;
	/** Display options to control when fields are shown */
	displayOptions?: INodeProperties['displayOptions'];
}

/**
 * Creates a dynamic ID field set that provides both dropdown selection and manual input options.
 *
 * This function generates three interconnected fields:
 * 1. A choice selector (dropdown vs manual input)
 * 2. An API-populated dropdown for selecting from existing resources
 * 3. A manual text input for entering IDs directly
 *
 * The fields use conditional display logic to show/hide based on user selection.
 *
 * @param options Configuration options for the dynamic ID fields
 * @returns Array of INodeProperties representing the complete field set
 *
 * @example
 * ```typescript
 * // Create dynamic fields for template selection
 * const templateFields = createDynamicIdField({
 *   fieldName: 'templateId',
 *   resourceName: 'template',
 *   displayName: 'Template',
 *   required: true,
 *   placeholder: '34a080c9-b17d-4187-ad80-5af20266e535',
 *   description: 'The template to use for this operation',
 *   displayOptions: {
 *     show: {
 *       resource: ['email'],
 *       operation: ['send']
 *     }
 *   }
 * });
 * ```
 */
export function createDynamicIdField(options: DynamicIdFieldOptions): INodeProperties[] {
	const {
		fieldName,
		resourceName,
		displayName,
		required = false,
		placeholder,
		description,
		displayOptions,
	} = options;

	// Get the display name for the resource
	const resourceDisplayName = RESOURCE_DISPLAY_MAP[resourceName];

	// Get the method name for loading options
	const methodName = RESOURCE_METHOD_MAP[resourceName];

	// Generate field names
	const choiceFieldName = `${fieldName}Choice`;
	const dropdownFieldName = `${fieldName}Dropdown`;
	const manualFieldName = `${fieldName}Manual`;

	return [
		// Choice selector: From list vs By ID
		{
			displayName: `${displayName} Selection`,
			name: choiceFieldName,
			type: 'options',
			options: [
				{
					name: 'From List',
					value: 'fromList',
					description: `Select ${resourceDisplayName.toLowerCase()} from dropdown list`,
				},
				{
					name: `By ${resourceDisplayName} ID`,
					value: 'byId',
					description: `Enter ${resourceDisplayName.toLowerCase()} ID manually`,
				},
			],
			default: 'fromList',
			displayOptions,
			description: `Choose how to specify the ${resourceDisplayName.toLowerCase()} - select from list or enter ID manually`,
		},

		// API-populated dropdown (shown when "From list" selected)
		{
			displayName: `${displayName} Name or ID`,
			name: dropdownFieldName,
			type: 'options',
			required,
			default: '',
			placeholder: placeholder || `Select ${resourceDisplayName.toLowerCase()}...`,
			typeOptions: {
				loadOptionsMethod: methodName,
			},
			displayOptions: {
				...displayOptions,
				show: {
					...displayOptions?.show,
					[choiceFieldName]: ['fromList'],
				},
			},
			description: description || `Select a ${resourceDisplayName.toLowerCase()} or enter an ID/alias using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.`,
		},

		// Manual text input (shown when "By ID" selected)
		{
			displayName: `${displayName} ID`,
			name: manualFieldName,
			type: 'string',
			required,
			default: '',
			placeholder: placeholder || `Enter ${resourceDisplayName.toLowerCase()} ID...`,
			displayOptions: {
				...displayOptions,
				show: {
					...displayOptions?.show,
					[choiceFieldName]: ['byId'],
				},
			},
			description: description || `Enter the ${resourceDisplayName.toLowerCase()} ID directly. You can use expressions to set this value dynamically.`,
		},
	];
}

/**
 * Resolves the actual ID value from dynamic ID fields during workflow execution.
 *
 * This helper function determines which field contains the actual ID value based on the
 * choice selection and returns the appropriate value for use in API calls.
 *
 * @param executeFunctions The n8n execution context
 * @param fieldName Base field name used when creating the dynamic fields
 * @param index Current item index in the workflow execution
 * @returns The resolved ID value as a string
 *
 * @example
 * ```typescript
 * // In an operation's execute function
 * export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
 *   const templateId = resolveDynamicIdValue(this, 'templateId', index);
 *
 *   const response = await apiRequest.call(this, 'GET', `/templates/${templateId}`);
 *   return [{ json: response }];
 * }
 * ```
 */
export function resolveDynamicIdValue(
	executeFunctions: IExecuteFunctions,
	fieldName: string,
	index: number,
): string {
	const choiceFieldName = `${fieldName}Choice`;
	const dropdownFieldName = `${fieldName}Dropdown`;
	const manualFieldName = `${fieldName}Manual`;

	const choice = executeFunctions.getNodeParameter(choiceFieldName, index) as string;

	if (choice === 'fromList') {
		return executeFunctions.getNodeParameter(dropdownFieldName, index) as string;
	} else {
		return executeFunctions.getNodeParameter(manualFieldName, index) as string;
	}
}