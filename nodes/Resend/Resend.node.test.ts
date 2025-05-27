import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	SEND_AND_WAIT_OPERATION,
	IWebhookFunctions,
	NodeConnectionType, // Added for Resend class type safety
	WAIT_INDEFINITELY, // Added for Resend class type safety
} from 'n8n-workflow';
import { Resend } from './Resend.node';

// Mock utilities that would be imported by Resend.node.ts
// These paths are relative to Resend.node.ts.
// If n8n uses Jest moduleNameMapper or another mechanism, this might need adjustment.
jest.mock('../../packages/nodes-base/utils/sendAndWait/utils', () => ({
	...jest.requireActual('../../packages/nodes-base/utils/sendAndWait/utils'), // Retain other exports
	createButton: jest.fn((url, label, value, style) => `<a href='${url}?approved=${value}' style='${style}'>${label}</a>`),
	getSendAndWaitConfig: jest.fn(params => params), // Simple mock, adjust if complex logic is needed
}));

jest.mock('../../packages/nodes-base/utils/sendAndWait/email-templates', () => ({
	...jest.requireActual('../../packages/nodes-base/utils/sendAndWait/email-templates'),
	createEmailBodyWithN8nAttribution: jest.fn((message, buttons, instanceId) => `<html><body>${message}${buttons}<!-- ${instanceId} --></body></html>`),
	createEmailBodyWithoutN8nAttribution: jest.fn((message, buttons) => `<html><body>${message}${buttons}</body></html>`),
	ACTION_RECORDED_PAGE: '<html><body>Action Recorded</body></html>',
}));

jest.mock('../../packages/nodes-base/utils/sendAndWait/configureWaitTillDate.util', () => ({
	configureWaitTillDate: jest.fn(() => new Date()), // Simple mock
}));


describe('Resend Node - HITL Functionality', () => {
	let executeFunctions: IExecuteFunctions;

	beforeEach(() => {
		executeFunctions = {
			getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-api-key' }),
			getNodeParameter: jest.fn(),
			getInputData: jest.fn().mockReturnValue([{ json: {}, pairedItem: { item: 0 } }]), // Default input
			evaluateExpression: jest.fn(expr => {
				if (expr === '{{ $execution?.resumeUrl }}') return 'https://n8n.example.com/resume';
				if (expr === '{{ $nodeId }}') return 'test-node-id';
				return expr; // Fallback for other expressions if any
			}),
			getInstanceId: jest.fn().mockReturnValue('test-instance-id'),
			putExecutionToWait: jest.fn().mockResolvedValue(undefined), // For send test, resolve immediately
			helpers: {
				httpRequest: jest.fn().mockResolvedValue({ id: 'email-send-receipt-xyz' }), // Mock Resend API success
			},
			continueOnFail: jest.fn().mockReturnValue(false),
			// Mock getNode and its getNodeParameter for potential internal calls if any
			getNode: jest.fn().mockReturnValue({ 
				getNodeParameter: jest.fn(),
				getContext: jest.fn().mockReturnValue({}), // Add if context is used
			} as any),
		} as unknown as IExecuteFunctions;
	});

	test('should construct and send HITL email correctly for approval type (single button)', async () => {
		(executeFunctions.getNodeParameter as jest.Mock)
			.mockImplementation((paramName: string, itemIndex: number, defaultValue?: any) => {
				// console.log(`getNodeParameter called for: ${paramName}`); // For debugging
				if (paramName === 'resource') return 'email';
				if (paramName === 'operation') return SEND_AND_WAIT_OPERATION;
				if (paramName === 'fromHitl') return 'sender@example.com';
				if (paramName === 'toHitl') return 'receiver@example.com';
				if (paramName === 'subjectHitl') return 'Test Subject HITL - Approval Single';
				if (paramName === 'messageHitl') return 'Test Message for Approval';
				if (paramName === 'responseTypeHitl') return 'approval';
				if (paramName === 'approvalOptionsHitl.values') {
					return { 
						approvalType: 'single', 
						approveLabel: 'Approve Now!',
						buttonApprovalStyle: 'primary',
					};
				}
				if (paramName === 'hitlSettings') {
					return { 
						appendAttribution: true, 
						limitWaitTime: { values: { limitType: 'afterTimeInterval', resumeAmount: 30, resumeUnit: 'minutes' } } 
					};
				}
				return defaultValue;
			});

		const node = new Resend();
		// Call execute method with the mocked 'this' context
		await node.execute.call(executeFunctions as IExecuteFunctions);

		expect(executeFunctions.helpers.httpRequest).toHaveBeenCalledTimes(1);
		expect(executeFunctions.helpers.httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				url: 'https://api.resend.com/emails',
				body: expect.objectContaining({
					from: 'sender@example.com',
					to: ['receiver@example.com'],
					subject: 'Test Subject HITL - Approval Single',
					html: expect.stringContaining("<html><body>Test Message for Approval<a href='https://n8n.example.com/resume/test-node-id?approved=true' style='primary'>Approve Now!</a><!-- test-instance-id --></body></html>"),
				}),
				headers: expect.objectContaining({
					Authorization: 'Bearer test-api-key',
					'Content-Type': 'application/json',
				}),
				json: true, // As per Resend.node.ts
			}),
		);
		// Check if putExecutionToWait was called. The exact date can be tricky, so expect.anything() or a more specific check if needed.
		expect(executeFunctions.putExecutionToWait).toHaveBeenCalledWith(expect.any(Date)); 
	});
	
	// Placeholder for more tests as suggested in the prompt
	test.todo('should construct and send HITL email correctly for approval type (double button)');
	test.todo('should construct and send HITL email correctly for free text type');
	test.todo('webhook should handle approval response correctly');
	test.todo('webhook should render free text form on GET and handle POST response');
	test.todo('execute should return original data on HITL timeout');
	test.todo('execute should return webhook data if received for HITL');

});

// Minimal IWebhookFunctions mock for completeness if webhook tests are added later
const mockWebhookFunctions = {
    getRequestObject: jest.fn(),
    getResponseObject: jest.fn().mockReturnValue({ render: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() }),
    getNodeParameter: jest.fn(),
    getBodyData: jest.fn(),
    // ... other IWebhookFunctions methods if needed
} as unknown as IWebhookFunctions;
