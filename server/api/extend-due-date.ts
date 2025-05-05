import { google } from 'googleapis'
import { Request, Response } from 'express'

export async function extendDueDate(req: Request, res: Response) {
  try {
    const { invoiceId, days } = req.body

    if (!invoiceId || !days) {
      return res.status(400).json({ error: 'Invoice ID and days are required' })
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
    const invoiceIndex = rows.findIndex((row: any[]) => row[0] === invoiceId)

    if (invoiceIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    // Calculate new due date
    const currentDueDate = new Date(rows[invoiceIndex][2])
    const newDueDate = new Date(currentDueDate)
    newDueDate.setDate(newDueDate.getDate() + days)

    // Update the due date in the spreadsheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Invoices!C${invoiceIndex + 2}`, // Column C is the due date
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newDueDate.toISOString().split('T')[0]]],
      },
    })

    res.status(200).json({
      success: true,
      message: 'Due date extended successfully',
      newDueDate: newDueDate.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Error extending due date:', error)
    res.status(500).json({ error: 'Failed to extend due date' })
  }
} 