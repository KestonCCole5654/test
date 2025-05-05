import { google } from 'googleapis'
import { Request, Response } from 'express'

export async function getOverdueInvoices(req: Request, res: Response) {
  try {
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
    const today = new Date()

    // Process and filter overdue invoices
    const overdueInvoices = rows
      .map((row: any[]) => {
        const dueDate = new Date(row[2]) // Assuming due date is in column C
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        // Only include unpaid invoices that are overdue
        if (row[4] === 'Pending' && daysOverdue > 0) {
          return {
            id: row[0],
            date: row[1],
            dueDate: row[2],
            amount: parseFloat(row[3]),
            status: row[4],
            customer: {
              name: row[5],
              email: row[6],
              address: row[7],
            },
            items: JSON.parse(row[8] || '[]'),
            notes: row[9],
            daysOverdue,
          }
        }
        return null
      })
      .filter(Boolean)

    res.status(200).json(overdueInvoices)
  } catch (error) {
    console.error('Error fetching overdue invoices:', error)
    res.status(500).json({ error: 'Failed to fetch overdue invoices' })
  }
} 