export { sendAndWaitWebhooksDescription, limitWaitTimeOption } from './descriptions';
export type { IEmail, SendAndWaitConfig, FormResponseTypeOptions } from './interfaces';
export {
	getSendAndWaitProperties,
	sendAndWaitWebhook,
	getSendAndWaitConfig,
	createButton,
	createEmail,
	SEND_AND_WAIT_WAITING_TOOLTIP,
	configureWaitTillDate,
	sendResendEmail,
} from './utils';
export {
	ACTION_RECORDED_PAGE,
	BUTTON_STYLE_PRIMARY,
	BUTTON_STYLE_SECONDARY,
	createEmailBody,
	createEmailBodyWithN8nAttribution,
	createEmailBodyWithoutN8nAttribution,
} from './email-templates';
