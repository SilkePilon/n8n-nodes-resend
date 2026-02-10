# Resend Node Example Workflows

This folder contains example n8n workflows demonstrating the capabilities of the Resend node. These examples show real-world use cases including email automation, contact management, trigger-based workflows, and human-in-the-loop approval processes.

## How to Import Workflows

### Method 1: Import from File (Recommended)

1. Open your n8n instance
2. Click the **+** button or go to **Workflows** menu
3. Click **Create new workflow** (or use an existing one)
4. Click the **three dots menu** (⋮) in the top-right corner
5. Select **Import from File...**
6. Choose the `.json` file you want to import
7. The workflow will be loaded into the editor

### Method 2: Copy and Paste

1. Open the `.json` file in a text editor
2. Select and copy the entire JSON content (Ctrl+C / Cmd+C)
3. In n8n, create a new workflow or open an existing one
4. Paste the content (Ctrl+V / Cmd+V) directly into the workflow editor canvas
5. The nodes will appear on the canvas

### Method 3: Import from URL

If you're hosting these files online:

1. Click the **three dots menu** (⋮) in the top-right corner
2. Select **Import from URL...**
3. Paste the raw URL to the JSON file
4. Click **Import**

## After Importing

After importing a workflow, you'll need to:

1. **Configure Credentials**: Click on each Resend node and select or create your Resend API credentials
2. **Update Email Addresses**: Replace placeholder email addresses (like `your@email.com`) with real addresses
3. **Adjust Webhook URLs**: For trigger workflows, copy the webhook URL and configure it in your Resend dashboard
4. **Test the Workflow**: Use "Execute Workflow" to test before activating

---

## Example Workflows

### 1. Trigger: Email Event Tracking (`trigger-email-events.json`)

**Description**: Monitors email delivery events (sent, delivered, opened, clicked, bounced) and logs them to a Google Sheet for analytics and reporting.

**Use Case**: Track email engagement metrics, identify delivery issues, build marketing analytics dashboards.

**Nodes Used**:

- Resend Trigger (monitors email events)
- Switch (routes events by type)
- Google Sheets (logs events)

**Key Features**:

- Secure webhook signature verification
- Filters for specific event types
- Structured data logging

---

### 2. Trigger: Contact Sync on Events (`trigger-contact-sync.json`)

**Description**: Automatically syncs contact changes from Resend to external systems when contacts are created, updated, or deleted.

**Use Case**: Keep your CRM, database, or marketing tools in sync with your Resend contacts.

**Nodes Used**:

- Resend Trigger (contact.created, contact.updated, contact.deleted events)
- Switch (routes by event type)
- HTTP Request (syncs to external API)

**Key Features**:

- Real-time contact synchronization
- Event-type routing
- External system integration

---

### 3. Human-in-the-Loop: Approval Workflow (`human-in-loop-approval.json`)

**Description**: Implements an approval workflow where content or requests are sent via email for manager approval. The workflow pauses until the recipient clicks Approve or Decline.

**Use Case**: Document approval, expense requests, content publishing approval, access requests.

**Nodes Used**:

- Manual Trigger (initiates approval)
- Resend (Send and Wait for Approval)
- IF (routes based on approval decision)
- Slack or HTTP Request (notifies of outcome)

**Key Features**:

- Dual button (Approve/Decline) options
- Automatic workflow pause and resume
- Customizable button labels and styling
- Configurable timeout

---

### 4. Human-in-the-Loop: Free Text Response (`human-in-loop-freetext.json`)

**Description**: Sends an email requesting feedback or input, with a link to a form where the recipient can provide a free-text response. Perfect for collecting qualitative feedback.

**Use Case**: Customer feedback collection, survey responses, support ticket updates, interview scheduling.

**Nodes Used**:

- Schedule Trigger (daily/weekly triggers)
- Resend (Send and Wait for Free Text)
- Code (processes response)
- Notion or Airtable (stores responses)

**Key Features**:

- Form-based response collection
- Automatic response processing
- Integration with databases

---

### 5. Broadcast Campaign Automation (`broadcast-automation.json`)

**Description**: Creates and schedules broadcast email campaigns using templates, with automatic segment targeting and scheduling.

**Use Case**: Newsletter distribution, marketing campaigns, product announcements.

**Nodes Used**:

- Schedule Trigger (weekly trigger)
- Resend (Broadcast: create, send)
- Resend (Segment: list)

**Key Features**:

- Template-based content
- Scheduled sending
- Segment targeting
- Broadcast status tracking

---

### 6. Domain & Webhook Management (`domain-webhook-setup.json`)

**Description**: Automates domain verification and webhook configuration for new Resend accounts or domain additions.

**Use Case**: Onboarding automation, multi-tenant email setup, infrastructure management.

**Nodes Used**:

- Manual Trigger
- Resend (Domain: create, verify)
- Resend (Webhook: create, list)

**Key Features**:

- Domain DNS verification
- Webhook endpoint registration
- Event subscription configuration

---

## Prerequisites

Before using these workflows, ensure you have:

1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **API Key**: Generate from your Resend dashboard
3. **Verified Domain** (for sending): Add and verify your sending domain
4. **n8n-nodes-resend Installed**: Install this community node in your n8n instance

## Credential Setup

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for "Resend API"
3. Enter your Resend API key
4. Test the connection and save

## Webhook Configuration (for Trigger Workflows)

For workflows using the **Resend Trigger** node:

1. Note the webhook URL shown in the trigger node
2. Go to your [Resend Dashboard](https://resend.com/webhooks)
3. Click **Add Webhook**
4. Paste the n8n webhook URL
5. Select the events you want to receive
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Paste the signing secret into the trigger node's configuration

## Tips

- **Test Mode**: Use the "Listen for test event" mode when building workflows
- **Production Mode**: Activate the workflow and use the production URL for live data
- **Error Handling**: Consider adding Error Trigger nodes to handle failures gracefully
- **Rate Limits**: Be aware of Resend API rate limits for high-volume operations

## Support

For issues with:

- **These examples**: Open an issue in this repository
- **Resend API**: Check [Resend Documentation](https://resend.com/docs)
- **n8n**: Visit [n8n Documentation](https://docs.n8n.io)
