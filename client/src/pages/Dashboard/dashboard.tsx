"use client"

import React from "react"
import { useEffect, useState, useRef } from "react"
import { Trash2, Edit, MoreVertical, Plus, RefreshCw, ArrowUpDown, X, GripVertical } from "lucide-react"
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
import { Label } from "../../components/ui/label"
import { Calendar } from "../../components/ui/calendar"
import { Checkbox } from "../../components/ui/checkbox"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "../../components/ui/sheet"

interface Invoice {
  id: string
  date: string
  dueDate: string
  amount: number
  paidAmount?: number
  lastPaymentDate?: string
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
  status: "Paid" | "Pending" | "Partially Paid"
}

interface Spreadsheet {
  id: string
  name: string
  sheetUrl: string
  isDefault: boolean
}

function SortableTableRow({ id, children, ...props }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...props}
    >
      {/* Drag handle cell */}
      <td className="w-8 px-2 align-middle text-center cursor-grab" style={{ verticalAlign: "middle" }}>
        <span
          {...attributes}
          {...listeners}
          className="inline-flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 active:text-gray-800"
        >
          <GripVertical className="h-5 w-5" />
        </span>
      </td>
      {children}
    </tr>
  )
}

// Add GmailIcon SVG component
const GmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
      fill="#EA4335"
    />
  </svg>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Try to load cached data on initial render
    const cachedData = localStorage.getItem("cachedInvoices")
    return cachedData ? JSON.parse(cachedData) : []
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
    const cachedTime = localStorage.getItem("lastFetchTime")
    return cachedTime ? Number.parseInt(cachedTime) : 0
  })
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isPartialPaymentModalOpen, setIsPartialPaymentModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState<string | null>(null)
  const [rowOrder, setRowOrder] = React.useState(invoices.map((inv) => inv.id))

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
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const fetchInvoices = async (sheetUrl: string) => {
    try {
      setIsLoading(true)

      // Check if we need to refresh the data (5 minutes cache)
      const currentTime = Date.now()
      const timeSinceLastFetch = currentTime - lastFetchTime
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

      if (timeSinceLastFetch < CACHE_DURATION && invoices.length > 0) {
        setIsLoading(false)
        return // Use cached data
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
      localStorage.setItem("cachedInvoices", JSON.stringify(transformedData))
      localStorage.setItem("lastFetchTime", currentTime.toString())
      setLastFetchTime(currentTime)

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
      let valueA: any = a[key]
      let valueB: any = b[key]

      if (key === "date" || key === "dueDate") {
        valueA = typeof valueA === "string" || typeof valueA === "number" ? new Date(valueA).getTime() : 0
        valueB = typeof valueB === "string" || typeof valueB === "number" ? new Date(valueB).getTime() : 0
      } else if (key === "amount") {
        valueA = a.amount
        valueB = b.amount
      } else if (key === "customer") {
        valueA = typeof a.customer === "object" ? a.customer.name : a.customer
        valueB = typeof b.customer === "object" ? b.customer.name : b.customer
      } else if (key === "status") {
        valueA = a.status
        valueB = b.status
      }

      // Ensure values are defined before comparison
      if (valueA === undefined) valueA = ""
      if (valueB === undefined) valueB = ""

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
      localStorage.removeItem("cachedInvoices")
      localStorage.removeItem("lastFetchTime")
      setLastFetchTime(0)
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

  const handlePartialPayment = async () => {
    if (!selectedInvoice) return

    try {
      const amount = Number.parseFloat(partialPaymentAmount)
      if (isNaN(amount) || amount <= 0 || amount >= selectedInvoice.amount) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid partial payment amount.",
          variant: "destructive",
        })
        return
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/sheets/partial-payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.provider_token}`,
          "X-Supabase-Token": session?.access_token || "",
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: amount,
          paymentDate: paymentDate.toISOString(),
          sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process partial payment")
      }

      // Update local state with proper typing
      const updatedInvoices = invoices.map((inv) =>
        inv.id === selectedInvoice.id
          ? ({
              ...inv,
              status: amount === inv.amount ? "Paid" : "Partially Paid",
              paidAmount: amount,
              lastPaymentDate: paymentDate.toISOString(),
            } as Invoice)
          : inv,
      )
      setInvoices(updatedInvoices)
      if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)

      toast({
        title: "Payment Recorded",
        description: "Partial payment has been recorded successfully.",
      })

      setIsPartialPaymentModalOpen(false)
      setSelectedInvoice(null)
      setPartialPaymentAmount("")
      setPaymentDate(new Date())
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    }
  }

  // Add function to handle checkbox selection
  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId)
      } else {
        newSet.add(invoiceId)
      }
      return newSet
    })
  }

  // Add function to handle select all visible
  const handleSelectAllVisible = () => {
    const allVisibleIds = currentItems.map((invoice) => invoice.id)
    const allSelected = allVisibleIds.every((id) => selectedInvoices.has(id))
    setSelectedInvoices((prev) => {
      const newSet = new Set(prev)
      if (allSelected) {
        // Deselect all visible
        allVisibleIds.forEach((id) => newSet.delete(id))
      } else {
        // Select all visible
        allVisibleIds.forEach((id) => newSet.add(id))
      }
      return newSet
    })
  }

  // Add function to handle select all across all pages
  const handleSelectAllGlobal = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map((invoice) => invoice.id)))
    }
  }

  // Add function to handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/sheets/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.provider_token}`,
          "X-Supabase-Token": session?.access_token || "",
        },
        body: JSON.stringify({
          invoiceIds: Array.from(selectedInvoices),
          sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete invoices")
      }

      // Update local state by removing the deleted invoices
      const updatedInvoices = invoices.filter((inv) => !selectedInvoices.has(inv.id))
      setInvoices(updatedInvoices)
      if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)

      setBulkDeleteMessage(
        `${selectedInvoices.size} invoice(s) have been deleted successfully and removed from your dashboard.`,
      )

      setSelectedInvoices(new Set())
      setIsBulkDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete invoices",
        variant: "destructive",
      })
    }
  }

  // For indeterminate state
  const allVisibleIds = currentItems.map((invoice) => invoice.id)
  const allVisibleSelected = allVisibleIds.every((id) => selectedInvoices.has(id))
  const someVisibleSelected = allVisibleIds.some((id) => selectedInvoices.has(id)) && !allVisibleSelected

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected
    }
  }, [someVisibleSelected])

  React.useEffect(() => {
    setRowOrder(currentItems.map((inv) => inv.id))
  }, [currentItems])
  const sensors = useSensors(useSensor(PointerSensor))

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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {/* Total Invoices Card */}
          <Card className="py-2 px-3">
            <CardHeader className="pb-1 px-2">
              <CardTitle className="text-md font-medium text-slate-500">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-1">
              {isStateLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-center">
                  <div className="text-lg font-bold text-slate-900">{totalInvoices}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Amount Card */}
          <Card className="py-2 px-3">
            <CardHeader className="pb-1 px-2">
              <CardTitle className="text-md font-medium text-slate-500">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-1">
              {isStateLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-center">
                  <div className="text-lg font-bold text-slate-900">{formatCurrency(pendingAmount)}</div>
                </div>
              )}
              <span className="text-xs">
                <span className="bg-green-100 text-green-800  pl-2 pr-2 pt-0 pb-0">{pendingInvoices} pending</span>
              </span>
            </CardContent>
          </Card>

          {/* Paid Amount Card */}
          <Card className="py-2 px-3">
            <CardHeader className="pb-1 px-2">
              <CardTitle className="text-md font-medium text-slate-500 ">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-1">
              {isStateLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-center">
                  <div className="text-lg font-bold text-slate-900">{formatCurrency(paidAmount)}</div>
                </div>
              )}
              <span className="text-xs">
                <span className="bg-green-100 text-green-800  pl-2 pr-2 pt-0 pb-0">{paidInvoices} paid</span>
              </span>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="py-2 px-3">
            <CardHeader className="pb-1 px-2">
              <CardTitle className="text-md font-medium text-slate-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-1">
              {isStateLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-center">
                  <div className="text-lg font-bold text-slate-900">{formatCurrency(paidAmount + pendingAmount)}</div>
                </div>
              )}
              <span className="text-xs text-slate-500">All time</span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Content */}
        <Tabs defaultValue="all" className="mb-8">
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete these invoices?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedInvoices.size} selected invoice(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Partial Payment Sidebar */}
      <Sheet open={isPartialPaymentModalOpen} onOpenChange={setIsPartialPaymentModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl">Record Partial Payment</SheetTitle>
            <SheetDescription>Enter the payment amount and date for invoice #{selectedInvoice?.id}</SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="amount" className="text-sm font-medium">
                Payment Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={partialPaymentAmount}
                onChange={(e) => setPartialPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                max={selectedInvoice?.amount}
                step="0.01"
                className="w-full"
              />
              <p className="text-sm bg-green-100 text-green-800 px-3 py-2 rounded-md font-medium">
                Total invoice amount: {formatCurrency(selectedInvoice?.amount || 0)}
              </p>
            </div>

            <div className="grid gap-3">
              <Label className="text-sm font-medium">Payment Date</Label>
              <div className="border rounded-md p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  className="mx-auto"
                  classNames={{
                    day_selected: "bg-green-600 text-white hover:bg-green-600 focus:bg-green-600",
                    day_today: "bg-slate-100 text-slate-900",
                    day_outside: "text-slate-300",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  }}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsPartialPaymentModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handlePartialPayment} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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

    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-2">
            {bulkDeleteMessage && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 rounded px-4 py-2 mb-2">
                <span>{bulkDeleteMessage}</span>
                <button
                  onClick={() => setBulkDeleteMessage(null)}
                  className="ml-4 p-1 rounded hover:bg-green-100 focus:outline-none"
                  aria-label="Dismiss message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between p-4 border-b gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllVisible}
                  className="font-medium"
                  disabled={currentItems.length === 0}
                >
                  {allVisibleSelected ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-sm text-slate-500">{selectedInvoices.size} selected</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                disabled={selectedInvoices.size === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: any) => {
                const { active, over } = event
                if (active.id !== over?.id) {
                  const oldIndex = rowOrder.indexOf(active.id)
                  const newIndex = rowOrder.indexOf(over.id)
                  const newOrder = arrayMove(rowOrder, oldIndex, newIndex)
                  setRowOrder(newOrder)
                  // Reorder currentItems and update invoices state accordingly
                  const reordered = newOrder
                    .map((id) => currentItems.find((inv) => inv.id === id))
                    .filter((inv): inv is Invoice => Boolean(inv))
                  // Update invoices state (for persistence)
                  setInvoices((prev) => {
                    // Only reorder the current page, keep others as is
                    const start = indexOfFirstItem
                    const end = indexOfLastItem
                    return [...prev.slice(0, start), ...reordered, ...prev.slice(end)]
                  })
                }
              }}
            >
              <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-8 px-2"></TableHead>
                      <TableHead className="w-[56px] px-4 py-2 align-middle text-center">
                        <input
                          type="checkbox"
                          ref={headerCheckboxRef}
                          checked={allVisibleSelected && currentItems.length > 0}
                          onChange={handleSelectAllVisible}
                          aria-label="Select all invoices on this page"
                          className="mx-auto accent-blue-600 h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
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
                      <TableHead onClick={() => handleSort("amount")} className="cursor-pointer font-medium text-right">
                        Amount <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead className="font-medium text-center">Overdue</TableHead>
                      <TableHead className="font-medium text-center">Payment Actions</TableHead>
                      <TableHead className="w-[80px] font-medium">Other Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowOrder.map((id) => {
                      const invoice = currentItems.find((inv) => inv.id === id)
                      if (!invoice) return null
                      return (
                        <SortableTableRow key={invoice.id} id={invoice.id}>
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            className="w-[56px] px-4 py-2 align-middle text-center"
                          >
                            <Checkbox
                              checked={selectedInvoices.has(invoice.id)}
                              onCheckedChange={() => handleSelectInvoice(invoice.id)}
                              aria-label={`Select invoice ${invoice.id}`}
                              className="mx-auto"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {typeof invoice.customer === "object" ? invoice.customer.name : invoice.customer}
                                </span>

                                <span className="text-xs text-slate-500">
                                  {typeof invoice.customer === "object" ? invoice.customer.email : ""}
                                </span>
                              </div>
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
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-md px-4"
                                  : invoice.status === "Partially Paid"
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50 text-md px-4"
                                    : "bg-amber-50 text-amber-700 hover:bg-amber-50 text-md px-4"
                              }
                            >
                              {invoice.status}
                              {invoice.status === "Partially Paid" && invoice.paidAmount && (
                                <span className="ml-2 text-sm">({formatCurrency(invoice.paidAmount)})</span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="text-center">
                            {invoice.status === "Pending" && new Date(invoice.dueDate) < new Date() ? (
                              <span className="text-red-600 font-medium">
                                {Math.ceil(
                                  (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24),
                                )}{" "}
                                days
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const {
                                      data: { session },
                                      error: sessionError,
                                    } = await supabase.auth.getSession()

                                    if (sessionError) {
                                      throw new Error(sessionError.message)
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
                                          sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                                            ?.sheetUrl,
                                        }),
                                      },
                                    )

                                    if (!response.ok) {
                                      const errorData = await response.json()
                                      throw new Error(errorData.error || "Failed to mark invoice as paid")
                                    }

                                    // Update local state
                                    const updatedInvoices = invoices.map((inv) =>
                                      inv.id === invoice.id ? { ...inv, status: "Paid" as const } : inv,
                                    )
                                    setInvoices(updatedInvoices)
                                    if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)

                                    toast({
                                      title: "Status Updated",
                                      description: "Invoice marked as paid successfully.",
                                    })
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description:
                                        error instanceof Error ? error.message : "Failed to update invoice status",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                                className={`${invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                                size="sm"
                                disabled={invoice.status === "Paid"}
                              >
                                Mark as Paid
                              </Button>
                              <Button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const {
                                      data: { session },
                                      error: sessionError,
                                    } = await supabase.auth.getSession()

                                    if (sessionError) {
                                      throw new Error(sessionError.message)
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
                                          sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                                            ?.sheetUrl,
                                        }),
                                      },
                                    )

                                    if (!response.ok) {
                                      const errorData = await response.json()
                                      throw new Error(errorData.error || "Failed to mark invoice as pending")
                                    }

                                    // Update local state
                                    const updatedInvoices = invoices.map((inv) =>
                                      inv.id === invoice.id ? { ...inv, status: "Pending" as const } : inv,
                                    )
                                    setInvoices(updatedInvoices)
                                    if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)

                                    toast({
                                      title: "Status Updated",
                                      description: "Invoice marked as pending successfully.",
                                    })
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description:
                                        error instanceof Error ? error.message : "Failed to update invoice status",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                                className={`${invoice.status === "Pending" ? "bg-amber-100  text-amber-700" : "bg-amber-50 text-amber-700 p-0 hover:bg-amber-100"}`}
                                size="sm"
                                disabled={invoice.status === "Pending"}
                              >
                                Mark as Pending
                              </Button>
                              <Button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  setSelectedInvoice(invoice)
                                  setIsPartialPaymentModalOpen(true)
                                }}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                size="sm"
                                disabled={invoice.status === "Paid"}
                              >
                                Partial Payment
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const invoicesSheet = spreadsheets.find(
                                      (sheet) => sheet.name === "SheetBills Invoices",
                                    )
                                    const invoicesSheetUrl = invoicesSheet?.sheetUrl

                                    navigate("/create-invoice", {
                                      state: {
                                        invoiceToEdit: invoice,
                                        selectedSpreadsheetUrl: invoicesSheetUrl,
                                      },
                                    })
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
                          </TableCell>
                        </SortableTableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
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
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} of{" "}
                  {filteredInvoices.length} invoices
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
}
