# Email Automation Feature Documentation

## Overview
The email automation feature in SheetBills provides automatic invoice reminders and payment tracking through Google Sheets and Integromat integration. This document outlines the specifications and implementation details.

## Data Structure

### Google Sheets Schema
Add the following columns to your invoice sheet:

| Column Name | Type | Description |
|-------------|------|-------------|
| reminder_status | String | Status of reminder (Pending, Sent, Failed) |
| last_reminder_date | Date | Date of last reminder sent |
| reminder_count | Number | Number of reminders sent |
| next_reminder_date | Date | Scheduled date for next reminder |
| email_preferences | String | Customer's email preferences (JSON) |

### Email Preferences Structure
```json
{
  "reminder_enabled": true,
  "reminder_frequency": "standard",
  "custom_message": "",
  "cc_recipients": [],
  "opt_out": false
}
```

## Automation Rules

### Reminder Schedule
1. **First Reminder**
   - Trigger: 7 days before due date
   - Condition: Invoice unpaid
   - Template: Initial reminder

2. **Second Reminder**
   - Trigger: 3 days before due date
   - Condition: Invoice unpaid, first reminder sent
   - Template: Urgent reminder

3. **Final Reminder**
   - Trigger: On due date
   - Condition: Invoice unpaid, second reminder sent
   - Template: Final notice

4. **Follow-up Reminder**
   - Trigger: 3 days after due date
   - Condition: Invoice unpaid, final reminder sent
   - Template: Overdue notice

### Email Templates

#### Initial Reminder
```
Subject: Invoice #[INVOICE_NUMBER] - Payment Reminder

Dear [CUSTOMER_NAME],

This is a friendly reminder that your invoice #[INVOICE_NUMBER] for [AMOUNT] is due in 7 days.

Invoice Details:
- Invoice Number: [INVOICE_NUMBER]
- Due Date: [DUE_DATE]
- Amount: [AMOUNT]
- Payment Link: [PAYMENT_LINK]

Please process the payment before the due date to avoid any late fees.

Best regards,
[YOUR_COMPANY_NAME]
```

#### Urgent Reminder
```
Subject: URGENT: Invoice #[INVOICE_NUMBER] - Payment Due in 3 Days

Dear [CUSTOMER_NAME],

This is an urgent reminder that your invoice #[INVOICE_NUMBER] for [AMOUNT] is due in 3 days.

Invoice Details:
- Invoice Number: [INVOICE_NUMBER]
- Due Date: [DUE_DATE]
- Amount: [AMOUNT]
- Payment Link: [PAYMENT_LINK]

Please process the payment immediately to avoid any late fees or service interruptions.

Best regards,
[YOUR_COMPANY_NAME]
```

#### Final Reminder
```
Subject: FINAL NOTICE: Invoice #[INVOICE_NUMBER] - Payment Due Today

Dear [CUSTOMER_NAME],

This is a final reminder that your invoice #[INVOICE_NUMBER] for [AMOUNT] is due today.

Invoice Details:
- Invoice Number: [INVOICE_NUMBER]
- Due Date: [DUE_DATE]
- Amount: [AMOUNT]
- Payment Link: [PAYMENT_LINK]

Please process the payment today to avoid any late fees or service interruptions.

Best regards,
[YOUR_COMPANY_NAME]
```

#### Overdue Notice
```
Subject: OVERDUE: Invoice #[INVOICE_NUMBER] - Immediate Payment Required

Dear [CUSTOMER_NAME],

This is to inform you that your invoice #[INVOICE_NUMBER] for [AMOUNT] is now overdue.

Invoice Details:
- Invoice Number: [INVOICE_NUMBER]
- Due Date: [DUE_DATE]
- Amount: [AMOUNT]
- Payment Link: [PAYMENT_LINK]

Please process the payment immediately to avoid any additional late fees or service interruptions.

Best regards,
[YOUR_COMPANY_NAME]
```

## Integration Points

### Frontend Components
1. **Email Settings**
   - Template customization
   - Reminder schedule settings
   - Default messages
   - Email signature

2. **Invoice View**
   - Reminder history
   - Manual reminder trigger
   - Email status indicators
   - Communication preferences

3. **Customer Management**
   - Email preferences
   - Communication history
   - Opt-out management

### Integromat Scenarios

#### Daily Invoice Check
1. **Trigger**: Schedule (Daily at 9:00 AM)
2. **Actions**:
   - Fetch invoices from Google Sheets
   - Filter unpaid invoices
   - Check reminder conditions
   - Send appropriate reminders
   - Update sheet with status

#### Payment Status Change
1. **Trigger**: Google Sheets webhook
2. **Actions**:
   - Check payment status
   - Update reminder status
   - Send payment confirmation
   - Update communication history

## Security & Compliance

### Data Protection
- Encrypt sensitive information
- Secure email templates
- Protect customer data
- Maintain audit logs

### GDPR Compliance
- Customer consent management
- Right to be forgotten
- Data portability
- Privacy policy updates

### Email Best Practices
- SPF/DKIM configuration
- Email authentication
- Spam prevention
- Bounce handling

## Monitoring & Maintenance

### Tracking Metrics
- Email delivery rates
- Open rates
- Click-through rates
- Payment response rates
- Reminder effectiveness

### Maintenance Tasks
- Regular template updates
- Schedule optimization
- Performance monitoring
- Error handling
- Backup procedures

## Future Enhancements

### Planned Features
1. **Advanced Templates**
   - Multiple language support
   - Custom branding
   - Dynamic content
   - A/B testing

2. **Enhanced Tracking**
   - Payment link analytics
   - Customer engagement metrics
   - Response tracking
   - ROI analysis

3. **Integration Expansion**
   - SMS reminders
   - WhatsApp integration
   - CRM integration
   - Accounting software sync

4. **Analytics Dashboard**
   - Communication effectiveness
   - Payment patterns
   - Customer behavior
   - Revenue impact

## Implementation Timeline

### Phase 1: Basic Setup
- Google Sheets integration
- Basic email templates
- Simple reminder schedule
- Frontend components

### Phase 2: Enhanced Features
- Custom templates
- Advanced scheduling
- Analytics tracking
- Customer preferences

### Phase 3: Advanced Integration
- Multi-channel communication
- Advanced analytics
- Custom workflows
- API integrations

## Support & Maintenance

### Regular Tasks
- Monitor email delivery
- Update templates
- Optimize schedules
- Handle exceptions
- Backup data

### Support Procedures
- Error reporting
- Issue tracking
- Customer support
- Documentation updates
- Training materials 