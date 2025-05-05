"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { toast } from "../../components/ui/use-toast"
import supabase from "../../components/Auth/supabaseClient"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Bot, Send, Mail, Clock, AlertCircle, CheckCircle, ChevronRight, RefreshCw, Settings } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"

interface Invoice {
  id: string
  date: string
  dueDate: string
  amount: number
  customer: {
    name: string
    email: string
    address: string
  }
  items: {
    description: string
    quantity: number
    price: number
  }[]
  status: "Paid" | "Pending"
  emailStatus: "Not Sent" | "Sent" | "Reminder Sent"
  lastEmailSent?: string
}

export default function AIAgent() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [previewEmail, setPreviewEmail] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [autoSendEnabled, setAutoSendEnabled] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    reminderDays: 7,
    followUpDays: 3,
    autoSend: false,
    customSignature: "",
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/sheets/invoices", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateEmailContent = (invoice: Invoice) => {
    const items = invoice.items.map(item => 
      `- ${item.description}: ${item.quantity} x $${item.price.toFixed(2)}`
    ).join('\n')

    const emailContent = `Dear ${invoice.customer.name},

I hope this email finds you well. I am writing to share the invoice for our recent services.

Invoice Details:
Invoice #: ${invoice.id}
Date: ${invoice.date}
Due Date: ${invoice.dueDate}

Services Provided:
${items}

Total Amount: $${invoice.amount.toFixed(2)}

Please find the invoice attached to this email. Payment is due by ${invoice.dueDate}.

${emailSettings.customSignature || "Best regards,\nYour Company Name"}`

    return emailContent
  }

  const handlePreviewEmail = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    const emailContent = generateEmailContent(invoice)
    setPreviewEmail(emailContent)
  }

  const handleSendEmail = async () => {
    if (!selectedInvoice) return

    try {
      setIsSendingEmail(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/send-invoice-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          emailContent: previewEmail,
          customerEmail: selectedInvoice.customer.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      // Update local state
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, emailStatus: "Sent", lastEmailSent: new Date().toISOString() }
          : inv
      ))

      toast({
        title: "Email Sent",
        description: "Invoice email has been sent successfully.",
      })

      setSelectedInvoice(null)
      setPreviewEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/save-email-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
        body: JSON.stringify(emailSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings Saved",
        description: "Email settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* AI Agent Header */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-purple-600 to-purple-700 py-10 shadow-lg rounded-b-3xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
              <Bot className="h-8 w-8 text-purple-600" />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Email Composer</h1>
              <p className="text-purple-100 mt-1">
                Automatically draft and send professional invoice emails
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Settings Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-send">Auto-send emails</Label>
                <Switch
                  id="auto-send"
                  checked={emailSettings.autoSend}
                  onCheckedChange={(checked) => 
                    setEmailSettings({ ...emailSettings, autoSend: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder-days">Reminder days before due date</Label>
                  <input
                    id="reminder-days"
                    type="number"
                    value={emailSettings.reminderDays}
                    onChange={(e) => 
                      setEmailSettings({ ...emailSettings, reminderDays: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="followup-days">Follow-up days after due date</Label>
                  <input
                    id="followup-days"
                    type="number"
                    value={emailSettings.followUpDays}
                    onChange={(e) => 
                      setEmailSettings({ ...emailSettings, followUpDays: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="signature">Email Signature</Label>
                <Textarea
                  id="signature"
                  value={emailSettings.customSignature}
                  onChange={(e) => 
                    setEmailSettings({ ...emailSettings, customSignature: e.target.value })
                  }
                  placeholder="Enter your email signature..."
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">#{invoice.id}</div>
                        <div className="text-sm text-slate-500">{invoice.date}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.customer.name}</div>
                        <div className="text-sm text-slate-500">{invoice.customer.email}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.dueDate}</div>
                        {invoice.lastEmailSent && (
                          <div className="text-sm text-slate-500">
                            Last sent: {new Date(invoice.lastEmailSent).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.emailStatus === "Sent" ? "default" :
                            invoice.emailStatus === "Reminder Sent" ? "secondary" :
                            "outline"
                          }
                        >
                          {invoice.emailStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewEmail(invoice)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Preview Email</DialogTitle>
                                <DialogDescription>
                                  Review the email before sending to {invoice.customer.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  value={previewEmail}
                                  onChange={(e) => setPreviewEmail(e.target.value)}
                                  className="min-h-[300px] font-mono"
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handleSendEmail}
                                  disabled={isSendingEmail}
                                >
                                  {isSendingEmail ? "Sending..." : "Send Email"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/create-invoice?invoiceId=${invoice.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 