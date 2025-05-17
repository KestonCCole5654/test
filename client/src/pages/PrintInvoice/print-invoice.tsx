"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import InvoiceClassic from "../../components/InvoiceClassic"
import supabase from "../../components/Auth/supabaseClient"
import axios from "axios"
import { useToast } from "../../components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

// Import the same interfaces from create-invoice
import { InvoiceData, BusinessData } from "../CreateInvoices/create-invoice"

export default function PrintInvoice() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // State for invoice and business data
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch invoice data when component mounts
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.provider_token) {
          throw new Error("Authentication required")
        }

        // Get the spreadsheet URL from localStorage
        const sheetUrl = localStorage.getItem("defaultSheetUrl")
        if (!sheetUrl) {
          throw new Error("No spreadsheet selected")
        }

        // Fetch the invoice data
        const response = await axios.get(
          `https://sheetbills-server.vercel.app/api/invoices/${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              "X-Supabase-Token": session.access_token,
            },
            params: {
              sheetUrl: sheetUrl
            }
          }
        )

        if (!response.data.invoice) {
          throw new Error("Invoice not found")
        }

        // Set the invoice data
        setInvoiceData(response.data.invoice)

        // Fetch business details
        const businessResponse = await axios.get(
          "https://sheetbills-server.vercel.app/api/business-details",
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              "X-Supabase-Token": session.access_token,
            },
            params: {
              sheetUrl: sheetUrl
            }
          }
        )

        if (businessResponse.data.businessDetails) {
          setBusinessData({
            companyName: businessResponse.data.businessDetails["Company Name"] || "",
            email: businessResponse.data.businessDetails["Business Email"] || "",
            phone: businessResponse.data.businessDetails["Phone Number"] || "",
            address: businessResponse.data.businessDetails["Address"] || "",
            logo: businessResponse.data.businessDetails["Logo"] || "",
          })
        }

      } catch (err) {
        console.error("Error fetching invoice:", err)
        setError(err instanceof Error ? err.message : "Failed to load invoice")
        toast({
          title: "Error",
          description: "Failed to load invoice. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (invoiceId) {
      fetchInvoiceData()
    }
  }, [invoiceId, toast])

  // Handle print action
  const handlePrint = () => {
    window.print()
  }

  // Handle back navigation
  const handleBack = () => {
    navigate(-1)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !invoiceData || !businessData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Failed to load invoice"}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white">
        {/* Print-friendly header - only visible when not printing */}
        <div className="print:hidden bg-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handlePrint} variant="default" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
        {/* Invoice content - visible both on screen and when printing */}
        <div className="print:p-0 max-w-4xl mx-auto p-4 invoice-content">
          <div className="bg-white print:shadow-none">
            <InvoiceClassic
              data={invoiceData}
              businessData={businessData}
              showShadow={false}
            />
          </div>
        </div>
        {/* Footer - hide when printing */}
        <footer className="w-full font-inter text-center text-md text-gray-400 mt-10 mb-2 print:hidden">
          Powered by <span className="font-inter font-medium text-green-800">SheetBills™</span>
        </footer>
      </div>
      <style>{`
        @media print {
          .invoice-content, .bg-white {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .invoice-content {
            page-break-after: avoid;
            page-break-before: avoid;
          }
        }
      `}</style>
    </>
  )
}