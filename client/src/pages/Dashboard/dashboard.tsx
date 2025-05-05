"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Trash2, Edit, MoreVertical, Plus, RefreshCw, ArrowUpDown, CheckCircle, Clock, Mail, Settings, DollarSign } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useNavigate, useLocation } from "react-router-dom"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { toast } from "../../components/ui/use-toast"
import supabase from "../../components/Auth/supabaseClient"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { ChevronRight } from "lucide-react"

interface PartialPayment {
  amount: number;
  date: string;
  notes?: string;
}

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
  tax: {
    type: "fixed" | "percentage"
    value: number
  }
  discount: {
    type: "fixed" | "percentage"
    value: number
  }
  notes: string
  template: "modern" | "classic" | "minimal"
  status: "Paid" | "Pending"
  emailStatus?: string
  lastEmailSent?: string
  partialPayments?: PartialPayment[]
  remainingAmount?: number
}

interface Spreadsheet {
  id: string
  name: string
  sheetUrl: string
  isDefault: boolean
}

interface EmailSettings {
  reminderDays: number
  followUpDays: number
  autoSend: boolean
  customSignature: string
}

interface ChatMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  action?: {
    type: 'preview' | 'send' | 'remind'
    invoiceId?: string
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Try to load cached data on initial render
    const cachedData = localStorage.getItem('cachedInvoices');
    return cachedData ? JSON.parse(cachedData) : [];
  })
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isStateLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [selectedSpreadsheetUrl, setSelectedSpreadsheetUrl] = useState<string | null>(() =>
    localStorage.getItem("defaultSheetUrl"),
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(() => {
    const cachedTime = localStorage.getItem('lastFetchTime');
    return cachedTime ? parseInt(cachedTime) : 0;
  });
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    reminderDays: 7,
    followUpDays: 3,
    autoSend: false,
    customSignature: "",
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [previewEmail, setPreviewEmail] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isPartialPaymentDialogOpen, setIsPartialPaymentDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("");
  const [partialPaymentNotes, setPartialPaymentNotes] = useState("");

  // Calculate totals
  const totalInvoices = invoices.length
  const pendingAmount = invoices
    .filter((invoice) => invoice.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "Pending").length
  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid").length

  // Add effect to check for navigation state
  useEffect(() => {
    // Check if we're returning from invoice edit
    const state = location.state as { fromInvoiceEdit?: boolean } | null;
    if (state?.fromInvoiceEdit) {
      toast({
        title: "Changes Detected",
        description: "Please click the refresh button to see your updated invoice data.",
        duration: 5000,
      });
      // Clear the state to prevent showing the toast again
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (error) {
          navigate("/login", {
            state: {
              error: "Session verification failed",
              from: location.pathname,
            },
            replace: true,
          })
          return
        }

        if (!user) {
          navigate("/login", { state: { from: location.pathname }, replace: true })
          return
        }

        setUser(user)

        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session || (session.expires_at ?? 0) * 1000 < Date.now()) {
          await supabase.auth.signOut()
          navigate("/login", { state: { sessionExpired: true }, replace: true })
        }
      } catch (err) {
        if (!isMounted) return
        navigate("/login", {
          state: {
            error: "Connection error. Please try again.",
            from: location.pathname,
          },
          replace: true,
        })
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true

    const fetchData = async () => {
      try {
        if (!user) return

        setIsLoading(true)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error || !session) {
          throw new Error(error?.message || "Session validation failed")
        }

        const response = await fetch("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
          signal: abortController.signal,
          headers: { Authorization: `Bearer ${session.provider_token}` },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!isMounted) return

        const spreadsheets = data.spreadsheets || []
        setSpreadsheets(spreadsheets)

        const storedDefault = localStorage.getItem("defaultSheetUrl")
        const validDefault = spreadsheets.some((s: Spreadsheet) => s.sheetUrl === storedDefault)

        if (spreadsheets.length > 0) {
          const newDefault = spreadsheets.find((s: Spreadsheet) => s.isDefault) || spreadsheets[0]
          if (!validDefault) {
            localStorage.setItem("defaultSheetUrl", newDefault.sheetUrl)
            setSelectedSpreadsheetUrl(newDefault.sheetUrl)
          }
        }
      } catch (err) {
        if (!isMounted) return

        if (err instanceof Error && err.message.includes("401")) {
          navigate("/login", { state: { from: location.pathname }, replace: true })
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [user, navigate, location.pathname])

  // Filter and sort invoices
  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchLower) ||
        invoice.customer.name.toLowerCase().includes(searchLower) ||
        invoice.customer.email.toLowerCase().includes(searchLower)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dueDate = new Date(invoice.dueDate)

      let matchesStatus = true
      switch (statusFilter.toLowerCase()) {
        case "paid":
          matchesStatus = invoice.status === "Paid"
          break
        case "pending":
          matchesStatus = invoice.status === "Pending" && dueDate >= today
          break
        case "overdue":
          matchesStatus = invoice.status === "Pending" && dueDate < today
          break
      }

      return matchesSearch && matchesStatus
    })

    setFilteredInvoices(filtered)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [invoices, searchQuery, statusFilter])

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const fetchInvoices = async (sheetUrl: string) => {
    try {
      setIsLoading(true)

      // Check if we need to refresh the data (5 minutes cache)
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - lastFetchTime;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (timeSinceLastFetch < CACHE_DURATION && invoices.length > 0) {
        setIsLoading(false);
        return; // Use cached data
      }

      // Validate URL format first
      if (!isValidGoogleSheetUrl(sheetUrl)) {
        throw new Error("Invalid Google Sheets URL format")
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      // Handle session errors
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`)
      }

      if (!session) {
        navigate("/login", { state: { sessionExpired: true } })
        return
      }

      // Validate Google token presence
      const googleToken = session.provider_token
      const supabaseToken = session.access_token
      if (!googleToken) {
        await supabase.auth.signOut()
        navigate("/login", { state: { needsReauth: true } })
        return
      }

      const response = await fetch(
        `https://sheetbills-server.vercel.app/api/sheets/data?sheetUrl=${encodeURIComponent(sheetUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "X-Supabase-Token": supabaseToken,
          },
        },
      )

      // Handle specific error cases
      if (response.status === 401) {
        await supabase.auth.signOut()
        navigate("/login", { state: { sessionExpired: true } })
        return
      }

      if (response.status === 404) {
        throw new Error("Spreadsheet not found - Check URL and sharing permissions")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.statusText}`)
      }

      const data = await response.json()

      // Validate response structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response format - Expected array of invoices")
      }

      // Transform data with strict validation
      const transformedData = data
        .map((invoice: any) => {
          try {
            // Parse customer and items if they are strings
            let customer = invoice.customer
            if (typeof customer === "string") {
              try {
                customer = JSON.parse(customer)
              } catch {
                customer = { name: "", email: "", address: "" }
              }
            }
            let items = invoice.items
            if (typeof items === "string") {
              try {
                items = JSON.parse(items)
              } catch {
                items = []
              }
            }

            if (!invoice.id || typeof invoice.amount !== "number") {
              throw new Error("Missing required invoice fields")
            }

            return {
              id: invoice.id,
              date: invoice.date || new Date().toISOString().split("T")[0],
              dueDate: invoice.dueDate || "",
              status: ["Paid", "Pending"].includes(invoice.status) ? invoice.status : "Pending",
              amount: invoice.amount,
              customer,
              items,
              tax: validateFinancialField(invoice.tax),
              discount: validateFinancialField(invoice.discount),
              notes: invoice.notes || "",
              template: ["modern", "classic", "minimal"].includes(invoice.template) ? invoice.template : "modern",
            }
          } catch (itemError) {
            console.warn("Invalid invoice item:", invoice, itemError)
            return null
          }
        })
        .filter(Boolean)

      if (transformedData.length === 0) {
        throw new Error("No valid invoices found in spreadsheet")
      }

      // Cache the data
      localStorage.setItem('cachedInvoices', JSON.stringify(transformedData));
      localStorage.setItem('lastFetchTime', currentTime.toString());
      setLastFetchTime(currentTime);

      setInvoices(transformedData.filter((invoice): invoice is Invoice => invoice !== null))
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error.message)

      toast({
        title: "Data Loading Failed",
        description: error.message,
        variant: "destructive",
      })

      if (error.message.includes("Reauthenticate")) {
        navigate("/login", { state: { needsReauth: true } })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (selectedSpreadsheetUrl && user) {
        try {
          await fetchInvoices(selectedSpreadsheetUrl)
        } catch (error) {
          if (isMounted) {
            console.error("Fetch error:", error)
          }
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [selectedSpreadsheetUrl, user])

  const isValidGoogleSheetUrl = (url: string): boolean => {
    return /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url)
  }

  const validateFinancialField = (field: any) => {
    return {
      type: ["percentage", "fixed"].includes(field?.type) ? field.type : "fixed",
      value: Math.max(0, Number(field?.value) || 0),
    }
  }

  const handleSort = (key: keyof Invoice) => {
    const direction = sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending"

    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
      let valueA: string | number = ""
      let valueB: string | number = ""

      if (key === "date" || key === "dueDate") {
        valueA = new Date(a[key] || "").getTime()
        valueB = new Date(b[key] || "").getTime()
      } else if (key === "amount") {
        valueA = a.amount
        valueB = b.amount
      } else if (key === "customer") {
        valueA = typeof a.customer === "object" ? a.customer.name : String(a.customer || "")
        valueB = typeof b.customer === "object" ? b.customer.name : String(b.customer || "")
      } else if (key === "status") {
        valueA = a.status
        valueB = b.status
      } else if (key === "id") {
        valueA = a.id
        valueB = b.id
      } else {
        valueA = String(a[key] || "")
        valueB = String(b[key] || "")
      }

      if (valueA < valueB) return direction === "ascending" ? -1 : 1
      if (valueA > valueB) return direction === "ascending" ? 1 : -1
      return 0
    })

    setSortConfig({ key, direction })
    setFilteredInvoices(sortedInvoices)
  }

  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function handleRefresh(event?: React.MouseEvent<HTMLButtonElement>): void {
    if (selectedSpreadsheetUrl && user) {
      // Clear cache before fetching
      localStorage.removeItem('cachedInvoices');
      localStorage.removeItem('lastFetchTime');
      setLastFetchTime(0);
      fetchInvoices(selectedSpreadsheetUrl)
      toast({
        title: "Data Refreshed",
        description: "The invoice data has been refreshed successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Unable to refresh data. Please ensure a spreadsheet is selected.",
        variant: "destructive",
      })
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

  const handleSaveEmailSettings = async () => {
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Process the message and generate AI response
    try {
      let response: ChatMessage
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes('send') && lowerMessage.includes('invoice')) {
        // Extract invoice ID if mentioned
        const invoiceId = message.match(/invoice\s+#?(\w+)/i)?.[1]
        const invoice = invoices.find(inv => inv.id === invoiceId)

        if (invoice) {
          const emailContent = generateEmailContent(invoice)
          response = {
            id: Date.now().toString(),
            type: 'ai',
            content: `I've prepared an email for Invoice #${invoice.id}. Would you like to preview it before sending?`,
            timestamp: new Date(),
            action: {
              type: 'preview',
              invoiceId: invoice.id
            }
          }
        } else {
          response = {
            id: Date.now().toString(),
            type: 'ai',
            content: "I couldn't find that invoice. Could you please provide the correct invoice number?",
            timestamp: new Date()
          }
        }
      } else if (lowerMessage.includes('remind') || lowerMessage.includes('follow up')) {
        const pendingInvoices = invoices.filter(inv => inv.status === "Pending")
        response = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I found ${pendingInvoices.length} pending invoices. Would you like me to send reminders for any of them?`,
          timestamp: new Date(),
          action: {
            type: 'remind'
          }
        }
      } else if (lowerMessage.includes('settings') || lowerMessage.includes('configure')) {
        setShowEmailSettings(true)
        response = {
          id: Date.now().toString(),
          type: 'ai',
          content: "I've opened the settings panel. You can configure your email preferences there.",
          timestamp: new Date()
        }
      } else {
        response = {
          id: Date.now().toString(),
          type: 'ai',
          content: "I can help you with:\n• Sending invoice emails\n• Setting up reminders\n• Following up on overdue invoices\n• Configuring email settings\n\nWhat would you like to do?",
          timestamp: new Date()
        }
      }

      // Simulate typing delay
      setTimeout(() => {
        setChatMessages(prev => [...prev, response])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
      setIsTyping(false)
    }
  }

  // Add this helper function near the other utility functions
  const getOverdueStatus = (dueDate: string, status: string) => {
    if (status === "Paid") return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        days: diffDays,
        type: "overdue"
      };
    } else if (diffDays >= -7) {
      return {
        days: Math.abs(diffDays),
        type: "upcoming"
      };
    }
    return null;
  };

  const handlePartialPayment = async (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPartialPaymentAmount("");
    setPartialPaymentNotes("");
    setIsPartialPaymentDialogOpen(true);
  };

  const submitPartialPayment = async () => {
    if (!selectedInvoiceForPayment || !partialPaymentAmount) return;

    try {
      const paymentAmount = parseFloat(partialPaymentAmount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error("Please enter a valid payment amount");
      }

      const remainingAmount = selectedInvoiceForPayment.amount - paymentAmount;
      if (remainingAmount < 0) {
        throw new Error("Payment amount cannot exceed invoice amount");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const response = await fetch(
        "https://sheetbills-server.vercel.app/api/sheets/partial-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.provider_token}`,
            "X-Supabase-Token": session?.access_token || "",
          },
          body: JSON.stringify({
            invoiceId: selectedInvoiceForPayment.id,
            paymentAmount,
            paymentNotes: partialPaymentNotes,
            remainingAmount,
            sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record partial payment");
      }

      // Update local state
      const updatedInvoices = invoices.map((inv) =>
        inv.id === selectedInvoiceForPayment.id
          ? {
              ...inv,
              partialPayments: [
                ...(inv.partialPayments || []),
                {
                  amount: paymentAmount,
                  date: new Date().toISOString(),
                  notes: partialPaymentNotes,
                },
              ],
              remainingAmount,
              status: remainingAmount === 0 ? "Paid" as const : "Pending" as const,
            }
          : inv
      );
      setInvoices(updatedInvoices);

      toast({
        title: "Payment Recorded",
        description: `Partial payment of ${formatCurrency(paymentAmount)} has been recorded.`,
      });

      setIsPartialPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
      setPartialPaymentAmount("");
      setPartialPaymentNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full ">
      {/* Premium Welcome Header */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-600 to-emerald-700 py-10 shadow-lg rounded-b-3xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
            <div className="relative">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-white shadow-lg">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt="User Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                )}
              </Avatar>
              <span className="absolute bottom-0 right-0 bg-gradient-to-tr from-yellow-400 to-yellow-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md font-semibold border-2 border-white">
                PRO
              </span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg flex flex-wrap justify-center sm:justify-start items-center gap-2">
                Welcome back,
                <span className="bg-white/20 px-3 py-1 rounded-xl text-yellow-200 font-bold shadow">
                  {user?.email?.split("@")[0]}
                </span>
                <span className="ml-2 animate-bounce text-yellow-300 text-2xl">👋</span>
              </h2>
              <p className="text-slate-100 mt-2 text-base sm:text-lg font-medium">
                Manage and track your invoices with ease.
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <Button
              onClick={() => {
                const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                const invoicesSheetUrl = invoicesSheet?.sheetUrl
                navigate("/create-invoice", {
                  state: { selectedSpreadsheetUrl: invoicesSheetUrl },
                })
              }}
              className="bg-white text-slate-900 hover:bg-green-600 font-bold shadow-lg w-full sm:w-auto"
              disabled={isStateLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Invoices Card */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 py-1 sm:py-2">
              {isStateLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="text-xl sm:text-3xl font-bold text-slate-900">{totalInvoices}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Amount Card */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 py-1 sm:py-2">
              {isStateLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="text-xl sm:text-3xl font-bold text-slate-900">{formatCurrency(pendingAmount)}</div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">{pendingInvoices} pending</p>
            </CardContent>
          </Card>

          {/* Paid Amount Card */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 py-1 sm:py-2">
              {isStateLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="text-xl sm:text-3xl font-bold text-slate-900">{formatCurrency(paidAmount)}</div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">{paidInvoices} paid</p>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 py-1 sm:py-2">
              {isStateLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="text-xl sm:text-3xl font-bold text-slate-900">
                    {formatCurrency(paidAmount + pendingAmount)}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Floating Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen ? (
            <Card className="w-[400px] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-purple-600" />
                    </div>
                    AI Email Assistant
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-4 p-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                            <Mail className="h-6 w-6 text-purple-600" />
                          </div>
                          <p className="text-sm font-medium">AI Email Assistant</p>
                          <p className="text-xs text-slate-500">How can I help you with your invoices today?</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            message.type === 'user' ? 'justify-end' : ''
                          }`}
                        >
                          {message.type === 'ai' && (
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.action && (
                              <div className="mt-2 flex gap-2">
                                {message.action.type === 'preview' && message.action.invoiceId && (
                                  <Button
                                    size="sm"
                                    variant={message.type === 'user' ? 'secondary' : 'default'}
                                    onClick={() => {
                                      const invoice = invoices.find(inv => inv.id === message.action?.invoiceId)
                                      if (invoice) {
                                        handlePreviewEmail(invoice)
                                      }
                                    }}
                                  >
                                    Preview Email
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          {message.type === 'user' && (
                            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="bg-slate-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(inputMessage)
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleSendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isTyping}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setIsChatOpen(true)}
              className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
            >
              <Mail className="h-6 w-6 text-white" />
            </Button>
          )}
        </div>

        {/* Tabs and Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <TabsList className="mb-4 sm:mb-0">
              <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                All Invoices
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                Pending
              </TabsTrigger>
              <TabsTrigger value="paid" onClick={() => setStatusFilter("paid")}>
                Paid
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
                disabled={isStateLoading}
              />

              {selectedSpreadsheetUrl && (
                <Button
                  onClick={handleRefresh}
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={isStateLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isStateLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderInvoiceTable()}
          </TabsContent>
          <TabsContent value="pending" className="mt-0">
            {renderInvoiceTable()}
          </TabsContent>
          <TabsContent value="paid" className="mt-0">
            {renderInvoiceTable()}
          </TabsContent>
        </Tabs>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              {invoiceToDelete && <span className="font-medium"> #{invoiceToDelete.id}</span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!invoiceToDelete) return

                try {
                  const {
                    data: { session },
                    error: sessionError,
                  } = await supabase.auth.getSession()

                  if (sessionError) {
                    throw new Error(sessionError.message)
                  }

                  const response = await fetch("https://sheetbills-server.vercel.app/api/sheets/delete-invoice", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session?.provider_token}`,
                      "X-Supabase-Token": session?.access_token || "",
                    },
                    body: JSON.stringify({ invoiceId: invoiceToDelete.id }),
                  })

                  if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to delete invoice")
                  }

                  // Update local state by removing the deleted invoice
                  const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceToDelete.id)
                  setInvoices(updatedInvoices)
                  if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)

                  toast({
                    title: "Invoice Deleted",
                    description: "Invoice has been deleted successfully.",
                  })
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete invoice",
                    variant: "destructive",
                  })
                } finally {
                  setInvoiceToDelete(null)
                  setIsDeleteDialogOpen(false)
                }
              }}
              className="bg-red-600 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isPartialPaymentDialogOpen} onOpenChange={setIsPartialPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Partial Payment</DialogTitle>
            <DialogDescription>
              Enter the payment amount and any additional notes for invoice #{selectedInvoiceForPayment?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedInvoiceForPayment?.amount}
                  value={partialPaymentAmount}
                  onChange={(e) => setPartialPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Remaining amount: {formatCurrency(
                    selectedInvoiceForPayment
                      ? selectedInvoiceForPayment.amount - (parseFloat(partialPaymentAmount) || 0)
                      : 0
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="notes"
                  value={partialPaymentNotes}
                  onChange={(e) => setPartialPaymentNotes(e.target.value)}
                  placeholder="Add any payment notes (optional)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPartialPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPartialPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderInvoiceTable() {
    // Show only skeletons while loading
    if (isStateLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Empty State
    if (filteredInvoices.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices found</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              {searchQuery || statusFilter !== "all" ? (
                <>No invoices match your current filters. Try adjusting your search or filter criteria.</>
              ) : (
                <>Get started by creating your first invoice.</>
              )}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => {
                  const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                  const invoicesSheetUrl = invoicesSheet?.sheetUrl
                  navigate("/create-invoice", {
                    state: { selectedSpreadsheetUrl: invoicesSheetUrl },
                  })
                }}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    // Invoice Table
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer font-medium">
                  Invoice ID <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort("customer")} className="cursor-pointer font-medium">
                  Customer <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort("date")} className="cursor-pointer font-medium">
                  Date <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer font-medium">
                  Status <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                </TableHead>
                <TableHead className="font-medium">
                  Overdue Status
                </TableHead>
                <TableHead onClick={() => handleSort("amount")} className="cursor-pointer font-medium text-right">
                  Amount <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                </TableHead>
                <TableHead className="font-medium">Payment Action</TableHead>
                <TableHead className="w-[80px] font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                    const invoicesSheetUrl = invoicesSheet?.sheetUrl

                    navigate("/create-invoice", {
                      state: {
                        invoiceToEdit: invoice,
                        selectedSpreadsheetUrl: invoicesSheetUrl,
                        hideForm: true,
                      },
                    })
                    localStorage.setItem("invoiceToEdit", JSON.stringify(invoice))
                  }}
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {typeof invoice.customer === "object" ? invoice.customer.name : invoice.customer}
                    </div>
                    <div className="text-sm text-slate-500">
                      {typeof invoice.customer === "object" ? invoice.customer.email : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.date}</div>
                    <div className="text-sm text-slate-500">Due: {invoice.dueDate}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={invoice.status === "Paid" ? "default" : "secondary"}
                      className={
                        invoice.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.status === "Pending" && (
                      <div className="space-y-1">
                        {(() => {
                          const status = getOverdueStatus(invoice.dueDate, invoice.status);
                          if (!status) return (
                            <div className="text-xs text-slate-500">
                              Not due yet
                            </div>
                          );
                          
                          if (status.type === "overdue") {
                            return (
                              <div className="flex items-center gap-1">
                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                                  {status.days} days overdue
                                </Badge>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                  Due in {status.days} days
                                </Badge>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      {invoice.partialPayments && invoice.partialPayments.length > 0 && (
                        <div className="text-xs text-slate-500">
                          <div className="flex items-center gap-1 text-blue-600">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              {invoice.partialPayments.length} payment{invoice.partialPayments.length > 1 ? "s" : ""} received
                            </span>
                          </div>
                          {invoice.remainingAmount !== undefined && (
                            <div className="text-xs text-slate-400">
                              Remaining: {formatCurrency(invoice.remainingAmount)}
                            </div>
                          )}
                        </div>
                      )}
                      {invoice.emailStatus && (
                        <div className="text-xs text-slate-500">
                          {invoice.emailStatus === "Sent" && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Mail className="h-3 w-3" />
                              <span>Invoice sent</span>
                            </div>
                          )}
                          {invoice.emailStatus === "Reminder" && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Mail className="h-3 w-3" />
                              <span>Reminder sent</span>
                            </div>
                          )}
                          {invoice.lastEmailSent && (
                            <div className="text-xs text-slate-400">
                              {new Date(invoice.lastEmailSent).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Button
                        onClick={async (e) => {
                          e.stopPropagation();
                          handlePartialPayment(invoice);
                        }}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        size="sm"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Partial Payment
                      </Button>
                      <Button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const {
                              data: { session },
                              error: sessionError,
                            } = await supabase.auth.getSession();

                            if (sessionError) {
                              throw new Error(sessionError.message);
                            }

                            const response = await fetch(
                              "https://sheetbills-server.vercel.app/api/sheets/mark-as-paid",
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${session?.provider_token}`,
                                  "X-Supabase-Token": session?.access_token || "",
                                },
                                body: JSON.stringify({
                                  invoiceId: invoice.id,
                                  sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
                                }),
                              }
                            );

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || "Failed to mark invoice as paid");
                            }

                            // Update local state
                            const updatedInvoices = invoices.map((inv) =>
                              inv.id === invoice.id ? { ...inv, status: "Paid" as const } : inv
                            );
                            setInvoices(updatedInvoices);
                            if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl);

                            toast({
                              title: "Status Updated",
                              description: "Invoice marked as paid successfully.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: error instanceof Error ? error.message : "Failed to update invoice status",
                              variant: "destructive",
                            });
                          }
                        }}
                        className={`${
                          invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        size="sm"
                        disabled={invoice.status === "Paid"}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </Button>
                      <Button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const {
                              data: { session },
                              error: sessionError,
                            } = await supabase.auth.getSession();

                            if (sessionError) {
                              throw new Error(sessionError.message);
                            }

                            const response = await fetch(
                              "https://sheetbills-server.vercel.app/api/sheets/mark-as-pending",
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${session?.provider_token}`,
                                  "X-Supabase-Token": session?.access_token || "",
                                },
                                body: JSON.stringify({
                                  invoiceId: invoice.id,
                                  sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
                                }),
                              }
                            );

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || "Failed to mark invoice as pending");
                            }

                            // Update local state
                            const updatedInvoices = invoices.map((inv) =>
                              inv.id === invoice.id ? { ...inv, status: "Pending" as const } : inv
                            );
                            setInvoices(updatedInvoices);
                            if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl);

                            toast({
                              title: "Status Updated",
                              description: "Invoice marked as pending successfully.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: error instanceof Error ? error.message : "Failed to update invoice status",
                              variant: "destructive",
                            });
                          }
                        }}
                        className={`${
                          invoice.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                        size="sm"
                        disabled={invoice.status === "Pending"}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Pending
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewEmail(invoice)
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p>Send Invoice Email</p>
                                <p className="text-sm font-normal text-slate-500">
                                  {invoice.customer.email}
                                </p>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <Textarea
                                    value={previewEmail}
                                    onChange={(e) => setPreviewEmail(e.target.value)}
                                    className="min-h-[200px] font-mono bg-transparent border-0 focus-visible:ring-0 p-0"
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Clock className="h-4 w-4" />
                                  <span>Due: {invoice.dueDate}</span>
                                  <span className="mx-2">•</span>
                                  <span>Amount: {formatCurrency(invoice.amount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInvoice(null)
                                setPreviewEmail("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendEmail()
                              }}
                              disabled={isSendingEmail}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {isSendingEmail ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                              const invoicesSheetUrl = invoicesSheet?.sheetUrl
                              navigate("/create-invoice", {
                                state: {
                                  invoiceToEdit: invoice,
                                  selectedSpreadsheetUrl: invoicesSheetUrl,
                                },
                              })
                              localStorage.setItem("invoiceToEdit", JSON.stringify(invoice))
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setInvoiceToDelete(invoice)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="text-sm text-slate-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
}
