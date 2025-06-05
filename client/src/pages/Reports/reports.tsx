"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/use-toast"
import { Loader2, Download, Calendar, AlertCircle, Info } from "lucide-react"
import axios from "axios"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { LoadingSpinner } from "../../components/ui/loadingSpinner"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { addDays, format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { supabase } from '../../lib/supabase'

interface TaxReport {
  totalTax: number
  taxByInvoice: Array<{
    invoiceId: string
    date: string
    customerName: string
    amount: number
    taxAmount: number
    taxRate: number
  }>
  period: {
    start: string
    end: string
  }
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null)
  const [startDate, setStartDate] = useState<string>(format(addDays(new Date(), -30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Selection Required",
        description: "Please select both a start and end date for the report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true)
    setError(null)
    setTaxReport(null)
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        navigate("/sign-in")
        return
      }

      const sheetUrl = localStorage.getItem("defaultSheetUrl")
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }

      const response = await axios.get(
        `https://sheetbills-server.vercel.app/api/sheets/data?sheetUrl=${encodeURIComponent(sheetUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "x-supabase-token": session.access_token,
          },
        }
      )

      const data = response.data
      console.log('API response data:', data)
      if (!Array.isArray(data)) {
        setError('Unexpected API response format. Please contact support.');
        setIsGenerating(false);
        return;
      }
      const filteredInvoices = data.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.date)
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate)
      })

      if (filteredInvoices.length === 0) {
        setError("No invoices found for the selected date range")
        return
      }

      const taxReport: TaxReport = {
        totalTax: 0,
        taxByInvoice: [],
        period: {
          start: startDate,
          end: endDate
        }
      }

      filteredInvoices.forEach((invoice: any) => {
        const taxAmount = invoice.tax?.type === "percentage" 
          ? (invoice.amount * invoice.tax.value) / 100 
          : invoice.tax?.value || 0

        taxReport.totalTax += taxAmount
        taxReport.taxByInvoice.push({
          invoiceId: invoice.invoiceNumber,
          date: invoice.date,
          customerName: invoice.customer.name,
          amount: invoice.amount,
          taxAmount: taxAmount,
          taxRate: invoice.tax?.value || 0
        })
      })

      setTaxReport(taxReport)

    } catch (error: any) {
      console.error("Fetch error:", error)
      setError(error.message || "Failed to generate tax report")
      toast({
        title: "Error",
        description: error.message || "Failed to generate tax report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReport = () => {
    fetchData()
  }

  const handleDownloadCSV = () => {
    if (!taxReport || !startDate || !endDate) return
    
    const headers = [
      "Invoice ID",
      "Date",
      "Customer Name",
      "Amount",
      "Tax Amount",
      "Tax Rate",
    ]
    const rows = taxReport.taxByInvoice.map(invoice => [
      invoice.invoiceId,
      invoice.date,
      invoice.customerName,
      invoice.amount.toFixed(2),
      invoice.taxAmount.toFixed(2),
      `${invoice.taxRate}%`
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-report-${startDate}-to-${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-cal-sans font-medium text-gray-900">Reports</h1>
        <p className="text-gray-600 text-md">Generate and download reports for your business</p>
      </div>

      {/* Tax Report Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
           
            Tax Report
          </CardTitle>
          <CardDescription>
            View and download tax information for your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Range and Actions */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div>
                <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="mt-1.5 font-inter font-light min-w-[160px]"
                  max={endDate}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="mt-1.5 font-inter font-light min-w-[160px]"
                  min={startDate}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 w-full sm:w-auto bg-green-800 hover:bg-green-900 text-white"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
              <Button
                onClick={handleDownloadCSV}
                disabled={!taxReport || isGenerating}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* No Data State */}
          {!taxReport && !isGenerating && !error && (
            <>
              <Alert>
               
                <AlertTitle>No Report Generated</AlertTitle>
                <AlertDescription>
                  Select a date range and click "Generate Report" to view your tax data.
                </AlertDescription>
              </Alert>
              {/* Mockup Example Report */}
              <div className="mt-8">
                <div className="mb-2 text-xs font-semibold text-green-700 uppercase tracking-wide">Example Report (Mock Data)</div>
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Tax Collected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold text-gray-900">$1,234.56</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Period</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium text-gray-900">Jun 1, 2025 - Jul 1, 2025</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Invoices</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold text-gray-900">5</p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Tax Details Table */}
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-001</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2025-06-01</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Acme Corp</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$500.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$50.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10%</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-002</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2025-06-10</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Beta LLC</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$300.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$30.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10%</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-003</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2025-06-15</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Gamma Inc</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$200.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$20.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10%</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-004</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2025-06-20</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Delta Ltd</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$150.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$15.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10%</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-005</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2025-06-25</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Epsilon GmbH</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$84.56</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$8.46</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner />
              <p className="mt-4 text-sm text-gray-600">Generating your tax report...</p>
            </div>
          )}

          {/* Report Content */}
          {taxReport && !isGenerating && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Tax Collected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-gray-900">${taxReport.totalTax.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(taxReport.period.start).toLocaleDateString()} - {new Date(taxReport.period.end).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-gray-900">{taxReport.taxByInvoice.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Details Table */}
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taxReport.taxByInvoice.map((invoice) => (
                        <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${invoice.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${invoice.taxAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.taxRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 