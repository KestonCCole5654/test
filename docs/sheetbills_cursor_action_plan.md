Revised Action Plan for Cursor – SheetBills Notification Integration
🎯 Goal: Add automated reminders & notifications using Google Sheets + Make + Twilio without changing the existing app structure (only extend it where absolutely necessary).

🛠️ 🔧 Critical Fixes Required from Cursor
1. 🔁 Correct Webhook Trigger Point
Issue: The Make webhook is currently triggered when an invoice is saved, which is incorrect.

Correct Behavior:

✅ The webhook should only be triggered when the “Send Invoice” button is clicked on the email-invoice page.

🎯 This ensures that notifications are only sent when explicitly requested.

Cursor Tasks:

 Move webhook trigger to the event handler of the “Send Invoice” button on the email-invoice page.

 Ensure this call sends all necessary invoice + customer data to Make.

 Add clear comments explaining this logic.

2. 📱 Include Customer Phone Number in Invoice Data
Issue: While customer name, email, and address are already being captured, phone number is missing from the current data flow.

Cursor Tasks:

 Update the relevant forms and invoice creation logic to collect and save customer phone number.

 Ensure phone number is:

Validated properly (basic phone format)

Saved to the backend/store (if applicable)

Included in the payload sent to Google Sheets and Make

🔔 This is necessary for Twilio SMS and WhatsApp messaging.

🔍 Step 1: Analyze Existing System
 Review current architecture and logic

 Verify existing invoice CRUD functionality

 Review Google Sheet syncing logic

📄 Step 2: Google Sheets Structure
 Added:

sent_status

channel_sent

date_sent

reminders_sent

 Add customer_phone column if not already included

 Ensure backward compatibility with app logic

⚙️ Step 3: Make (Integromat) Scenarios
 Send Invoice Scenario

Trigger: Webhook (✅ to be fixed)

Action: Send message via Twilio (Email/SMS/WhatsApp)

Update Google Sheet status fields

 Reminder Scenario

Trigger: Time-based (e.g., daily)

Logic:

Identify unpaid invoices by due date

Max 3 reminders before, 4 after due date

Action: Send reminder message via Twilio

Update reminders_sent counter

📡 Step 4: Twilio Integration
 Ensure all Twilio channels (Email, SMS, WhatsApp) are ready

 Use Google Sheet data, now including phone number, to personalize messages

🧪 Step 5: Testing & Verification
 Verify “Send Invoice” button triggers webhook correctly

 Ensure invoice is sent over all channels using phone/email

 Test reminders pre- and post-due date

 Confirm all updates appear in Google Sheets

 Ensure app functionality remains unchanged

🧼 Step 6: Clean Integration Practices
 No core app logic changes unless absolutely needed

 Notification logic remains external (Make)

 Document changes clearly (especially webhook logic and phone number update)

🧾 Optional
 Logging tab in Google Sheets with:

Timestamp, client, invoice ID, channel, message content

