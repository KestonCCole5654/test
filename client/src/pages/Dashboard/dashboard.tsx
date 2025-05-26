"use client"

import React, { useEffect, useState, useRef } from "react"
import { Trash2, MoreVertical, RefreshCw, ArrowUpDown, X, GripVertical } from "lucide-react"
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
import { Skeleton } from "../../components/ui/skeleton"
import { toast } from "../../components/ui/use-toast"
import supabase from "../../components/Auth/supabaseClient"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent } from "../../components/ui/card"
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
import { InvoiceStats, InvoiceStat, useBrandLogo } from "../../components/ui/InvoiceStats"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

// =====================
// Types & Interfaces
// =====================
interface Invoice {
  id: string
  invoiceNumber: string
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

// =====================
// Main Dashboard Component
// =====================
export default function Dashboard() {
  // ----------- State & Constants -----------
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
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  // Partial Payment Modal
  const [isPartialPaymentModalOpen, setIsPartialPaymentModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  // Bulk selection
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState<string | null>(null)
  // Row order for drag-and-drop
  const [rowOrder, setRowOrder] = React.useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(false)

  // =====================
  // Table Pagination & Selection (must be above useEffect hooks)
  // =====================
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const allVisibleIds = currentItems.map((invoice) => invoice.id)
  const allVisibleSelected = allVisibleIds.every((id) => selectedInvoices.has(id))
  const someVisibleSelected = allVisibleIds.some((id) => selectedInvoices.has(id)) && !allVisibleSelected

  // =====================
  // Effects
  // =====================

  // Auth check on mount
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
          navigate("/login", { state: { sessionExpired: true } })
        }
      } catch (err) {
        if (!isMounted) return
        navigate("/login", {
          state: {
            error: "Connection error. Please try again.",
            from: location.pathname,
          },
        })
      }
    }
    checkAuth()
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [navigate, location.pathname])

  // Fetch spreadsheets for user
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

  // Filter and sort invoices when data or filters change
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
    setCurrentPage(1) // Reset to first page when filters change
  }, [invoices, searchQuery, statusFilter])

  // Update row order when current items change
  useEffect(() => {
    setRowOrder(currentItems.map((inv) => inv.id))
  }, [currentItems])

  // Indeterminate state for header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected
    }
  }, [someVisibleSelected])

  // Check for just_onboarded flag and no invoices on mount or when invoices change
  useEffect(() => {
    const justOnboarded = localStorage.getItem('just_onboarded') === 'true'
    if (justOnboarded && invoices.length === 0) {
      setShowWelcome(true)
      localStorage.removeItem('just_onboarded') // Remove flag after showing
    } else {
      setShowWelcome(false)
    }
  }, [invoices])

  // Add this useEffect after your other useEffects
  useEffect(() => {
    const handleRefresh = async () => {
      if (selectedSpreadsheetUrl) {
        // Clear cache and force fetch
        localStorage.removeItem("cachedInvoices");
        localStorage.removeItem("lastFetchTime");
        setLastFetchTime(0);
        await fetchInvoices(selectedSpreadsheetUrl);
      }
    };

    // Check for refresh flag in location state
    if (location.state?.refresh) {
      handleRefresh();
      // Remove the flag so it doesn't keep refreshing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, selectedSpreadsheetUrl, navigate, location.pathname]);

  // Add a new effect to handle initial load and spreadsheet changes
  useEffect(() => {
    if (selectedSpreadsheetUrl) {
      fetchInvoices(selectedSpreadsheetUrl);
    }
  }, [selectedSpreadsheetUrl]);

  // =====================
  // Utility Functions
  // =====================

  // Format currency for display
  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Validate Google Sheet URL
  const isValidGoogleSheetUrl = (url: string): boolean => {
    return /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url)
  }

  // Validate tax/discount fields
  const validateFinancialField = (field: any) => {
    return {
      type: ["percentage", "fixed"].includes(field?.type) ? field.type : "fixed",
      value: Math.max(0, Number(field?.value) || 0),
    }
  }

  // Utility function to calculate overdue days accurately
  function getOverdueDays(dueDateString: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const dueDate = new Date(dueDateString)
    dueDate.setHours(0, 0, 0, 0) // Reset time to start of day
    
    // If due date is in the future, return 0
    if (dueDate > today) return 0
    
    // Calculate the difference in days
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // =====================
  // Invoice Data Fetching
  // =====================
  // Fetch invoices from API and cache
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

  // =====================
  // Table & Bulk Actions
  // =====================
  // Checkbox selection for invoices
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
  // Select all visible invoices
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
  // Select all invoices across all pages
  const handleSelectAllGlobal = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map((invoice) => invoice.id)))
    }
  }
  
  // Bulk delete selected invoices
  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) {
        throw new Error(sessionError.message)
      }
      localStorage.removeItem("cachedInvoices");
      localStorage.removeItem("lastFetchTime");
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
    } finally {
      setIsDeleting(false)
    }
  }



  // =====================
  // Table Rendering & UI
  // =====================
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Sorting handler
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
      if (valueA === undefined) valueA = ""
      if (valueB === undefined) valueB = ""
      if (valueA < valueB) return direction === "ascending" ? -1 : 1
      if (valueA > valueB) return direction === "ascending" ? 1 : -1
      return 0
    })
    setSortConfig({ key, direction })
    setFilteredInvoices(sortedInvoices)
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

  const sensors = useSensors(useSensor(PointerSensor))

  // Handle drag end
  const handleDragEnd = (event: any) => {
                const { active, over } = event
                if (active.id !== over?.id) {
                  const oldIndex = rowOrder.indexOf(active.id)
                  const newIndex = rowOrder.indexOf(over.id)
                  const newOrder = arrayMove(rowOrder, oldIndex, newIndex)
                  setRowOrder(newOrder)
      
      // Reorder the invoices array
      const reorderedInvoices = [...invoices]
      const [movedInvoice] = reorderedInvoices.splice(oldIndex, 1)
      reorderedInvoices.splice(newIndex, 0, movedInvoice)
      setInvoices(reorderedInvoices)
    }
  }

  // Calculate stats from invoices
  const now = new Date();
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalInvoices = invoices.length;
  const paidInvoicesTotal = invoices
    .filter(inv => inv.status === "Paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const unpaidInvoicesTotal = invoices
    .filter(inv => inv.status === "Pending")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidInvoicesCount = invoices.filter(inv => inv.status?.toLowerCase() === "paid").length;
  const unpaidInvoicesCount = invoices.filter(inv => inv.status?.toLowerCase() === "pending").length;

  const stats: InvoiceStat[] = [
    {
      label: "Revenue",
      value: `$${totalAmount.toLocaleString()}`,
      percent: 4.75,
      trend: "up"
    },
    {
      label: "Total Invoices",
      value: totalInvoices.toString(),
      percent: 54.02,
      trend: "up"
    },
    {
      label: "Paid Invoices",
      value: `$${paidInvoicesTotal.toLocaleString()}`,
      count: paidInvoicesCount,
      percent: 54.02,
      trend: "up"
    },
    {
      label: "Unpaid Invoices",
      value: `$${unpaidInvoicesTotal.toLocaleString()}`,
      count: unpaidInvoicesCount,
      percent: -1.39,
      trend: "down"
    }
  ];

  return (
    <div className="container bg-transparent max-w-7xl mx-auto px-4">
      {/* Breadcrumb Navigation */}
      <div className="mt-4 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Invoices</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Welcome message for newly onboarded users only */}
      {showWelcome && (
        <div className="mb-6 text-center">
          <span className="text-xl font-cal-sans font-normal text-gray-800">
            Hi, welcome aboard! {user?.user_metadata?.name || user?.email?.split("@")[0] || "there"}, Create your first invoice by clicking the <span className="text-green-800">New Invoice</span> button.
          </span>
        </div>
      )}

      {/* Stats Card */}
      <InvoiceStats stats={stats} lastUpdated={now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />

        {/* Tips Section */}
        {/* <div className="mb-6 p-4 bg-green-50 border border-green-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div >
            <h3 className="text-2xl font-medium text-green-800 mb-1">Important Tip</h3>
            <p className="text-md text-red-700">
              When you Save/Update an invoice, ensure you click the refresh button to see your changes.
            </p>
          </div>
        </div>
      </div> */}

      {/* Filter Tabs, Search, and Create Invoice Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-6">
        <div className="flex bg-gray-100 border border-gray-200">
          {[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`px-6 py-2 text-sm transition-colors border border-gray-200 focus:outline-none ${
                statusFilter === tab.value
                  ? "text-gray-700 border-gray-300 bg-gray-200" // active
                  : "text-gray-600 border-gray-200 bg-gray-100 hover:bg-gray-200"
              } `}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-96 lg:w-[32rem]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <Input
              placeholder="Search for Invoices ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-96 lg:w-[32rem] border-gray-200"
              disabled={isStateLoading}
            />
          </div>
          <Button
            onClick={handleRefresh}
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 shadow-none"
            disabled={isStateLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isStateLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
              const invoicesSheetUrl = invoicesSheet?.sheetUrl
              navigate("/create-invoice", {
                state: {
                  selectedSpreadsheetUrl: invoicesSheetUrl,
                  key: Date.now(),
                },
              })
            }}
            className="border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none"
            disabled={isStateLoading}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 ">
        {/* Toolbar section above the table */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg mb-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllVisible}
              className="text-white"
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
            disabled={selectedInvoices.size === 0 || isDeleting}
            className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
        {bulkDeleteMessage && (
          <div className="flex items-center font-light justify-between bg-green-50 border border-green-200 text-green-800 rounded px-4 py-2 mb-2">
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
        
        {/* Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             
              <h3 className="text-lg font-medium text-gray-900 mb-1 font-cal-sans">No invoices found</h3>
              <p className="text-sm text-gray-500 mb-6 font-cal-sans">Please refresh to see your invoices or create a new invoice.</p>
             
            </div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-8 px-4 border-r border-gray-200"></TableHead>
                  <TableHead className="w-[56px] px-6 py-4 align-middle text-center border-r border-gray-200">
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      checked={allVisibleSelected && currentItems.length > 0}
                      onChange={handleSelectAllVisible}
                      aria-label="Select all invoices on this page"
                      className="mx-auto accent-green-800 h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Number</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Client</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Due Date</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right border-r border-gray-200">Total</TableHead>
                  <TableHead className="px-6 py-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
                  <TableBody className="cursor-pointer">
                    {rowOrder.map((id) => {
                      const invoice = currentItems.find((inv) => inv.id === id)
                      if (!invoice) return null
                      return (
                        <SortableTableRow
                          key={invoice.id}
                          id={invoice.id}
                          invoice={invoice}
                          spreadsheets={spreadsheets}
                          selectedInvoices={selectedInvoices}
                          handleSelectInvoice={handleSelectInvoice}
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap border-r border-gray-200">{invoice.id}</TableCell>
                          <TableCell className="px-6 py-4 border-r border-gray-200">
                            <div className="flex items-center gap-3 min-h-[48px]">
                              {(() => {
                                const email = typeof invoice.customer === "object" ? invoice.customer.email : "";
                                const domain = email.split("@")[1] || "";
                                return <ClientLogo domain={domain} />;
                              })()}
                              <span className="font-normal font-cal-sans text-base">
                                {typeof invoice.customer === "object" ? invoice.customer.name : invoice.customer}
                              </span>
                            </div>
                            <span className="text-sm font-cal-sans font-normal text-gray-400">
                              {typeof invoice.customer === "object" ? invoice.customer.email : ""}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap font-cal-sans font-normal border-r border-gray-200">{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell className="px-6 py-4 border-r border-gray-200">
                            {invoice.status === "Paid" ? (
                              <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-green-200 bg-green-50 text-green-700 text-sm">
                                Paid
                              </span>
                            ) : invoice.status === "Pending" && getOverdueDays(invoice.dueDate) > 0 ? (
                              <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm ">
                                Pending
                              </span>
                            ) : invoice.status === "Pending" ? (
                              <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                                Pending
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                                {invoice.status}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-normal font-cal-sans text-md px-6 py-4 border-r border-gray-200">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="text-center px-6 py-4">
                            <div className="flex justify-center gap-2">
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

                                    // Find the invoices sheet and validate it exists
                                    const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
                                    if (!invoicesSheet?.sheetUrl) {
                                      throw new Error("Invoice spreadsheet not found. Please ensure you have access to the SheetBills Invoices spreadsheet.")
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
                                          sheetUrl: invoicesSheet.sheetUrl,
                                        }),
                                      },
                                    )
                                    if (!response.ok) {
                                      const errorData = await response.json()
                                      console.error("Mark as paid error:", errorData)
                                      toast({
                                        title: "Error marking as paid",
                                        description: errorData.error || errorData.details || "Failed to mark invoice as paid.",
                                        variant: "destructive",
                                      })
                                      return
                                    }
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
                                    console.error("Mark as paid error (catch):", error)
                                    toast({
                                      title: "Error marking as paid",
                                      description: error instanceof Error ? error.message : "Failed to update invoice status.",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-3 shadow-none"
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
                                          sheetUrl: spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")?.sheetUrl,
                                        }),
                                      },
                                    )
                                    if (!response.ok) {
                                      const errorData = await response.json()
                                      throw new Error(errorData.error || "Failed to mark invoice as pending")
                                    }
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
                                      description: error instanceof Error ? error.message : "Failed to update invoice status",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-3 shadow-none"
                                size="sm"
                                disabled={invoice.status === "Pending"}
                              >
                                Mark as Pending
                              </Button>
                            </div>
                          </TableCell>
                        </SortableTableRow>
                      )
                    })}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex font- items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-200"
              >
                Previous
              </Button>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-200"
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} of{" "}
              {filteredInvoices.length} invoices
            </div>
          </div>
        )}
        
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-cal-sans font-medium" >Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription className="font-cal-sans text-gray-700">
              This action cannot be undone. This will permanently delete the invoice
              {invoiceToDelete ? <span className="font-medium font-cal-sans"> #{invoiceToDelete.id}</span> : null}.
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
                  localStorage.removeItem("cachedInvoices");
                  localStorage.removeItem("lastFetchTime");
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
                  setBulkDeleteMessage(
                    `Invoice #${invoiceToDelete.id} has been deleted successfully and removed from your dashboard.`
                  )
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
              className="bg-gray-800 font- focus:ring-gray-800"
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
            <AlertDialogTitle className="font-cal-sans font-medium">Are you sure you want to delete these invoices?</AlertDialogTitle>
            <AlertDialogDescription className="font-cal-sans text-gray-700">
              This action cannot be undone. This will permanently delete {selectedInvoices.size} selected invoice(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-cal-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-gray-800 font-cal-sans focus:ring-gray-800"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

// =====================
// Sortable Table Row Component
// =====================
interface SortableTableRowProps {
  id: string
  children: React.ReactNode
  invoice: Invoice
  spreadsheets: Spreadsheet[]
  selectedInvoices: Set<string>
  handleSelectInvoice: (id: string) => void
  [key: string]: any
}

function SortableTableRow({ id, children, invoice, spreadsheets, selectedInvoices, handleSelectInvoice, ...props }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  }

  const navigate = useNavigate()

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the checkbox or drag handle
    if (e.target instanceof HTMLElement) {
      const isCheckbox = e.target.closest('[role="checkbox"]')
      const isDragHandle = e.target.closest('[data-draggable]')
      if (isCheckbox || isDragHandle) {
        return
      }
    }

    if (invoice) {
      const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
      const invoicesSheetUrl = invoicesSheet?.sheetUrl
      // Ensure invoiceNumber is always present and matches id
      const invoiceToEdit = { ...invoice, invoiceNumber: invoice.invoiceNumber || invoice.id }
      navigate("/create-invoice", {
        state: {
          invoiceToEdit,
          selectedSpreadsheetUrl: invoicesSheetUrl,
          hideForm: true,
        },
      })
    }
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={handleRowClick}
      className="hover:bg-slate-50 border-b border-gray-200"
      {...props}
    >
      <td className="w-8 px-4 align-middle text-center border-r border-gray-200" style={{ verticalAlign: "middle" }}>
        <div className="flex items-center justify-center h-full min-h-[40px]">
          <span
            {...attributes}
            {...listeners}
            data-draggable="true"
            className="inline-flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 active:text-gray-800"
          >
            <GripVertical className="h-6 w-6" />
          </span>
        </div>
      </td>
      <td className="w-[56px] px-6 py-4 align-middle text-center border-r border-gray-200" style={{ verticalAlign: "middle" }}>
        <div className="flex items-center justify-center h-full min-h-[40px]">
          <Checkbox
            checked={selectedInvoices.has(invoice.id)}
            onCheckedChange={() => handleSelectInvoice(invoice.id)}
            aria-label={`Select invoice ${invoice.id}`}
            className="mx-auto"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>
      {children}
    </tr>
  )
}

// =====================
// Client Logo Component
// =====================
function ClientLogo({ domain }: { domain: string }) {
  const logoUrl = useBrandLogo(domain);
  return (
    <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
      {domain === 'gmail.com' ? (
        <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="logo" className="w-full h-full object-contain" />
      ) : logoUrl ? (
        <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
      ) : (
        <span className="inline-block w-full h-full rounded-full bg-gray-200" />
      )}
    </div>
  );
}
