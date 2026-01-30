import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';

export const description: INodeProperties[] = [
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
		displayName: 'Create Fields',
		name: 'contactCreateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['create'],
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
				displayName: 'Properties',
				name: 'properties',
				type: 'fixedCollection',
				default: { properties: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'properties',
						displayName: 'Property',
						values: [
							{
								displayName: 'Key',
								name: 'key',
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
			},
			{
				displayName: 'Segments',
				name: 'segments',
				type: 'fixedCollection',
				default: { segments: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'segments',
						displayName: 'Segment',
						values: [
							{
								displayName: 'Segment ID',
								name: 'id',
								type: 'string',
								required: true,
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Topics',
				name: 'topics',
				type: 'fixedCollection',
				default: { topics: [] },
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'topics',
						displayName: 'Topic',
						values: [
							{
								displayName: 'Topic ID',
								name: 'id',
								type: 'string',
								required: true,
								default: '',
							},
							{
								displayName: 'Subscription',
								name: 'subscription',
								type: 'options',
								default: 'opt_in',
								options: [
									{ name: 'Opt In', value: 'opt_in' },
									{ name: 'Opt Out', value: 'opt_out' },
								],
							},
						],
					},
				],
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
];

interface PropertyItem {
	key: string;
	value: string;
}

interface SegmentItem {
	id: string;
}

interface TopicItem {
	id: string;
	subscription: string;
}

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', index) as string;
	const createFields = this.getNodeParameter('contactCreateFields', index, {}) as {
		first_name?: string;
		last_name?: string;
		unsubscribed?: boolean;
		properties?: { properties: PropertyItem[] };
		segments?: { segments: SegmentItem[] };
		topics?: { topics: TopicItem[] };
	};

	const body: IDataObject = { email };

	if (createFields.first_name) {
		body.first_name = createFields.first_name;
	}
	if (createFields.last_name) {
		body.last_name = createFields.last_name;
	}
	if (createFields.unsubscribed !== undefined) {
		body.unsubscribed = createFields.unsubscribed;
	}

	if (createFields.properties?.properties?.length) {
		const props: Record<string, string> = {};
		for (const p of createFields.properties.properties) {
			props[p.key] = p.value;
		}
		body.properties = props;
	}

	if (createFields.segments?.segments?.length) {
		body.segments = createFields.segments.segments.map((s) => ({ id: s.id }));
	}

	if (createFields.topics?.topics?.length) {
		body.topics = createFields.topics.topics.map((t) => ({
			id: t.id,
			subscription: t.subscription,
		}));
	}

	const response = await apiRequest.call(this, 'POST', '/contacts', body);

	return [{ json: response }];
}
