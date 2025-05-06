import React, { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card"
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"

// Placeholder components for charts and selectors
const DateRangePicker = ({ value, onChange }: any) => (
  <Input type="text" placeholder="Date Range" className="w-36" readOnly />
)
const Select = ({ value, onChange, options }: any) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="border rounded px-2 py-1">
    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
  </select>
)
const ClientSelector = ({ value, onChange, clients }: any) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="border rounded px-2 py-1">
    <option value="">All Clients</option>
    {clients.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
  </select>
)
const BarOrLineChart = ({ data }: any) => (
  <div className="h-40 flex items-center justify-center bg-slate-100 rounded">[Bar/Line Chart]</div>
)
const PieChart = ({ data }: any) => (
  <div className="h-40 flex items-center justify-center bg-slate-100 rounded">[Pie Chart]</div>
)

// Mock data for clients
const clients = [
  { id: 1, email: "miquel@ucademy.com", status: "Active" },
  { id: 2, email: "jeff@ucademy.com", status: "Active" },
  { id: 3, email: "pablo@ucademy.com", status: "Inactive" },
  { id: 4, email: "pablo.pomareta@ucademy.com", status: "Active" },
  { id: 5, email: "ramiro@ucademy.com", status: "Active" },
  { id: 6, email: "patricia.garre@ucademy.com", status: "Active" },
  { id: 7, email: "facturacion@ucademy.com", status: "Inactive" },
  { id: 8, email: "tech@ucademy.com", status: "Active" },
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

export default function Reports() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

  const selectedReport = selectedClient ? clientReports[selectedClient] : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Client Table */}
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">Clients</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.email}>
                      <TableCell className="w-8">
                        <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">{client.email}</TableCell>
                      <TableCell>
                        {client.status === "Active" ? (
                          <span className="inline-flex items-center bg-green-100 text-green-800 rounded px-2 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded px-2 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedClient(client.email)}
                        >
                          Generate Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {/* Right: Client Report */}
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                {selectedClient ? `Report for ${selectedClient}` : "Select a client to view report"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedReport ? (
                <div className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    <div className="bg-green-50 rounded p-3 flex-1 min-w-[120px]">
                      <div className="text-xs text-slate-500">Total Invoices Sent</div>
                      <div className="text-lg font-bold">{selectedReport.totalInvoices}</div>
                    </div>
                    <div className="bg-green-50 rounded p-3 flex-1 min-w-[120px]">
                      <div className="text-xs text-slate-500">Total Paid</div>
                      <div className="text-lg font-bold">{formatCurrency(selectedReport.totalPaid)}</div>
                    </div>
                    <div className="bg-yellow-50 rounded p-3 flex-1 min-w-[120px]">
                      <div className="text-xs text-slate-500">Total Overdue</div>
                      <div className="text-lg font-bold">{formatCurrency(selectedReport.totalOverdue)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2">Client History</div>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedReport.history.map((h: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{h.date}</TableCell>
                            <TableCell>{h.action}</TableCell>
                            <TableCell>{formatCurrency(h.amount)}</TableCell>
                            <TableCell>
                              {h.status === "Paid" ? (
                                <span className="bg-green-100 text-green-800 rounded px-2 text-xs">Paid</span>
                              ) : h.status === "Overdue" ? (
                                <span className="bg-yellow-100 text-yellow-800 rounded px-2 text-xs">Overdue</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-800 rounded px-2 text-xs">{h.status}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No report selected.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 