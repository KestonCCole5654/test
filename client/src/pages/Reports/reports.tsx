import React, { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card"
import { Table, TableHead, TableRow, TableCell, TableBody } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { format } from "date-fns"
import { Link } from "react-router-dom"

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

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Mock data
const clientList = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Globex" },
  { id: 3, name: "Wayne Enterprises" },
]
const summary = {
  totalInvoices: 42,
  totalRevenue: 12800,
  avgPaymentTime: 12,
  dueThisMonth: 5,
  overdueCount: 2,
}
const monthlyTrendsData: any[] = []
const statusBreakdownData: any[] = []
const filteredInvoices = [
  { clientName: "Acme Corp", invoiceNumber: "INV-001", amount: 1200, sentDate: "2024-05-01", dueDate: "2024-05-15", paidDate: "2024-05-10", status: "Paid" },
  { clientName: "Globex", invoiceNumber: "INV-002", amount: 800, sentDate: "2024-05-03", dueDate: "2024-05-17", paidDate: null, status: "Unpaid" },
]
const clientHistory = [
  { id: 1, name: "Acme Corp", invoiceCount: 10, totalPaid: 8000, totalOutstanding: 200, lastPaymentDate: "2024-05-10" },
  { id: 2, name: "Globex", invoiceCount: 5, totalPaid: 2000, totalOutstanding: 800, lastPaymentDate: null },
]
const emailLogs = [
  { id: 1, date: "2024-05-01", clientName: "Acme Corp", invoiceNumber: "INV-001", type: "Invoice Sent", status: "Sent" },
  { id: 2, date: "2024-05-03", clientName: "Globex", invoiceNumber: "INV-002", type: "Reminder", status: "Sent" },
]

export default function Reports() {
  const [dateRange, setDateRange] = useState("")
  const [status, setStatus] = useState("All")
  const [client, setClient] = useState("")

  // Export handler (placeholder)
  const handleExport = () => {
    alert("Export functionality coming soon!")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex flex-wrap gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Select value={status} onChange={setStatus} options={["All", "Paid", "Unpaid", "Overdue"]} />
          <ClientSelector value={client} onChange={setClient} clients={clientList} />
          <Button onClick={handleExport} variant="outline">Export CSV/PDF</Button>
        </div>
      </div>

      {/* Key Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">Total Invoices Sent</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xl font-bold">{summary.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">Total Revenue Received</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">Avg. Payment Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xl font-bold">{summary.avgPaymentTime} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">Due This Month</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xl font-bold">{summary.dueThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xl font-bold">{summary.overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-1">Monthly Invoice Trends</CardHeader>
          <CardContent className="pt-0"><BarOrLineChart data={monthlyTrendsData} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">Status Breakdown</CardHeader>
          <CardContent className="pt-0"><PieChart data={statusBreakdownData} /></CardContent>
        </Card>
      </div>

      {/* Payment Timeline Table */}
      <Card className="mb-8">
        <CardHeader className="pb-1">Payment Timeline</CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Sent Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Paid Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map(inv => (
                <TableRow key={inv.invoiceNumber}>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>{inv.sentDate}</TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                  <TableCell>{inv.paidDate || "-"}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client History Section */}
      <Card className="mb-8">
        <CardHeader className="pb-1">Client History</CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Invoices</TableCell>
                <TableCell>Total Paid</TableCell>
                <TableCell>Total Outstanding</TableCell>
                <TableCell>Last Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientHistory.map(client => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.invoiceCount}</TableCell>
                  <TableCell>{formatCurrency(client.totalPaid)}</TableCell>
                  <TableCell>{formatCurrency(client.totalOutstanding)}</TableCell>
                  <TableCell>{client.lastPaymentDate || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Communication Log */}
      <Card>
        <CardHeader className="pb-1">Communication Log</CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.clientName}</TableCell>
                  <TableCell>{log.invoiceNumber}</TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>
                    <span className={log.status === 'Sent' ? 'text-green-700' : 'text-yellow-700'}>
                      {log.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 