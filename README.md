# Resend Nodes for n8n

## Overview

This package provides n8n nodes to interact with the Resend email platform. It allows you to:

*   Send emails using the Resend API.
*   Receive and process webhook events from Resend for various email activities.

This integration uses the official [Resend API](https://resend.com/docs/api-reference/introduction).

## Prerequisites/Setup

*   You need a Resend account. If you don't have one, you can sign up at [resend.com](https://resend.com/).
*   For detailed information about the Resend API, refer to the official [API Documentation](https://resend.com/docs/api-reference/introduction).

## Credentials Setup (`ResendApi`)

To use these nodes, you need to configure the "Resend API" credentials in n8n:

1.  In your n8n workspace, go to **Credentials** and click **Add credential**.
2.  Search for "Resend API" and select it.
3.  Fill in the required field:
    *   **API Key**: Your Resend API key.
4.  You can find your API Key in your Resend dashboard under **API Keys** ([https://resend.com/api-keys](https://resend.com/api-keys)). Create a new API key if you haven't already, ensuring it has the necessary permissions (e.g., "Full access" for sending emails).
5.  Save the credential.

## Nodes

### Resend Action Node

*   **Name:** `Resend`
*   **Description:** Allows sending emails and performing other Resend actions (currently, only sending email is implemented).

#### Operations

##### Send Email

*   **Description:** Sends an email using the Resend API.
*   **Parameters:**
    *   **Email Format**: Choose between HTML, Text, or Both formats for your email content.
    *   **From**: (String, Required) The sender's email address (e.g., `you@yourdomain.com`). Must be a verified domain in Resend.
    *   **To**: (String, Required) Comma-separated list of recipient email addresses (e.g., `user1@example.com, user2@example.com`).
    *   **Subject**: (String, Required) The subject line of the email.
    *   **HTML Content**: (String, Required for HTML/Both formats) The HTML content of the email.
    *   **Text Content**: (String, Required for Text/Both formats) The plain text content of the email.
    *   **Additional Options**: (Collection, Optional) Contains optional email parameters:
        *   **CC**: Comma-separated list of CC recipient email addresses.
        *   **BCC**: Comma-separated list of BCC recipient email addresses.
        *   **Reply To**: An email address to set as the reply-to address.
        *   **Text Content (Fallback)**: Plain text version for HTML-only emails (recommended for better deliverability).
    *   **Tags**: (Collection, Optional) A list of tags (name/value pairs) to categorize the email (e.g., `[{ "name": "category", "value": "transactional" }]`).

### Resend Trigger Node

*   **Name:** `Resend Trigger`
*   **Description:** Receives and processes webhook events from Resend for various email activities.

#### Setup

1.  **Add the `Resend Trigger` node** to your n8n workflow.
2.  **Configure the node parameters:**
    *   **Webhook Signing Secret**: Enter your Resend webhook signing secret (starts with `whsec_`). You'll get this from step 4 below.
    *   **Events**: Select the specific email events you want Resend to send to your n8n trigger.
3.  **Copy the webhook URL**: In the trigger node, you'll see a webhook URL displayed. Copy this URL (use the test URL while building your workflow, and the production URL when the workflow is activated).
4.  **Configure webhook in Resend dashboard:**
    *   Navigate to **API** -> **Webhooks** in your Resend dashboard ([https://resend.com/webhooks](https://resend.com/webhooks)).
    *   Click **Add webhook**.
    *   Paste the copied n8n webhook URL into the "Webhook URL" field.
    *   Select the same events that you configured in your n8n trigger node.
    *   Save the webhook configuration.
    *   Copy the **Webhook Signing Secret** that Resend displays (starts with `whsec_`).
5.  **Add the signing secret**: Go back to your n8n `Resend Trigger` node and paste the signing secret into the **Webhook Signing Secret** parameter.

#### Supported Events

The trigger node supports all Resend webhook event types:

*   **Email Events:**
    *   `email.sent` - Email was sent successfully
    *   `email.delivered` - Email was delivered to the recipient
    *   `email.delivery_delayed` - Email delivery was delayed
    *   `email.complained` - Recipient marked email as spam
    *   `email.bounced` - Email bounced (recipient address invalid)
    *   `email.opened` - Recipient opened the email
    *   `email.clicked` - Recipient clicked a link in the email
*   **Contact Events:**
    *   `contact.created` - New contact was created
    *   `contact.updated` - Contact information was updated
    *   `contact.deleted` - Contact was deleted
*   **Domain Events:**
    *   `domain.created` - New domain was added
    *   `domain.updated` - Domain configuration was updated
    *   `domain.deleted` - Domain was removed

#### Security

The trigger node automatically verifies webhook signatures using the Svix library to ensure webhooks are coming from Resend. This prevents unauthorized webhook calls to your n8n workflow.

#### Output

The trigger node outputs the complete JSON payload sent by Resend for the configured event. This payload contains detailed information about the event, such as:
*   Email ID and message details
*   Recipient information
*   Timestamp of the event
*   Event-specific data (e.g., bounce reason, click data)

## Example Usage

*   **Resend Action Node:**
    *   _Scenario:_ When a new user signs up in your application (e.g., via a webhook from your backend or a database trigger), use the `Resend` node to send them a personalized welcome email.
*   **Resend Trigger Node:**
    *   _Scenario:_ When an `email.bounced` event is received, you could have a workflow that:
        1.  Parses the bounced email address from the trigger output.
        2.  Updates a contact record in your CRM to mark the email as invalid.
        3.  Notifies your support team about the bounce.

## License

MIT

## Contribution & Issues

Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to:

*   Raise an issue on the GitHub repository.
*   Fork the repository and submit a pull request.
