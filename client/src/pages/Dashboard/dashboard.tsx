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
import { InvoiceStats, InvoiceStat } from "../../components/ui/InvoiceStats"
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
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState<string | null>(null)
  // Row order for drag-and-drop
  const [rowOrder, setRowOrder] = React.useState<string[]>([])

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
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dueDateString)
    dueDate.setHours(0, 0, 0, 0)
    return Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
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

  // =====================
  // Partial Payment Logic
  // =====================
  // Handle partial payment modal actions
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

    return (
      <Card>
        <CardContent className="p-0 font-inter">
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
                disabled={selectedInvoices.size === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-8 px-4"></TableHead>
                      <TableHead className="w-[56px] px-6 py-4 align-middle text-center text-gray-600">
                        <input
                          type="checkbox"
                          ref={headerCheckboxRef}
                          checked={allVisibleSelected && currentItems.length > 0}
                          onChange={handleSelectAllVisible}
                          aria-label="Select all invoices on this page"
                          className="mx-auto accent-gray-600 h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("id")}
                        className="cursor-pointer px-6 py-4 whitespace-nowrap min-w-[160px] text-gray-600"
                      >
                        Invoice ID <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("customer")}
                        className="cursor-pointer px-6 py-4 text-gray-600"
                      >
                        Client <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("dueDate")}
                        className="cursor-pointer px-6 py-4 whitespace-nowrap min-w-[180px] text-gray-600"
                      >
                        Due Date <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("status")}
                        className="cursor-pointer px-6 py-4 text-gray-600"
                      >
                        Status <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("amount")}
                        className="cursor-pointer text-right px-6 py-4 text-gray-600"
                      >
                        Amount <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
                      </TableHead>
                      <TableHead className="text-center px-6 py-4 text-gray-600">
                        Overdue
                      </TableHead>
                      <TableHead className="text-center px-6 py-4 text-gray-600">
                        Payment Actions
                      </TableHead>
                      <TableHead className="w-[80px] px-6 py-4 text-gray-600">
                        Other Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowOrder.map((id) => {
                      const invoice = currentItems.find((inv) => inv.id === id)
                      if (!invoice) return null
                      return (
                        <SortableTableRow
                          key={invoice.id}
                          id={invoice.id}
                          invoice={invoice}
                          spreadsheets={spreadsheets}
                        >
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            className="w-[56px] px-6 py-4 align-middle text-center"
                          >
                            <Checkbox
                              checked={selectedInvoices.has(invoice.id)}
                              onCheckedChange={() => handleSelectInvoice(invoice.id)}
                              aria-label={`Select invoice ${invoice.id}`}
                              className="mx-auto"
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap min-w-[160px]">
                            {invoice.id}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="font-medium font-inter">
                                  {typeof invoice.customer === "object" ? invoice.customer.name : invoice.customer}
                                </span>
                                <span className="text-xs text-slate-500 font-inter">
                                  {typeof invoice.customer === "object" ? invoice.customer.email : ""}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                            <div className="font-medium font-inter">{formatDate(invoice.dueDate)}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {invoice.status === "Paid" ? (
                              <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium font-inter">
                                Paid
                              </span>
                            ) : invoice.status === "Pending" ? (
                              <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-100 text-gray-700 text-xs font-medium font-inter">
                                Pending
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium font-inter">
                                {invoice.status}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-center px-6 py-4">
                            {invoice.status === "Pending" && new Date(invoice.dueDate) < new Date() ? (
                              <span className="text-red-600 font-medium font-inter">{getOverdueDays(invoice.dueDate)} days</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="px-6 py-4">
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
                                    const updatedInvoices = invoices.map((inv) =>
                                      inv.id === invoice.id ? { ...inv, status: "Paid" as const } : inv,
                                    )
                                    setInvoices(updatedInvoices)
                                    if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)
                                    setBulkDeleteMessage(
                                      `Invoice #${invoice.id} has been deleted successfully and removed from your dashboard.`
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
                                  }
                                }}
                                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-3 shadow-none"
                                size="sm"
                                disabled={invoice.status === "Paid"}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="px-6 py-4">
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
                                  Edit Invoice
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
                                  Delete Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedInvoice(invoice)
                                    setIsPartialPaymentModalOpen(true)
                                  }}
                                >
                                  Partial Payment
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

  // Calculate stats from invoices
  const now = new Date();
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const overdueAmount = invoices
    .filter(inv => inv.status === "Pending" && new Date(inv.dueDate) < now)
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const unpaidAmount = invoices
    .filter(inv => inv.status === "Pending" && new Date(inv.dueDate) >= now)
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const stats: InvoiceStat[] = [
    { label: "Total Invoices", value: `$${totalAmount.toLocaleString()}`, percent: 0, trend: "neutral" },
    { label: "Paid", value: `$${paidAmount.toLocaleString()}`, percent: 0, trend: "neutral" },
    { label: "Unpaid", value: `$${unpaidAmount.toLocaleString()}`, percent: 0, trend: "neutral" },
    { label: "Overdue", value: `$${overdueAmount.toLocaleString()}`, percent: 0, trend: "neutral" },
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


      {/* Invoice Summary Stats
        <InvoiceStats stats={stats} />
      */}

      
      {/* Filter Tabs, Search, and Create Invoice Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-6">
        <div className="flex bg-gray-100 rounded-lg border border-gray-200">
          {[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Trash", value: "trash" },
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
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md  border-gray-200"
            disabled={isStateLoading}
          />
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
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
        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full text-sm">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-8 px-4"></TableHead>
                <TableHead className="w-[56px] px-6 py-4 align-middle text-center">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={allVisibleSelected && currentItems.length > 0}
                    onChange={handleSelectAllVisible}
                    aria-label="Select all invoices on this page"
                    className="mx-auto accent-gray-600 h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="px-6 py-4">Number</TableHead>
                <TableHead className="px-6 py-4">Client</TableHead>
                <TableHead className="px-6 py-4">Due Date</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">Total</TableHead>
                <TableHead className="px-6 py-4 text-center">Overdue</TableHead>
                <TableHead className="px-6 py-4 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowOrder.map((id) => {
                const invoice = currentItems.find((inv) => inv.id === id)
                if (!invoice) return null
                return (
                  <SortableTableRow key={invoice.id} id={invoice.id} invoice={invoice} spreadsheets={spreadsheets}>
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="w-[56px] px-6 py-4 align-middle text-center"
                    >
                      <Checkbox
                        checked={selectedInvoices.has(invoice.id)}
                        onCheckedChange={() => handleSelectInvoice(invoice.id)}
                        aria-label={`Select invoice ${invoice.id}`}
                        className="mx-auto"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{invoice.id}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium font-inter">
                          {typeof invoice.customer === "object" ? invoice.customer.name : invoice.customer}
                        </span>
                        <span className="text-xs text-gray-400">
                          {typeof invoice.customer === "object" ? invoice.customer.email : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="px-6 py-4">
                      {invoice.status === "Paid" ? (
                        <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium font-inter">
                          Paid
                        </span>
                      ) : invoice.status === "Pending" ? (
                        <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-100 text-gray-700 text-xs font-medium font-inter">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium font-inter">
                          {invoice.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell className="text-center px-8 py-6">
                      {invoice.status === "Pending" && new Date(invoice.dueDate) < new Date() ? (
                        <span className="text-red-600 px-4 py-1.5  text-sm">
                          {getOverdueDays(invoice.dueDate)} days
                        </span>
                      ) : (
                        <span className="text-gray-400 px-4 py-1.5 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="px-6 py-4">
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
                              const updatedInvoices = invoices.map((inv) =>
                                inv.id === invoice.id ? { ...inv, status: "Paid" as const } : inv,
                              )
                              setInvoices(updatedInvoices)
                              if (selectedSpreadsheetUrl) await fetchInvoices(selectedSpreadsheetUrl)
                              setBulkDeleteMessage(
                                `Invoice #${invoice.id} has been deleted successfully and removed from your dashboard.`
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
                            }
                          }}
                          className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-3 shadow-none"
                          size="sm"
                          disabled={invoice.status === "Paid"}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </SortableTableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex font-inter items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
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
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              {invoiceToDelete ? <span className="font-medium font-inter"> #{invoiceToDelete.id}</span> : null}.
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
              className="bg-gray-800 font-inter focus:ring-gray-800"
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
            <AlertDialogAction onClick={handleBulkDelete} className="bg-gray-800 font-inter focus:ring-gray-800">
              Delete
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
  [key: string]: any
}

function SortableTableRow({ id, children, invoice, spreadsheets, ...props }: SortableTableRowProps) {
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

  const handleRowClick = () => {
    if (invoice) {
      const invoicesSheet = spreadsheets.find((sheet) => sheet.name === "SheetBills Invoices")
      const invoicesSheetUrl = invoicesSheet?.sheetUrl

      navigate("/create-invoice", {
        state: {
          invoiceToEdit: invoice,
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
      className="hover:bg-slate-50"
      {...props}
    >
      <td className="w-8 px-2 align-middle text-center cursor-grab" style={{ verticalAlign: "middle" }}>
        <span
          {...attributes}
          {...listeners}
          className="inline-flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 active:text-gray-800"
        >
          <GripVertical className="h-6 w-6" />
        </span>
      </td>
      {children}
    </tr>
  )
}
