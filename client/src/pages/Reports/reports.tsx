"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/use-toast"
import { Loader2, Download, Calendar } from "lucide-react"
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
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { DateRangePicker } from "../../components/ui/date-range-picker"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"
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
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date()
  })

  const fetchData = async () => {
    if (!dateRange.from || !dateRange.to) return;
    
    setIsGenerating(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        navigate("/sign-in")
        return
      }

      // Configure headers with both tokens
      const headers = {
        Authorization: `Bearer ${session.provider_token}`,
        'X-Supabase-Token': session.access_token
      }

      // Get the current sheet URL from localStorage
      const sheetUrl = localStorage.getItem("defaultSheetUrl")
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sheets/data?sheetUrl=${encodeURIComponent(sheetUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "x-supabase-token": session.access_token,
          },
        }
      )

      const data = response.data
      const filteredInvoices = data.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.date)
        return invoiceDate >= dateRange.from! && invoiceDate <= dateRange.to!
      })

      const taxReport: TaxReport = {
        totalTax: 0,
        taxByInvoice: [],
        period: {
          start: dateRange.from.toISOString(),
          end: dateRange.to.toISOString()
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

    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to generate tax report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const handleDownloadCSV = () => {
    if (!taxReport || !dateRange.from || !dateRange.to) return;
    
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
    a.download = `tax-report-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col justify-center items-center gap-4">
          <LoadingSpinner />
        </div>
      </div>
    )
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download reports for your business</p>
      </div>

      {/* Tax Report Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tax Report</h2>
            <p className="text-gray-600">View and download tax information for your invoices</p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <Button
              onClick={handleDownloadCSV}
              disabled={!taxReport || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>

        {taxReport && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Tax Collected</p>
                  <p className="text-2xl font-semibold">${taxReport.totalTax.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="text-lg">
                    {new Date(taxReport.period.start).toLocaleDateString()} - {new Date(taxReport.period.end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoices</p>
                  <p className="text-2xl font-semibold">{taxReport.taxByInvoice.length}</p>
                </div>
              </div>
            </div>

            {/* Tax Details Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                    <tr key={invoice.invoiceId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoiceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.taxAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.taxRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 