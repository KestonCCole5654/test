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
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCustomerSidebarOpen, setIsCustomerSidebarOpen] = useState(false)
  const [isCustomerLoading, setIsCustomerLoading] = useState(false)

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
      setCustomers(data.customers)
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

      const response = await fetch("https://sheetbills-server.vercel.app/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.provider_token}`,
          "x-supabase-token": session.access_token
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create customer")
      }

      // After successful creation, close the sidebar and refresh the list
      setIsCustomerSidebarOpen(false)
      await fetchCustomers()
      toast({
        title: "Success",
        description: "Customer created successfully.",
      })
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCustomerLoading(false)
    }
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
            <div className="flex items-center gap-2">
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
                onClick={() => setIsCustomerSidebarOpen(true)}
                className="bg-green-800 hover:bg-green-900"
              >
                New Customer
              </Button>
            </div>
          </div>

          <Card>
           
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.company || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/customers/${customer.id}/edit`)}
                              >
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Customer Sidebar */}
      <CustomerSidebar
        isOpen={isCustomerSidebarOpen}
        onClose={() => setIsCustomerSidebarOpen(false)}
        onSubmit={handleCustomerSubmit}
        isLoading={isCustomerLoading}
      />
    </div>
  )
} 