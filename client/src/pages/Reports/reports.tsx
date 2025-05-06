import React, { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../../components/ui/card"
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Mail, CheckCircle, AlertCircle, Search, Calendar, Download, BarChart3, PieChart, Filter } from 'lucide-react'
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

// Placeholder components for charts and selectors
const DateRangePicker = ({ value, onChange }: any) => (
  <div className="flex items-center border rounded-md px-3 py-1.5 bg-white">
    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
    <Input type="text" placeholder="Date Range" className="border-0 p-0 h-auto focus-visible:ring-0 text-sm" readOnly />
  </div>
)

const Select = ({ value, onChange, options, placeholder }: any) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full appearance-none border rounded-md px-3 py-1.5 pr-8 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <Filter className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
  </div>
)

const ClientSelector = ({ value, onChange, clients }: any) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full appearance-none border rounded-md px-3 py-1.5 pr-8 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="">All Clients</option>
      {clients.map((c: any) => <option key={c.id} value={c.email}>{c.email}</option>)}
    </select>
    <Filter className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
  </div>
)

const BarOrLineChart = ({ data }: any) => (
  <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
    <BarChart3 className="h-8 w-8 text-slate-300" />
  </div>
)

const PieChartComponent = ({ data }: any) => (
  <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
    <PieChart className="h-8 w-8 text-slate-300" />
  </div>
)

// Mock data for clients
const clients = [
  { id: 1, email: "miquel@ucademy.com", status: "Sent" },
  { id: 2, email: "jeff@ucademy.com", status: "Sent" },
  { id: 3, email: "pablo@ucademy.com", status: "Not Sent" },
  { id: 4, email: "pablo.pomareta@ucademy.com", status: "Sent" },
  { id: 5, email: "ramiro@ucademy.com", status: "Sent" },
  { id: 6, email: "patricia.garre@ucademy.com", status: "Sent" },
  { id: 7, email: "facturacion@ucademy.com", status: "Not Sent" },
  { id: 8, email: "tech@ucademy.com", status: "Sent" },
]

// Mock report data per client
const clientReports: Record<string, any> = {
  "miquel@ucademy.com": {
    history: [
      { date: "2024-05-01", action: "Invoice Sent", amount: 1200, status: "Paid" },
      { date: "2024-05-10", action: "Invoice Sent", amount: 800, status: "Overdue" },
    ],
    totalInvoices: 2,
    totalPaid: 1200,
    totalOverdue: 800,
  },
  "jeff@ucademy.com": {
    history: [
      { date: "2024-05-03", action: "Invoice Sent", amount: 500, status: "Paid" },
    ],
    totalInvoices: 1,
    totalPaid: 500,
    totalOverdue: 0,
  },
  // ...add more mock data as needed
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Gmail SVG icon component
const GmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EA4335"/>
  </svg>
)

export default function Reports() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [reportType, setReportType] = useState("invoices")

  const selectedReport = selectedClient ? clientReports[selectedClient] : null
  
  const filteredClients = clients.filter(client => 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Reports Dashboard</h1>
        <p className="text-slate-500">View and analyze client data and financial reports</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Clients</p>
                <h3 className="text-2xl font-bold text-slate-800">{clients.filter(c => c.status === "Active").length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Invoices</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {Object.values(clientReports).reduce((sum, report) => sum + report.totalInvoices, 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Client Table */}
        <div className="w-full lg:w-1/2">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Clients</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search clients..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.email} className="hover:bg-slate-50">
                          <TableCell className="w-12">
                            <GmailIcon />
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">{client.email}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={selectedClient === client.email ? "default" : "outline"}
                              onClick={() => setSelectedClient(client.email)}
                              className={selectedClient === client.email ? "bg-primary text-white" : "text-slate-600"}
                            >
                              View Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                          No clients found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right: Client Report */}
        <div className="w-full lg:w-1/2">
          <Card className="bg-white shadow-sm h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {selectedClient ? `Client Report` : "Client Report"}
                  </CardTitle>
                  {selectedClient && (
                    <CardDescription className="text-slate-500 mt-1">
                      {selectedClient}
                    </CardDescription>
                  )}
                </div>
                
                {selectedReport && (
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-slate-50 border-none shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-slate-500 mb-1">Total Invoices</p>
                        <p className="text-2xl font-bold text-slate-800">{selectedReport.totalInvoices}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-none shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-green-700 mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-green-800">{formatCurrency(selectedReport.totalPaid)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border-none shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-yellow-700 mb-1">Total Overdue</p>
                        <p className="text-2xl font-bold text-yellow-800">{formatCurrency(selectedReport.totalOverdue)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Tabs defaultValue="history" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="history">Transaction History</TabsTrigger>
                      <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="history" className="mt-0">
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead>Date</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedReport.history.map((h: any, idx: number) => (
                              <TableRow key={idx} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                  {format(new Date(h.date), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>{h.action}</TableCell>
                                <TableCell>{formatCurrency(h.amount)}</TableCell>
                                <TableCell>
                                  {h.status === "Paid" ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                      Paid
                                    </Badge>
                                  ) : h.status === "Overdue" ? (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
                                      Overdue
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100">
                                      {h.status}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="charts" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Payment Status</h4>
                          <PieChartComponent data={selectedReport} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Monthly Invoices</h4>
                          <BarOrLineChart data={selectedReport} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No Report Selected</h3>
                  <p className="text-slate-500 max-w-md">
                    Select a client from the list to view their detailed financial report and transaction history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}