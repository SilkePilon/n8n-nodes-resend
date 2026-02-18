# n8n-nodes-resend — Example Workflows

Ready-to-import n8n workflow examples demonstrating real-world use cases for the Resend n8n node.

## How to Import

1. Open your n8n instance
2. Go to **Workflows → New Workflow → More options (⋮) → Import from file**
3. Select the `.json` file and click **Import**
4. Follow the **Setup** instructions in each workflow's sticky notes

---

## Examples

### 01 — Contact Form → Create Contact & Send Welcome Email

**File:** `01-contact-form-welcome-email.json`

An n8n form captures new subscriber sign-ups, creates the contact in Resend's audience, and immediately sends a personalized branded welcome email.

**Nodes used:** n8n Form Trigger → Resend (Create Contact) → Resend (Send Email)

**Resend operations:** `contacts › create`, `email › send`

**Use cases:** Newsletter sign-up, product waitlist, community onboarding

---

### 02 — Email Bounce & Complaint Auto-Handler

**File:** `02-bounce-complaint-handler.json`

Listens for `email.bounced` and `email.complained` Resend webhook events, routes them by type, automatically marks the contact as unsubscribed in Resend, and sends an internal Slack-style alert email to your team.

**Nodes used:** Resend Trigger → Switch → Resend (Update Contact) × 2 → Resend (Send Alert Email) × 2

**Resend operations:** `resendTrigger (email.bounced, email.complained)`, `contacts › update`, `email › send`

**Use cases:** Deliverability protection, list hygiene, compliance (CAN-SPAM, GDPR)

---

### 03 — Weekly Newsletter Broadcast

**File:** `03-weekly-newsletter-broadcast.json`

Runs every Monday at 9 AM, creates a broadcast campaign in Resend targeting a specific segment, and immediately sends it. Subject line is dynamically dated.

**Nodes used:** Schedule Trigger → Resend (Create Broadcast) → Resend (Send Broadcast)

**Resend operations:** `broadcasts › create`, `broadcasts › send`

**Use cases:** Weekly newsletter, product digest, recurring announcements

---

### 04 — Lead Drip Campaign (3-Email Sequence)

**File:** `04-lead-nurturing-drip-campaign.json`

When a new lead arrives via webhook (e.g., from a form or CRM), the workflow creates a contact in Resend and schedules three emails: an immediate welcome, a value-focused email in 3 days, and a call-to-action email in 7 days — all via Resend's native email scheduling.

**Nodes used:** Webhook → Resend (Create Contact) → Resend (Send Now) → Resend (Send in 3 days) → Resend (Send in 7 days)

**Resend operations:** `contacts › create`, `email › send` (× 3, with `scheduledAt`)

**Use cases:** SaaS trial onboarding, lead nurturing, post-purchase sequence

---

### 05 — Expense Approval via Email (Send & Wait)

**File:** `05-expense-approval-send-and-wait.json`

An employee submits an expense via an n8n form. The workflow emails the manager an approval request with **Approve** / **Decline** buttons. Execution pauses until the manager clicks a button, then sends the appropriate confirmation email to the employee.

**Nodes used:** n8n Form Trigger → Resend (Send & Wait) → IF → Resend (Approval Email) / Resend (Rejection Email)

**Resend operations:** `email › sendAndWait`, `email › send`

**Use cases:** Expense approvals, interview scheduling, contract sign-offs, event RSVPs

---

### 06 — Email Engagement Tracker (Open & Click Events)

**File:** `06-email-engagement-tracker.json`

Listens for `email.opened` and `email.clicked` Resend events, formats the event data, and logs every interaction as a new row in a Google Sheet for analytics and follow-up.

**Nodes used:** Resend Trigger → Set (format data) → Google Sheets (append row)

**Resend operations:** `resendTrigger (email.opened, email.clicked)`

**Use cases:** Email analytics, engagement-based lead scoring, re-engagement tracking

---

## Prerequisites

All workflows require:

- **n8n-nodes-resend** node installed in your n8n instance
- A **Resend account** at [resend.com](https://resend.com)
- A **verified sending domain** in Resend (required for all outbound email operations)
- **Resend API Key** configured as a credential in n8n (`Settings → Credentials → New → Resend`)

For trigger-based workflows (02, 06):

- **Resend Webhook Signing Secret** credential configured in n8n
- Webhook URL from n8n registered in your [Resend Webhooks dashboard](https://resend.com/webhooks)

For workflow 06:

- A **Google Sheets** credential configured in n8n with a target spreadsheet

---

## Tips

- All workflows are **inactive by default** — review and configure before activating
- Update placeholder values (`hello@yourcompany.com`, segment IDs, etc.) before use
- Use **Test mode** in the Resend Trigger node while building — it shows events in the editor
- Resend's `scheduledAt` field accepts natural language like `"in 3 days"` or ISO 8601 strings
