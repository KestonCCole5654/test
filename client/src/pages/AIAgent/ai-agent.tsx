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
import { Bot, Send, Clock, AlertCircle, CheckCircle, ChevronRight, RefreshCw } from "lucide-react"
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
  status: "Paid" | "Pending"
  daysOverdue: number
  aiSuggestions: {
    action: "reminder" | "extend" | "escalate"
    message: string
    priority: "high" | "medium" | "low"
  }
}

export default function AIAgent() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [reminderMessage, setReminderMessage] = useState("")
  const [isSendingReminder, setIsSendingReminder] = useState(false)

  useEffect(() => {
    fetchOverdueInvoices()
  }, [])

  const fetchOverdueInvoices = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/invoices/overdue", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch overdue invoices")
      }

      const data = await response.json()
      
      // Process and enhance the data with AI suggestions
      const enhancedInvoices = data.map((invoice: any) => ({
        ...invoice,
        daysOverdue: calculateDaysOverdue(invoice.dueDate),
        aiSuggestions: generateAISuggestions(invoice)
      }))

      setInvoices(enhancedInvoices)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overdue invoices",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const generateAISuggestions = (invoice: any) => {
    const daysOverdue = calculateDaysOverdue(invoice.dueDate)
    const amount = invoice.amount

    // Simple AI logic for suggestions
    let action: "reminder" | "extend" | "escalate"
    let priority: "high" | "medium" | "low"
    let message = ""

    if (daysOverdue > 30) {
      action = "escalate"
      priority = "high"
      message = `Urgent: Invoice #${invoice.id} is ${daysOverdue} days overdue. Consider escalating to collections.`
    } else if (daysOverdue > 15) {
      action = "extend"
      priority = "medium"
      message = `Invoice #${invoice.id} is ${daysOverdue} days overdue. Consider offering a payment extension.`
    } else {
      action = "reminder"
      priority = "low"
      message = `Send a friendly reminder for invoice #${invoice.id} which is ${daysOverdue} days overdue.`
    }

    return { action, message, priority }
  }

  const handleSendReminder = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "No Invoices Selected",
        description: "Please select at least one invoice to send a reminder.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingReminder(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      // Send reminder emails
      const response = await fetch("https://sheetbills-server.vercel.app/api/invoices/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
        body: JSON.stringify({
          invoiceIds: selectedInvoices,
          message: reminderMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reminders")
      }

      toast({
        title: "Reminders Sent",
        description: `Successfully sent reminders for ${selectedInvoices.length} invoice(s).`,
      })

      // Clear selection and message
      setSelectedInvoices([])
      setReminderMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive",
      })
    } finally {
      setIsSendingReminder(false)
    }
  }

  const handleExtendDueDate = async (invoiceId: string, days: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/invoices/extend-due-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
        body: JSON.stringify({
          invoiceId,
          days,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extend due date")
      }

      toast({
        title: "Due Date Extended",
        description: "Successfully extended the due date.",
      })

      // Refresh the invoice list
      fetchOverdueInvoices()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend due date",
        variant: "destructive",
      })
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (selectedAction === "all") return true
    return invoice.aiSuggestions.action === selectedAction
  })

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
              <h1 className="text-3xl font-bold text-white">AI Invoice Assistant</h1>
              <p className="text-purple-100 mt-1">
                Smart suggestions and automated actions for your overdue invoices
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-slate-500 mt-1">Invoices requiring attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">In overdue payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Average Days Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(invoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / invoices.length || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="reminder">Send Reminder</SelectItem>
              <SelectItem value="extend">Extend Due Date</SelectItem>
              <SelectItem value="escalate">Escalate</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={fetchOverdueInvoices}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
                disabled={selectedInvoices.length === 0}
              >
                <Send className="h-4 w-4" />
                Send Bulk Reminders
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Reminder Messages</DialogTitle>
                <DialogDescription>
                  Send reminder messages to {selectedInvoices.length} selected customers.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Enter your reminder message..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSendReminder}
                  disabled={isSendingReminder || !reminderMessage.trim()}
                >
                  {isSendingReminder ? "Sending..." : "Send Reminders"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(filteredInvoices.map(inv => inv.id))
                        } else {
                          setSelectedInvoices([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>AI Suggestion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No overdue invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id])
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                            }
                          }}
                        />
                      </TableCell>
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
                        <Badge
                          variant={invoice.daysOverdue > 30 ? "destructive" : "default"}
                          className="whitespace-nowrap"
                        >
                          {invoice.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {invoice.aiSuggestions.action === "reminder" && (
                            <Send className="h-4 w-4 text-blue-500" />
                          )}
                          {invoice.aiSuggestions.action === "extend" && (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          {invoice.aiSuggestions.action === "escalate" && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{invoice.aiSuggestions.message}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/create-invoice?invoiceId=${invoice.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          {invoice.aiSuggestions.action === "extend" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtendDueDate(invoice.id, 15)}
                            >
                              Extend 15 Days
                            </Button>
                          )}
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