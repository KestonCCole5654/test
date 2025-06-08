# 🧾 Project: SheetBills – Invoice Notification System

## 📌 Purpose
To integrate an automated reminder and notification system into the current SheetBills software using Google Sheets, Make (Integromat), and Twilio — **without changing the current project structure**.

---

## 🛠️ Cursor Instructions

✅ **The current software already supports:**
- Invoice creation
- Sending invoice data to Google Sheets
- Performing basic CRUD operations on invoice records

🧠 **Your role** is to:
- Observe the current project architecture and codebase
- Add the SheetBills notification system as a layer on top
- Do not modify or restructure existing logic or components only if absolutley necessary, like adding new coloumns etc in the google sheet for tracking purposes etc 

---

## 🔧 Tools & Responsibilities

### 1. Google Sheets
- **Already in use** as the invoice database
- Stores invoice data: client name, amount, due date, payment status, etc.
- Creates Invoice based on data in google sheets 

### 2. Make (Integromat)
- Acts as the automation engine
- Reads invoice data from Google Sheets
- Triggers workflows to send notifications via Twilio
- Handles scheduling for reminders

### 3. Twilio
- Used to send messages through 3 channels:
  - 📧 **Email**
  - 📱 **SMS**
  - 💬 **WhatsApp**

---

## 📈 Example Workflows

### 🔹 Send Invoice to Client
- A new invoice is created in the app
- Data is pushed to Google Sheets (already functioning)
- Make is triggered based on new row or update
- Make reads the row and sends invoice via Twilio (Email, SMS, or WhatsApp)

### 🔹 Reminder System (Pre- and Post-Due Date)
**Example Scenario:** Invoice created on **May 1, 2025**, due on **May 10, 2025**
- Make checks the due date and status using scheduling tools
- If still unpaid:
  - Sends up to **3 reminders before** May 10
  - Sends up to **4 follow-ups after** May 10

All reminders are fully automated through Make, using data from Google Sheets and communication via Twilio.

---

## ✅ Summary

- The current invoice system **already handles creation and data sync** to Google Sheets.
- This feature is an **add-on layer** for notifications.
- Cursor should:
  - Use Make for automation logic
  - Use Twilio for message delivery
  - **Avoid changing any core logic or frontend/backend structure, only if necessary**