"use client"

import { useState, useEffect } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import { Plus, MoreVertical, Search, Download, Mail, Trash2, Pencil } from "lucide-react"
import { useToast } from "../../components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

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

export default function Quotations() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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

  // Get status color
  const getStatusColor = (status: Quotation["status"]): string => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Load quotations
  useEffect(() => {
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
            amount: 1500.00,
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
            amount: 2750.50,
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

    loadQuotations()
  }, [toast])

  // Filter quotations based on search query
  const filteredQuotations = quotations.filter((quotation) =>
    quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quotation.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quotation.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500">Manage your quotations</p>
        </div>
        <Button
          onClick={() => navigate("/create-quotation")}
          className="bg-green-800 hover:bg-green-900 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quotation
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading quotations...
                </TableCell>
              </TableRow>
            ) : filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                  <TableCell>{formatDate(quotation.date)}</TableCell>
                  <TableCell>{formatDate(quotation.validUntil)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quotation.customer.name}</p>
                      <p className="text-sm text-gray-500">{quotation.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">${formatCurrency(quotation.amount)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/edit-quotation/${quotation.id}`)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(quotation.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 