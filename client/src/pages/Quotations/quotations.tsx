"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Trash2, RotateCcw, MoreVertical, RefreshCw, ArrowUpDown, X, GripVertical } from "lucide-react"
import { useToast } from "../../components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { InvoiceStats, InvoiceStat, useBrandLogo } from "../../components/ui/InvoiceStats"

interface Quotation {
  id: string
  quotationNumber: string
  date: string
  validUntil: string
  customer: {
    name: string
    email: string
  }
  amount: number
  status: "Draft" | "Sent" | "Accepted" | "Rejected"
}

function ClientCell({ name, email }: { name: string; email: string }) {
  const domain = email.split("@")[1] || "";
  const logoUrl = useBrandLogo(domain);
  return (
    <div className="flex items-center gap-3">
      {logoUrl && (
        <img src={logoUrl} alt="Client Logo" className="h-7 w-7 rounded-full border border-gray-200 bg-white object-contain" />
      )}
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{name}</span>
        <span className="text-sm text-gray-500">{email}</span>
      </div>
    </div>
  );
}

export default function Quotations() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const [statusFilter, setStatusFilter] = useState<string>("All")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = quotations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(quotations.length / itemsPerPage)
  const allVisibleIds = currentItems.map((q) => q.id)
  const allVisibleSelected = allVisibleIds.every((id) => selectedInvoices.has(id))
  const someVisibleSelected = allVisibleIds.some((id) => selectedInvoices.has(id)) && !allVisibleSelected

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Move loadQuotations outside useEffect for refresh
  const loadQuotations = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to fetch quotations
      // For now, using mock data
      const mockQuotations: Quotation[] = [
        {
          id: "1",
          quotationNumber: "QT-2024-0001",
          date: "2024-03-15",
          validUntil: "2024-04-15",
          customer: {
            name: "John Doe",
            email: "john@example.com",
          },
          amount: 1500.0,
          status: "Draft",
        },
        {
          id: "2",
          quotationNumber: "QT-2024-0002",
          date: "2024-03-14",
          validUntil: "2024-04-14",
          customer: {
            name: "Jane Smith",
            email: "jane@example.com",
          },
          amount: 2750.5,
          status: "Sent",
        },
      ]
      setQuotations(mockQuotations)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuotations()
    // eslint-disable-next-line
  }, [toast])

  // Filter quotations based on search query and status
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "All" || quotation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle delete quotation
  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete functionality
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      })
    }
  }

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedInvoices((prev) => {
        const newSet = new Set(prev)
        allVisibleIds.forEach((id) => newSet.delete(id))
        return newSet
      })
    } else {
      setSelectedInvoices((prev) => {
        const newSet = new Set(prev)
        allVisibleIds.forEach((id) => newSet.add(id))
        return newSet
      })
    }
  }

  const handleSelectInvoice = (id: string) => {
    const newSelectedInvoices = new Set(selectedInvoices)
    if (newSelectedInvoices.has(id)) {
      newSelectedInvoices.delete(id)
    } else {
      newSelectedInvoices.add(id)
    }
    setSelectedInvoices(newSelectedInvoices)
  }

  // Calculate stats from quotations
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Get current month's data
  const currentMonthQuotations = quotations.filter((q) => {
    const qDate = new Date(q.date)
    return (
      qDate.getMonth() === currentMonth &&
      qDate.getFullYear() === currentYear
    )
  })

  // Get previous month's data
  const previousMonthQuotations = quotations.filter((q) => {
    const qDate = new Date(q.date)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return (
      qDate.getMonth() === prevMonth && qDate.getFullYear() === prevYear
    )
  })

  // Calculate current month totals
  const currentMonthTotal = currentMonthQuotations.reduce(
    (sum, q) => sum + (q.amount || 0),
    0
  )
  const currentMonthAcceptedTotal = currentMonthQuotations
    .filter((q) => q.status === "Accepted")
    .reduce((sum, q) => sum + (q.amount || 0), 0)
  const currentMonthSentTotal = currentMonthQuotations
    .filter((q) => q.status === "Sent")
    .reduce((sum, q) => sum + (q.amount || 0), 0)
  const currentMonthAcceptedCount = currentMonthQuotations.filter(
    (q) => q.status === "Accepted"
  ).length
  const currentMonthSentCount = currentMonthQuotations.filter(
    (q) => q.status === "Sent"
  ).length

  // Calculate previous month totals
  const previousMonthTotal = previousMonthQuotations.reduce(
    (sum, q) => sum + (q.amount || 0),
    0
  )
  const previousMonthAcceptedTotal = previousMonthQuotations
    .filter((q) => q.status === "Accepted")
    .reduce((sum, q) => sum + (q.amount || 0), 0)
  const previousMonthSentTotal = previousMonthQuotations
    .filter((q) => q.status === "Sent")
    .reduce((sum, q) => sum + (q.amount || 0), 0)
  const previousMonthAcceptedCount = previousMonthQuotations.filter(
    (q) => q.status === "Accepted"
  ).length
  const previousMonthSentCount = previousMonthQuotations.filter(
    (q) => q.status === "Sent"
  ).length

  // Calculate percentage changes
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const revenuePercentChange = calculatePercentChange(
    currentMonthTotal,
    previousMonthTotal
  )
  const totalQuotationsPercentChange = calculatePercentChange(
    currentMonthQuotations.length,
    previousMonthQuotations.length
  )
  const acceptedQuotationsPercentChange = calculatePercentChange(
    currentMonthAcceptedTotal,
    previousMonthAcceptedTotal
  )
  const sentQuotationsPercentChange = calculatePercentChange(
    currentMonthSentTotal,
    previousMonthSentTotal
  )

  const stats: InvoiceStat[] = [
    {
      label: "Total Value",
      value: `$${currentMonthTotal.toLocaleString()}`,
      percent: Number(revenuePercentChange.toFixed(2)),
      trend: revenuePercentChange >= 0 ? "up" : "down",
      subLabel: "this month",
    },
    {
      label: "Total Quotations",
      value: currentMonthQuotations.length.toString(),
      percent: Number(totalQuotationsPercentChange.toFixed(2)),
      trend: totalQuotationsPercentChange >= 0 ? "up" : "down",
      subLabel: "this month",
    },
    {
      label: "Accepted Quotations",
      value: `$${currentMonthAcceptedTotal.toLocaleString()}`,
      count: currentMonthAcceptedCount,
      percent: Number(acceptedQuotationsPercentChange.toFixed(2)),
      trend: acceptedQuotationsPercentChange >= 0 ? "up" : "down",
      subLabel: "this month",
    },
    {
      label: "Sent Quotations",
      value: `$${currentMonthSentTotal.toLocaleString()}`,
      count: currentMonthSentCount,
      percent: Number(sentQuotationsPercentChange.toFixed(2)),
      trend: sentQuotationsPercentChange >= 0 ? "up" : "down",
      subLabel: "this month",
    },
  ]

  // Mark as Accepted
  const handleMarkAccepted = (id: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: "Accepted" } : q
      )
    )
    toast({
      title: "Success",
      description: "Quotation marked as Accepted.",
      variant: "default",
    })
  }

  // Mark as Sent
  const handleMarkSent = (id: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: "Sent" } : q
      )
    )
    toast({
      title: "Success",
      description: "Quotation marked as Sent.",
      variant: "default",
    })
  }

  // Pagination handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Indeterminate state for header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected
    }
  }, [someVisibleSelected])

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quotations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Stats Card */}
      <InvoiceStats
        stats={stats}
        lastUpdated={now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      />

      {/* Toolbar: Search, Refresh, New Quotation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for Quotations ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-96 lg:w-[32rem] border-gray-200"
              disabled={isLoading}
            />
          </span>
          <Button
            onClick={loadQuotations}
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 shadow-none"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate("/create-quotation")}
            className="border border-gray-300 text-white bg-green-800 hover:bg-green-900 shadow-none"
            disabled={isLoading}
          >
            New Quotation
          </Button>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {['All', 'Draft', 'Sent', 'Accepted'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={
                statusFilter === status
                  ? 'bg-green-800 text-white border-green-800'
                  : 'bg-white text-gray-700 border-gray-200'
              }
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status}
            </Button>
          ))}
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
            <span className="text-sm text-slate-500">
              {selectedInvoices.size} selected
            </span>
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
        {/* Table */}
        <div className="overflow-x-auto">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1 font-cal-sans">
                No quotations found
              </h3>
              <p className="text-sm text-gray-500 mb-6 font-cal-sans">
                Please refresh to see your quotations or create a new quotation.
              </p>
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
                      aria-label="Select all quotations on this page"
                      className="mx-auto accent-green-800 h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Number</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Client</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Date</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Valid Until</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Status</TableHead>
                  <TableHead className="px-6 py-4 border-r border-gray-200">Total</TableHead>
                  <TableHead className="px-6 py-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="cursor-pointer">
                {currentItems.map((quotation) => (
                  <TableRow
                    key={quotation.id}
                    className="hover:bg-slate-50 border-b border-gray-200"
                    onClick={e => {
                      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).closest("button")) return;
                      navigate(`/quotation-preview/${quotation.id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell className="w-8 px-4 border-r border-gray-200"></TableCell>
                    <TableCell className="w-[56px] px-6 py-4 align-middle text-center border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.has(quotation.id)}
                        onChange={() => handleSelectInvoice(quotation.id)}
                        aria-label={`Select quotation ${quotation.id}`}
                        className="mx-auto accent-green-800 h-4 w-4 rounded border-gray-300"
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell className="px-6 py-4 border-r border-gray-200">
                      <ClientCell name={quotation.customer.name} email={quotation.customer.email} />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap font-cal-sans font-normal border-r border-gray-200">
                      {formatDate(quotation.date)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap font-cal-sans font-normal border-r border-gray-200">
                      {formatDate(quotation.validUntil)}
                    </TableCell>
                    <TableCell className="px-6 py-4 border-r border-gray-200">
                      {quotation.status === "Accepted" ? (
                        <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-green-200 bg-green-50 text-green-700 text-sm">
                          Accepted
                        </span>
                      ) : quotation.status === "Sent" ? (
                        <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                          Sent
                        </span>
                      ) : quotation.status === "Draft" ? (
                        <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                          Draft
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 font-cal-sans font-normal rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
                          Rejected
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-normal font-cal-sans text-md px-6 py-4 border-r border-gray-200">
                      ${formatCurrency(quotation.amount)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            handleMarkAccepted(quotation.id);
                          }}
                          className="border border-gray-300 text-green-700 bg-white hover:bg-green-50 px-3 shadow-none"
                          size="sm"
                          disabled={quotation.status === "Accepted"}
                        >
                          Mark as Accepted
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            handleMarkSent(quotation.id);
                          }}
                          className="border border-gray-300 text-amber-700 bg-white hover:bg-amber-50 px-3 shadow-none"
                          size="sm"
                          disabled={quotation.status === "Sent"}
                        >
                          Mark as Sent Quote
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
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
          </div>
        )}
      </div>
    </div>
  )
} 