import { Router } from 'express'
import { getOverdueInvoices } from '../api/sheets/overdue-invoices'
import { sendReminders } from '../api/send-reminders'
import { extendDueDate } from '../api/extend-due-date'

const router = Router()

// Get overdue invoices
router.get('/overdue', getOverdueInvoices)

// Send reminder emails
router.post('/reminders', sendReminders)

// Extend due date
router.post('/extend-due-date', extendDueDate)

export default router 