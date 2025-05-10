"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Download, Printer, ArrowLeft } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "../../components/ui/use-toast"
import supabase from "../../components/Auth/supabaseClient"

// Invoice interface
interface Invoice {
  id: string
  date: string
  dueDate: string
  amount: number
  paidAmount?: number
  lastPaymentDate?: string
  customer: {
    name: string
    email: string
    address: string
  }
  items: {
    description: string
    quantity: number
    price: number
  }[]
  tax: {
    type: "fixed" | "percentage"
    value: number
  }
  discount: {
    type: "fixed" | "percentage"
    value: number
  }
  notes: string
  template: "modern" | "classic" | "minimal"
  status: "Paid" | "Pending" | "Partially Paid"
}

interface BusinessData {
  companyName: string
  phone: string
  address: string
  email: string
  logo?: string
}

export default function InvoiceViewer() {
  const { invoiceId, token } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch invoice data using the token
    fetchInvoice()
  }, [invoiceId, token])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!invoiceId || !token) {
        setError("Invalid invoice link")
        setLoading(false)
        return
      }

      // Fetch the invoice data from the server
      const response = await fetch(`/api/invoices/shared/${invoiceId}?token=${token}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch invoice")
      }
      
      const data = await response.json()
      
      if (data.invoice) {
        setInvoice(data.invoice)
        setBusinessData(data.businessData || {
          companyName: "",
          phone: "",
          address: "",
          email: "",
        })
      } else {
        setError("Invoice not found")
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
      setError("Failed to load invoice. The link may be invalid or expired.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return
    
    try {
      // Create a temporary div to render the invoice without buttons
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = previewRef.current.innerHTML
      document.body.appendChild(tempDiv)
      
      // Apply print styles
      tempDiv.style.width = "210mm" // A4 width
      tempDiv.style.padding = "10mm"
      tempDiv.style.backgroundColor = "white"
      
      // Hide any no-print elements
      const noPrintElements = tempDiv.querySelectorAll(".no-print")
      noPrintElements.forEach((el) => {
        ;(el as HTMLElement).style.display = "none"
      })
      
      // Capture the canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })
      
      // Remove the temporary div
      document.body.removeChild(tempDiv)
      
      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      
      // Save the PDF
      pdf.save(`Invoice-${invoice?.id}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      case "Partially Paid":
        return "bg-blue-50 text-blue-700 hover:bg-blue-50"
      default:
        return "bg-amber-50 text-amber-700 hover:bg-amber-50"
    }
  }

  // Calculate subtotal, tax, discount, and total
  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, totalTax: 0, totalDiscount: 0, total: 0 }
    
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    
    let totalTax = 0
    if (invoice.tax) {
      totalTax = invoice.tax.type === "percentage" 
        ? subtotal * (invoice.tax.value / 100) 
        : invoice.tax.value
    }
    
    let totalDiscount = 0
    if (invoice.discount) {
      totalDiscount = invoice.discount.type === "percentage" 
        ? subtotal * (invoice.discount.value / 100) 
        : invoice.discount.value
    }
    
    const total = subtotal + totalTax - totalDiscount
    
    return { subtotal, totalTax, totalDiscount, total }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.close()}
            className="w-full"
          >
            Close Window
          </Button>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">No Invoice Data</h1>
          <p className="text-gray-600 mb-6">We couldn't find the requested invoice.</p>
          <Button 
            variant="outline" 
            onClick={() => window.close()}
            className="w-full"
          >
            Close Window
          </Button>
        </div>
      </div>
    )
  }

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals()

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center no-print">
          <h1 className="text-2xl font-bold">Invoice #{invoice.id}</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        
        {/* Invoice Preview */}
        <Card className="shadow-md">
          <CardContent className="p-6" ref={previewRef}>
            <div className="flex flex-col gap-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                  <div className="mt-2 text-gray-600">
                    <p className="font-medium">{businessData.companyName}</p>
                    <p>{businessData.address}</p>
                    <p>{businessData.email}</p>
                    <p>{businessData.phone}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900">Invoice #{invoice.id}</div>
                  <div className="mt-2 text-gray-600">
                    <p><span className="font-medium">Date:</span> {formatDate(invoice.date)}</p>
                    <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
                    <Badge className={`mt-2 ${getStatusBadgeClass(invoice.status)} text-md px-4 py-1`}>
                      {invoice.status}
                      {invoice.status === "Partially Paid" && invoice.paidAmount && (
                        <span className="ml-2 text-sm">({formatCurrency(invoice.paidAmount)})</span>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="border-t border-b py-4">
                <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
                <div className="text-gray-600">
                  <p className="font-medium">{invoice.customer.name}</p>
                  <p>{invoice.customer.address}</p>
                  <p>{invoice.customer.email}</p>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-semibold">Description</th>
                      <th className="text-right py-2 px-4 font-semibold">Quantity</th>
                      <th className="text-right py-2 px-4 font-semibold">Price</th>
                      <th className="text-right py-2 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 px-4">{item.description}</td>
                        <td className="py-2 px-4 text-right">{item.quantity}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {invoice.discount && invoice.discount.value > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Discount:</span>
                      <span>
                        {invoice.discount.type === "percentage" 
                          ? `${invoice.discount.value}%` 
                          : formatCurrency(invoice.discount.value)}
                      </span>
                    </div>
                  )}
                  
                  {invoice.tax && invoice.tax.value > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Tax:</span>
                      <span>
                        {invoice.tax.type === "percentage" 
                          ? `${invoice.tax.value}%` 
                          : formatCurrency(invoice.tax.value)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  {invoice.status === "Partially Paid" && invoice.paidAmount && (
                    <>
                      <div className="flex justify-between py-2 text-green-600">
                        <span className="font-medium">Paid:</span>
                        <span>{formatCurrency(invoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-red-600">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(total - invoice.paidAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              {invoice.notes && (
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold mb-2">Notes:</h2>
                  <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer with company info */}
        <div className="text-center text-gray-500 text-sm mt-8 no-print">
          <p>This invoice was generated by {businessData.companyName}</p>
          <p>{businessData.email} | {businessData.phone}</p>
        </div>
      </div>
    </div>
  )
}
