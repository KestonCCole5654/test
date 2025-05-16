"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
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

export default function EmailInvoice() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [customerEmail, setCustomerEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [invoiceLink, setInvoiceLink] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch invoice and generate link
  useEffect(() => {
    const fetchInvoiceAndLink = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.provider_token) throw new Error("Google authentication required")
        // Get sheetUrl
        const sheetUrl = localStorage.getItem("defaultSheetUrl")
        if (!sheetUrl) throw new Error("No spreadsheet selected")
        // Fetch invoice data
        const response = await axios.get(
          `https://sheetbills-server.vercel.app/api/invoices/${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              "X-Supabase-Token": session.access_token,
            },
            params: { sheetUrl }
          }
        )
        const invoice = response.data.invoice
        setCustomerEmail(invoice.customer?.email || "")
        setCustomerName(invoice.customer?.name || "")
        // Generate shareable link
        const linkResponse = await axios.post(
          "https://sheetbills-server.vercel.app/api/invoices/shared/create-link",
          {
            invoiceId,
            sheetUrl
          },
          {
            headers: {
              "X-Supabase-Token": session.access_token,
              Authorization: `Bearer ${session.provider_token}`,
            },
          }
        )
        setInvoiceLink(linkResponse.data.shareUrl)
        // Prefill subject and body
        const subj = `Invoice ${invoice.invoiceNumber} from SheetBills`
        setSubject(subj)
        setBody(
          `Dear ${invoice.customer?.name || "Customer"},\n\n` +
          `Please find your invoice at the following link:\n${linkResponse.data.shareUrl}\n\n` +
          `Invoice Number: ${invoice.invoiceNumber}\n` +
          `Invoice Date: ${invoice.date}\n` +
          `Due Date: ${invoice.dueDate}\n` +
          `Amount: $${invoice.amount}\n\n` +
          `If you have any questions, please let us know.\n\nThank you for your business!`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load invoice.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    if (invoiceId) fetchInvoiceAndLink()
  }, [invoiceId, toast])

  // Open Gmail compose with prefilled fields
  const handleSend = () => {
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting Email Ready ...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full flex justify-center bg-white border-b mb-8 py-4 px-4 sm:px-8">
        <div className="max-w-5xl w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Invoices</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-medium mb-6">Send Invoice Email</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[120px]"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Invoice Link</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 font-mono bg-gray-50"
            value={invoiceLink}
            readOnly
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSend} variant="default">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>
      <footer className="w-full font-inter  text-center text-md text-gray-400 mt-10 mb-2">
        Powered by <span className=" font-inter font-medium text-green-800">SheetBills™</span>
      </footer>
    </div>
  )
} 