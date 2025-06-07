import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Mail, X, FileText } from 'lucide-react'

interface EmailInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (emailData: EmailData) => void
  customerEmail: string
  businessEmail: string
  invoiceNumber: string
  customerName: string
}

interface EmailData {
  to: string
  from: string
  subject: string
  message: string
}

export function EmailInvoiceModal({
  isOpen,
  onClose,
  onSend,
  customerEmail,
  businessEmail,
  invoiceNumber,
  customerName,
}: EmailInvoiceModalProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: customerEmail,
    from: businessEmail,
    subject: `Invoice #${invoiceNumber} from SheetBills`,
    message: `Hi ${customerName},\n\nPlease see the attached invoice #${invoiceNumber} for the recent work completed.\n\nLet me know if you have any questions. Thank you.`,
  })

  const handleSend = () => {
    onSend(emailData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={emailData.to}
              onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={emailData.from}
              onChange={(e) => setEmailData({ ...emailData, from: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              className="min-h-[150px]"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border p-3">
            <FileText className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Invoice_{invoiceNumber}.pdf</p>
              <p className="text-xs text-gray-500">PDF Document</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            Send Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 