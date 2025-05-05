import { google } from 'googleapis'
import { Request, Response } from 'express'
import nodemailer from 'nodemailer'

export async function sendReminders(req: Request, res: Response) {
  try {
    const { invoiceIds, message } = req.body

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ error: 'No invoice IDs provided' })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.SHEET_ID

    // Get all invoices
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Invoices!A2:Z',
    })

    const rows = response.data.values || []
    const selectedInvoices = rows.filter((row: any[]) => invoiceIds.includes(row[0]))

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send reminder emails
    const emailPromises = selectedInvoices.map(async (invoice: any[]) => {
      const customerEmail = invoice[6] // Assuming email is in column G
      const invoiceId = invoice[0]
      const amount = parseFloat(invoice[3])
      const dueDate = new Date(invoice[2])

      const emailContent = `
        Dear ${invoice[5]}, // Customer name

        ${message}

        Invoice Details:
        - Invoice #: ${invoiceId}
        - Amount Due: $${amount.toLocaleString()}
        - Due Date: ${dueDate.toLocaleDateString()}

        Please process the payment at your earliest convenience.

        Best regards,
        Your Company Name
      `

      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: customerEmail,
        subject: `Reminder: Overdue Invoice #${invoiceId}`,
        text: emailContent,
      })
    })

    await Promise.all(emailPromises)

    res.status(200).json({ success: true, message: 'Reminders sent successfully' })
  } catch (error) {
    console.error('Error sending reminders:', error)
    res.status(500).json({ error: 'Failed to send reminders' })
  }
} 