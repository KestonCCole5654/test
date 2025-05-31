"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, RefreshCw, GripVertical, X, Mail, Users, CheckCircle2, XCircle } from "lucide-react"
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
import { Checkbox } from "../../components/ui/checkbox"
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
import { InvoiceStats } from "../../components/ui/InvoiceStats"

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
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState<string | null>(null)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

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
    if (!selectedCustomers.length) return;

    try {
      setIsDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      console.log("Attempting to delete customers:", selectedCustomers);

      const response = await fetch("https://sheetbills-server.vercel.app/api/customers/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.provider_token}`,
          "x-supabase-token": session?.access_token || "",
        },
        body: JSON.stringify({ customerIds: selectedCustomers })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to delete customers");
      }

      await fetchCustomers();
      setSelectedCustomers([]);
      setIsBulkDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: data.message || "Selected customers deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
       

          <InvoiceStats
            stats={[
              {
                label: "Total Customers",
                value: customers.length.toString(),
                percent: 0,
                trend: "neutral",
                subLabel: "all time"
              },
              {
                label: "Paid Customers",
                value: customers.filter(c => (c.invoice_counts?.paid || 0) > 0).length.toString(),
                percent: 0,
                trend: "neutral",
                subLabel: "all time"
              },
              {
                label: "Unpaid Customers",
                value: customers.filter(c => (c.invoice_counts?.unpaid || 0) > 0).length.toString(),
                percent: 0,
                trend: "neutral",
                subLabel: "all time"
              }
            ]}
            lastUpdated={new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />

<div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-Normal text-gray-900">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your customer contacts and information in one place.
              </p>
            </div>
            <div className="flex items-center gap-4">
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
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 shadow-none"
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
              <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg mb-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllCustomers}
                    className="text-white"
                    disabled={filteredCustomers.length === 0}
                  >
                    {selectedCustomers.length === filteredCustomers.length ? "Deselect All" : "Select All"}
                  </Button>
                  <span className="text-sm text-slate-500">
                    {selectedCustomers.length} selected
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  disabled={selectedCustomers.length === 0 || isDeleting}
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

              {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1 font-cal-sans">
                    No customers found
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 font-cal-sans">
                    Please refresh to see your customers or create a new customer.
                  </p>
                </div>
              ) : (
                <Table className="min-w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-[56px] px-6 py-4 align-middle text-center border-r border-gray-200">
                        <input
                          type="checkbox"
                          ref={headerCheckboxRef}
                          checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                          onChange={toggleAllCustomers}
                          aria-label="Select all customers on this page"
                          className="mx-auto accent-green-800 h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="px-6 py-4 border-r border-gray-200">Name</TableHead>
                      <TableHead className="px-6 py-4 border-r border-gray-200">Phone</TableHead>
                      <TableHead className="px-6 py-4 border-r border-gray-200">Paid Invoices</TableHead>
                      <TableHead className="px-6 py-4 border-r border-gray-200">Unpaid Invoices</TableHead>
                      <TableHead className="px-6 py-4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id}
                        className="hover:bg-slate-50 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <TableCell className="w-[56px] px-6 py-4 align-middle text-center border-r border-gray-200">
                          <div className="flex items-center justify-center h-full min-h-[40px]">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => toggleCustomerSelection(customer.id)}
                              aria-label={`Select customer ${customer.id}`}
                              className="mx-auto"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-gray-200">
                          <div className="flex items-center gap-3">
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
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{customer.name}</span>
                              <span className="text-sm text-gray-500">{customer.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-gray-200">{customer.phone || "-"}</TableCell>
                        <TableCell className="px-6 py-4 border-r border-gray-200">
                          <span className="text-green-600 font-medium">
                            {customer.invoice_counts?.paid || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-gray-200">
                          <span className="text-red-600 font-medium">
                            {customer.invoice_counts?.unpaid || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditCustomer(customer)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4 text-white" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                // TODO: Implement send message functionality
                                toast({
                                  title: "Coming Soon",
                                  description: "Message functionality will be available soon.",
                                })
                              }}
                              className="h-8 w-8"
                            >
                              <Mail className="h-4 w-4 text-white" />
                            </Button>
                          </div>
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

      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-cal-sans font-medium">
              Are you sure you want to delete these customers?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-cal-sans text-gray-700">
              This action cannot be undone. This will permanently delete{" "}
              {selectedCustomers.length} selected customer(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-cal-sans">
              Cancel
            </AlertDialogCancel>
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