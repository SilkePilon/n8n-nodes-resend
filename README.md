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
    *   `From`: (String, Required) The sender's email address (e.g., `you@yourdomain.com`). Must be a verified domain in Resend.
    *   `To`: (String, Required) Comma-separated list of recipient email addresses (e.g., `user1@example.com, user2@example.com`).
    *   `Subject`: (String, Required) The subject line of the email.
    *   `HTML Body`: (String, Required) The HTML content of the email.
    *   `Text Body`: (String, Optional) The plain text content of the email. It's recommended to include this for email clients that don't support HTML.
    *   `CC`: (String, Optional) Comma-separated list of CC recipient email addresses.
    *   `BCC`: (String, Optional) Comma-separated list of BCC recipient email addresses.
    *   `Reply To`: (String, Optional) An email address to set as the reply-to address.
    *   `Tags`: (Collection, Optional) A list of tags (name/value pairs) to categorize the email (e.g., `[{ "name": "category", "value": "transactional" }]`).

### Resend Trigger Node

*   **Name:** `Resend Trigger`
*   **Description:** Receives and processes webhook events from Resend for various email activities.

#### Setup

1.  **Add the `Resend Trigger` node** to your n8n workflow.
2.  Open the node's parameters. You will see a **Webhook URL**. Copy this URL.
3.  In your Resend dashboard, navigate to **API** -> **Webhooks** ([https://resend.com/webhooks](https://resend.com/webhooks)).
4.  Click **Add webhook** (or similar button).
5.  Paste the copied n8n Webhook URL into the "Webhook URL" field in Resend.
6.  **Events to send:** Select the specific email events you want Resend to send to your n8n trigger.
7.  After saving the webhook in Resend, it will display a **Webhook Signing Secret**. This is a crucial security token (usually starts with `whsec_`). Copy this secret.
8.  Go back to your n8n `Resend Trigger` node and paste this secret into the **Webhook Signing Secret** parameter.
9.  In the `Resend Trigger` node, select the same **Events** that you configured in the Resend webhook settings. The available event types include:
    *   `email.sent`
    *   `email.delivered`
    *   `email.delivery_delayed`
    *   `email.complained` (spam complaint)
    *   `email.bounced`
    *   `email.opened`
    *   `email.clicked`
    *   `contact.created`
    *   `contact.updated`
    *   `contact.deleted`
    *   `domain.created`
    *   `domain.updated`
    *   `domain.deleted`

#### Output

The trigger node will output the JSON payload sent by Resend for the configured event. This payload contains detailed information about the event, such as the email ID, recipient, timestamp, and event-specific data.

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
