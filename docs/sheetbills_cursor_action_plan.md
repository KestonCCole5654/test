📘 Code Guide Document – SheetBills Email Notification System
Feature: Manual Email Send (triggered by user)

🔹 Objective
Enable users to manually send invoice emails via the “Send via Email” button using Make + Mailgun, with data managed through Google Sheets.

🛠️ Tools Involved
Tool	Purpose
Google Sheets	Stores invoice data
Make	Handles automation via Webhooks
Mailgun	Sends the actual email

⚙️ Cursor AI Implementation Steps
🔍 Step 1: Analyze Existing App Logic: 
    a.Review how the invoice data is generated when the "Send via Email" button is clicked.
    b.Understand how the backend interacts with Google Sheets.
    c.Confirm that the logic supports multi-user use without hardcoded IDs or emails.
    Note: This is for you to understand how the app works for better implementation



🧾 Step 2: Update Google Sheet Headers
Open the active invoice Google Sheet.

Add the following columns to Row 1, if they don’t already exist:

send_status

date_sent

reminders_sent

These new columns should be placed at the end of the current headers.

📨 Step 3: Implement Webhook Trigger (Dynamic Sending)
🔗 Use Make Webhooks instead of polling to make email sending dynamic and responsive to each user action.

In Make, create a new Webhook trigger scenario.

Generate a custom Webhook URL from Make.

In the backend, when a user clicks "Send via Email", call this webhook and pass:

invoice_id

client_name

email

amount

due_date

(any other necessary fields)

The webhook will forward the data to Make in real-time.

✉️ Step 4: Email Delivery via Mailgun
Use the webhook payload to populate the email.

In Make, send the email using Mailgun’s API.

After sending:

Write/update the corresponding row in the Google Sheet.

Update the following fields:

send_status → "yes"

date_sent → current date

🔄 Step 5: Support for Any User (Not Hardcoded)
Make sure:

Emails are sent based on data from the webhook, not predefined values.

No hardcoded user emails or invoice info is used.

Each user’s data should be passed dynamically in the webhook body.

🧼 Step 6: Summary Checklist
Task	Status
Added send_status, date_sent, reminders_sent columns in Sheet	✅
Backend sends webhook to Make with invoice data	✅
Make scenario triggered by webhook, not polling	✅
Emails sent via Mailgun dynamically using webhook data	✅
No hardcoded users or email values	✅
Google Sheet updated after email sent	✅
Frontend/backend not structurally changed	✅
All changes are trackable and reversible	✅

