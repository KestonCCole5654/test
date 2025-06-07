import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Mail, FileText, Printer } from 'lucide-react'

interface EmailInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (emailData: EmailData) => void
  customerEmail: string
  businessEmail: string
  invoiceNumber: string
  customerName: string
  amount?: number
  dueDate?: string
  invoiceDate?: string
  companyName?: string
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
  amount = 0,
  dueDate = '',
  invoiceDate = '',
  companyName = '',
}: EmailInvoiceModalProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: customerEmail,
    from: businessEmail,
    subject: `Invoice #${invoiceNumber} from ${companyName || 'SheetBills'}`,
    message: `Dear ${customerName},\n\nWe appreciate your business. Please find your invoice details here. Feel free to contact us if you have any questions.\n\nInvoice Date: ${invoiceDate}\nSubtotal: $${amount}\nDue date: ${dueDate}`,
  })
 

  const handleSend = () => {
    onSend(emailData)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-full max-w-[100vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send email
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Left: Email Form */}
          <div className="flex-1 min-w-0">
            <div className="grid gap-4">
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
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  placeholder="recipient@example.com"
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
                <Label htmlFor="message">Body</Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
           
            </div>
            <div className="flex justify-start mt-8">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>

          </div>
          {/* Right: Invoice Preview */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border rounded-lg shadow p-6 w-full max-w-lg mx-auto">
              <div className="text-xs text-gray-500 mb-2">
                From: {emailData.from}<br />
                To: {emailData.to}
              </div>
              <div className="font-normal text-lg mb-1">{emailData.subject}</div>
              <div className="text-green-800 font-medium text-xl mb-2">{companyName}</div>
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center mb-4">
                <div className="text-xs text-gray-500 mb-1">DUE {dueDate || '—'}</div>
                <div className="text-3xl font-medium text-gray-800 mb-2">${amount?.toFixed(2)}</div>
                <Button variant="default" className="bg-gray-800 text-white px-6 py-2 mb-1" size="sm">
                  Print or save
                </Button>
                <div className="text-xs text-gray-400 mt-1">Powered by <span className="font-normal font-green-800">SheetBills</span></div>
              </div>
              <div className="text-sm whitespace-pre-line mb-2">{emailData.message}</div>
              
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button onClick={handleSend} className="bg-green-700 text-white">
                Send and close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 