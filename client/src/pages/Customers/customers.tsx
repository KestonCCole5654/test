"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { Plus, Search, MoreHorizontal, Edit, Trash2, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { LoadingSpinner } from "../../components/ui/loadingSpinner"
import { CustomerSidebar } from "../../components/Customers/CustomerSidebar"
import { toast } from "../../components/ui/use-toast"
import supabase from "../../components/Auth/supabaseClient"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
  notes?: string
  created_at: string
  status: "active" | "inactive"
  invoice_counts?: {
    paid: number
    unpaid: number
  }
  logo?: string
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCustomerSidebarOpen, setIsCustomerSidebarOpen] = useState(false)
  const [isCustomerLoading, setIsCustomerLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [sidebarMode, setSidebarMode] = useState<"create" | "edit">("create")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/customers", {
        headers: {
          "Authorization": `Bearer ${session.provider_token}`,
          "x-supabase-token": session.access_token
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }

      const data = await response.json()
      
      // Fetch invoice counts for each customer
      const customersWithCounts = await Promise.all(
        data.customers.map(async (customer: Customer) => {
          try {
            const invoiceResponse = await fetch(
              `https://sheetbills-server.vercel.app/api/invoices/customer/${customer.id}/counts`,
              {
                headers: {
                  "Authorization": `Bearer ${session.provider_token}`,
                  "x-supabase-token": session.access_token
                }
              }
            )

            if (invoiceResponse.ok) {
              const counts = await invoiceResponse.json()
              customer.invoice_counts = counts
            }

            // Fetch company logo using brand fetch
            if (customer.company) {
              try {
                const brandResponse = await fetch(
                  `https://sheetbills-server.vercel.app/api/brand-fetch?domain=${encodeURIComponent(customer.company)}`,
                  {
                    headers: {
                      "Authorization": `Bearer ${session.provider_token}`,
                      "x-supabase-token": session.access_token
                    }
                  }
                )

                if (brandResponse.ok) {
                  const brandData = await brandResponse.json()
                  if (brandData.logo) {
                    customer.logo = brandData.logo
                  }
                }
              } catch (error) {
                console.error("Error fetching brand data:", error)
              }
            }

            return customer
          } catch (error) {
            console.error("Error fetching customer data:", error)
            return customer
          }
        })
      )

      setCustomers(customersWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers")
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCustomerSubmit = async (data: any) => {
    try {
      setIsCustomerLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const url = sidebarMode === "create" 
        ? "https://sheetbills-server.vercel.app/api/customers"
        : `https://sheetbills-server.vercel.app/api/customers/${selectedCustomer?.id}`

      const response = await fetch(url, {
        method: sidebarMode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.provider_token}`,
          "x-supabase-token": session.access_token
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${sidebarMode} customer`)
      }

      // After successful creation/update, close the sidebar and refresh the list
      setIsCustomerSidebarOpen(false)
      setSelectedCustomer(null)
      await fetchCustomers()
      toast({
        title: "Success",
        description: `Customer ${sidebarMode === "create" ? "created" : "updated"} successfully.`,
      })
    } catch (error) {
      console.error(`Error ${sidebarMode}ing customer:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${sidebarMode} customer. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsCustomerLoading(false)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSidebarMode("edit")
    setIsCustomerSidebarOpen(true)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const response = await fetch(`https://sheetbills-server.vercel.app/api/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.provider_token}`,
          "x-supabase-token": session.access_token
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete customer")
      }

      await fetchCustomers()
      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNewCustomer = () => {
    setSelectedCustomer(null)
    setSidebarMode("create")
    setIsCustomerSidebarOpen(true)
  }

  const handleBulkDelete = async () => {
    if (!selectedCustomers.length) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const response = await fetch("https://sheetbills-server.vercel.app/api/customers/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.provider_token}`,
          "x-supabase-token": session.access_token
        },
        body: JSON.stringify({ customerIds: selectedCustomers })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete customers")
      }

      await fetchCustomers()
      setSelectedCustomers([])
      toast({
        title: "Success",
        description: "Selected customers deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting customers:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customers. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const toggleAllCustomers = () => {
    setSelectedCustomers(prev => 
      prev.length === filteredCustomers.length 
        ? [] 
        : filteredCustomers.map(customer => customer.id)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container bg-gray-50/50 max-w-7xl mx-auto px-4">
        <div className="mt-4 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Customers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-Normal text-gray-900">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your customer contacts and information
              </p>
            </div>
            <div className="flex items-center gap-4">
              {selectedCustomers.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedCustomers.length})
                </Button>
              )}
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchCustomers}
                className="flex items-center border"
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={handleNewCustomer}
                className="bg-green-800 hover:bg-green-900"
              >
                New Customer
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === filteredCustomers.length}
                        onChange={toggleAllCustomers}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Paid Invoices</TableHead>
                    <TableHead>Unpaid Invoices</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => toggleCustomerSelection(customer.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          {customer.logo ? (
                            <img 
                              src={customer.logo} 
                              alt={`${customer.name} logo`}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.company || "-"}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            {customer.invoice_counts?.paid || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">
                            {customer.invoice_counts?.unpaid || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
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
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomerSidebar
        isOpen={isCustomerSidebarOpen}
        onClose={() => {
          setIsCustomerSidebarOpen(false)
          setSelectedCustomer(null)
        }}
        onSubmit={handleCustomerSubmit}
        isLoading={isCustomerLoading}
        mode={sidebarMode}
        initialData={selectedCustomer}
      />
    </div>
  )
} 