
# ✅ Action Plan for Cursor – SheetBills Notification Integration

> 🎯 **Goal:** Add automated reminders & notifications using Google Sheets + Make + Twilio **without changing** the existing app structure (only extend it where absolutely necessary).

---

## 🔍 Step 1: Analyze Existing System
- [ ] Review the current project files and architecture
- [ ] Identify how invoice data is being sent to Google Sheets
- [ ] Confirm that invoice creation and CRUD operations are working as described

---

## 📄 Step 2: Update Google Sheets Structure (if needed)
- [ ] Add new columns to existing Google Sheet to track:
  - `sent_status` (Yes/No)
  - `channel_sent` (Email, SMS, WhatsApp)
  - `date_sent`
  - `reminders_sent` (counter)
- [ ] Make sure these columns don’t break current app logic (keep optional/default values)

---

## ⚙️ Step 3: Create Make (Integromat) Scenarios
- [ ] Scenario 1 – **Send Invoice**
  - Trigger: New row or update in Google Sheets
  - Action: Send invoice via Twilio (Email/SMS/WhatsApp)
  - Update Google Sheet: Fill in `sent_status`, `channel_sent`, `date_sent`

- [ ] Scenario 2 – **Automated Reminders**
  - Trigger: Time-based (e.g., every day)
  - Logic:
    - Read all unpaid invoices from Google Sheets
    - Compare due date with current date
    - If unpaid:
      - Send up to 3 reminders before due date
      - Send up to 4 reminders after due date
  - Action: Send reminder via Twilio
  - Update: Increment `reminders_sent`

---



## 📡 Step 4: Twilio Integration
- [ ] Ensure Twilio is connected to Make
- [ ] Use Twilio modules for:
  - Email (via SendGrid if needed)
  - SMS
  - WhatsApp
- [ ] Format message templates clearly using data from Google Sheets (client name, amount, due date)

---

## 🧪 Step 5: Testing & Verification
- [ ] Test sending an invoice via all 3 channels
- [ ] Test reminder logic before and after due date
- [ ] Confirm that all updates (status, counts) appear correctly in Google Sheets
- [ ] Check that current app functionality remains **unchanged and working**

---

## 🧼 Step 6: Clean Integration Practices
- [ ] Do **not modify frontend or backend structure**
- [ ] Only add what’s necessary (e.g., Google Sheet columns)
- [ ] Keep notification logic separate (handled by Make)
- [ ] Comment or document any change in Make for future reference

---

## 🧾 Optional (Nice to Have)
- [ ] Create a separate tab in the Google Sheet for logging messages sent
- [ ] Add logs: timestamp, client, invoice ID, channel, message content
