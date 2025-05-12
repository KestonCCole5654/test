"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Trash2, Plus, Download, ChevronDown, ArrowLeft, CheckCircle, Clock, Mail } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Collapsible, CollapsibleContent } from "../../components/ui/collapsible"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import supabase from "../../components/Auth/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../components/ui/use-toast"


export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customer: Customer

  items: InvoiceItem[]
  amount: number
  notes: string
  template: "classic"
  status?: "Paid" | "Pending"
}

export interface InvoiceItem {
  name: string
  description: string
  quantity: number
  price: number | string
  discount: {
    type: "percentage" | "fixed"
    value: number | string
  }
  tax: {
    type: "percentage" | "fixed"
    value: number | string
  }
}

export interface Customer {
  name: string
  email: string
  address: string
}

export interface BusinessData {
  companyName: string
  phone: string
  address: string
  email: string
  logo?: string
}

export default function InvoiceForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const invoiceToEdit = location.state?.invoiceToEdit
  const selectedSpreadsheetUrl = location.state?.selectedSpreadsheetUrl
  const key = location.state?.key
  const hideForm = location.state?.hideForm
  
  console.log('InvoiceForm mounted with state:', { invoiceToEdit, selectedSpreadsheetUrl, key, hideForm })
  
  // Add useEffect to handle state changes
  useEffect(() => {
    console.log('InvoiceForm mounted with key:', key)
    // Reset form state when key changes
    if (key) {
      setIsFormExpanded(true)
      setInvoiceData({
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        customer: {
          name: "",
          email: "",
          address: "",
        },
        items: [{
          name: "",
          description: "",
          quantity: 1,
          price: "",
          discount: {
            type: "percentage",
            value: ""
          },
          tax: {
            type: "percentage",
            value: ""
          }
        }],
        amount: 0,
        notes: "",
        template: "classic",
        status: "Pending"
      })
    }
    return () => {
      console.log('InvoiceForm unmounted')
    }
  }, [key])

  const [isFormExpanded, setIsFormExpanded] = useState(!location.state?.hideForm)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber:
      invoiceToEdit?.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    date: invoiceToEdit?.date || new Date().toISOString().split("T")[0],
    dueDate: invoiceToEdit?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    customer: invoiceToEdit?.customer || {
      name: "",
      email: "",
      address: "",
    },
    items: invoiceToEdit?.items || [{
      name: "",
      description: "",
      quantity: 1,
      price: "",
      discount: {
        type: "percentage",
        value: ""
      },
      tax: {
        type: "percentage",
        value: ""
      }
    }],
    amount: invoiceToEdit?.amount || 0,
    notes: invoiceToEdit?.notes || "",
    template: invoiceToEdit?.template || "classic",
    status: invoiceToEdit?.status || "Pending"
  })
  const previewRef = useRef<HTMLDivElement>(null)

  // Used to update invoice Data
  const updateInvoiceData = (field: string, value: any) => {
    setInvoiceData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof InvoiceData] as any),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })
  }
  // Used to update Invoice Items
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceData.items]
    if (field === "price" && value === "") {
      updatedItems[index] = { ...updatedItems[index], [field]: "" }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }
    updateInvoiceData("items", updatedItems)
  }
  // Used to Add Items
  const addItem = () => {
    updateInvoiceData("items", [...invoiceData.items, {
      name: "",
      description: "",
      quantity: 1,
      price: "",
      discount: {
        type: "percentage",
        value: ""
      },
      tax: {
        type: "percentage",
        value: ""
      }
    }])
  }
  // Used to Remove Items
  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = [...invoiceData.items]
      updatedItems.splice(index, 1)
      updateInvoiceData("items", updatedItems)
    }
  }
  // Used to calculate total
  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => {
      const price = item.price === "" ? 0 : Number(item.price)
      const itemTotal = item.quantity * price

      // Calculate item discount
      let itemDiscount = 0
      if (item.discount.value && item.discount.value !== "") {
        if (item.discount.type === "percentage") {
          itemDiscount = (itemTotal * Number(item.discount.value)) / 100
        } else {
          itemDiscount = Math.min(itemTotal, Number(item.discount.value))
        }
      }

      // Calculate item tax
      let itemTax = 0
      if (item.tax.value && item.tax.value !== "") {
        const afterDiscount = itemTotal - itemDiscount
        if (item.tax.type === "percentage") {
          itemTax = (afterDiscount * Number(item.tax.value)) / 100
        } else {
          itemTax = Number(item.tax.value)
        }
      }

      return total + itemTotal - itemDiscount + itemTax
    }, 0)
  }

  // Fix the formatCurrency function - it has typos in the property names
  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleUpdate = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        alert("Google authentication required")
        return
      }

      // Get the SheetBills Invoices sheet URL
      const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      const invoicesSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Invoices")
      if (!invoicesSheet) {
        throw new Error("SheetBills Invoices sheet not found")
      }

      // Calculate totals for the invoice
      const subtotal = calculateTotal()
      const total = calculateTotal()

      // Get the original invoice ID
      const originalInvoiceId = invoiceToEdit.id || invoiceToEdit.invoiceNumber

      // Prepare the update request
      const updateResponse = await axios.post(
        "https://sheetbills-server.vercel.app/api/update-invoice",
        {
          accessToken: session.provider_token,
          invoiceData: {
            ...invoiceData,
            id: originalInvoiceId, // Ensure we're using the original ID
            invoiceNumber: originalInvoiceId, // Use the same ID for invoiceNumber
            amount: total,
            status: invoiceToEdit.status
          },
          invoiceId: originalInvoiceId, // Use the same ID here
          sheetUrl: invoicesSheet.sheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (updateResponse.data.success) {
        setShowSuccessModal(true)
        // Navigate back to dashboard after successful update
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        alert("Failed to update invoice")
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      alert("Failed to update invoice. Check console for details.")
    }
  }

  const handleSave = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        alert("Google authentication required")
        return
      }

      // Get the SheetBills Invoices sheet URL
      const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      const invoicesSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Invoices")
      if (!invoicesSheet) {
        throw new Error("SheetBills Invoices sheet not found")
      }

      // Calculate totals for the invoice
      const subtotal = calculateTotal()
      const total = calculateTotal()

      // Prepare the save request
      const saveResponse = await axios.post(
        "https://sheetbills-server.vercel.app/api/saveInvoice",
        {
          accessToken: session.provider_token,
          invoiceData: {
            ...invoiceData,
            amount: total,
            status: 'Pending'
          },
          sheetUrl: invoicesSheet.sheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (saveResponse.data.success) {
        setShowSuccessModal(true)
        // Navigate back to dashboard after successful save
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        alert("Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Failed to save invoice. Check console for details.")
    }
  }

  const handleDownloadPDF = async () => {
    // Use the helper function with forEmail=false
    await generateAndSavePDF(false)
  }

  // Function to handle sending email to client using Gmail
  const handleEmailInvoice = async () => {
    if (!previewRef.current || !invoiceData.customer.email) {
      toast({
        title: "Error",
        description: "Customer email is required to send the invoice.",
        variant: "destructive",
      })
      return
    }

    // First, show a loading toast
    toast({
      title: "Preparing Email",
      description: "Generating shareable invoice link...",
      variant: "default"
    })

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(sessionError.message)
      }
      
      if (!session) {
        throw new Error("No active session")
      }
      
      // Create a shareable link for the invoice
      const response = await fetch("https://sheetbills-server.vercel.app/api/invoices/shared/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Supabase-Token": session.access_token || "",
        },
        body: JSON.stringify({
          invoiceId: invoiceData.invoiceNumber,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create shareable link")
      }
      
      const { shareUrl, expiresAt } = await response.json()
      
      // Format expiration date
      const expirationDate = new Date(expiresAt)
      const formattedExpirationDate = expirationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      // Create a subject line for the email
      const subject = `Invoice ${invoiceData.invoiceNumber} from ${businessData.companyName}`
      
      // Create email body with invoice details and shareable link
      const body = `Dear ${invoiceData.customer.name},

Please find your invoice ${invoiceData.invoiceNumber} for the amount of ${formatCurrency(invoiceData.amount)}.

You can view and download your invoice by clicking the link below:
${shareUrl}

Invoice Details:
- Invoice Number: ${invoiceData.invoiceNumber}
- Invoice Date: ${formatDate(invoiceData.date)}
- Due Date: ${formatDate(invoiceData.dueDate)}
- Amount: ${formatCurrency(invoiceData.amount)}

This link will expire on ${formattedExpirationDate}.

If you have any questions, please don't hesitate to contact us.

Thank you for your business.

Regards,
${businessData.companyName}
${businessData.email}
${businessData.phone}`
      
      // Open Gmail compose in a new window with prefilled fields
      const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(invoiceData.customer.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      // Open Gmail in a new window
      window.open(mailtoLink, '_blank')
      
      // Show success toast
      toast({
        title: "Email Ready",
        description: "Gmail has been opened with a shareable invoice link included in the email.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error preparing email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to prepare email. Please try again.",
        variant: "destructive",
      })
      
      // Fallback to the PDF attachment method if creating a shareable link fails
      try {
        await generateAndSavePDF(true)
        
        // Create a subject line for the email
        const subject = `Invoice ${invoiceData.invoiceNumber} from ${businessData.companyName}`
        
        // Create email body with invoice details
        const body = `Dear ${invoiceData.customer.name},

Please find attached invoice ${invoiceData.invoiceNumber} for the amount of ${formatCurrency(invoiceData.amount)}.

Invoice Date: ${formatDate(invoiceData.date)}
Due Date: ${formatDate(invoiceData.dueDate)}

If you have any questions, please don't hesitate to contact us.

Thank you for your business.

Regards,
${businessData.companyName}
${businessData.email}
${businessData.phone}`
        
        // Open Gmail compose in a new window with prefilled fields
        const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(invoiceData.customer.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        
        // Open Gmail in a new window
        window.open(mailtoLink, '_blank')
        
        // Show fallback toast
        toast({
          title: "Email Ready (Fallback Mode)",
          description: "Gmail has been opened. Please attach the downloaded invoice PDF to complete your email.",
          variant: "default",
        })
      } catch (fallbackError) {
        console.error("Error in fallback email method:", fallbackError)
        toast({
          title: "Error",
          description: "All email methods failed. Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  // Helper function to generate and save PDF
  const generateAndSavePDF = async (forEmail = false) => {
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
        scale: 2,
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
      
      // Save the PDF with a clear filename that indicates it's for email attachment
      const filename = forEmail 
        ? `Invoice-${invoiceData.invoiceNumber}-for-${invoiceData.customer.name.replace(/\s+/g, "-")}.pdf`
        : `Invoice-${invoiceData.invoiceNumber}.pdf`
      
      pdf.save(filename)
      
      if (forEmail) {
        toast({
          title: "PDF Generated",
          description: `Invoice PDF saved as "${filename}". Please attach this file to your email.`,
          variant: "default"
        })
      }
      
      return pdf
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Used to edit invoice
  useEffect(() => {
    if (invoiceToEdit) {
      console.log("Raw Invoice Data:", invoiceToEdit)

      // Enhanced parser that handles all possible field states
      interface FinancialField {
        type: "percentage" | "fixed"
        value: number | string
      }

      const parseFinancialField = (
        field: string | FinancialField | null | undefined,
        fieldName: string,
        defaultValue: FinancialField,
      ): FinancialField => {
        // Handle completely missing field
        if (field === undefined || field === null) {
          console.warn(`${fieldName} is undefined/null, using defaults`)
          return defaultValue
        }

        // Handle string input (could be JSON string)
        if (typeof field === "string") {
          try {
            const parsed = field.trim() ? JSON.parse(field) : defaultValue
            if (parsed && typeof parsed === "object") {
              return {
                type: ["percentage", "fixed"].includes(parsed.type)
                  ? (parsed.type as "percentage" | "fixed")
                  : defaultValue.type,
                value:
                  parsed.value === 0 ? "" : !isNaN(Number(parsed.value)) ? Number(parsed.value) : defaultValue.value,
              }
            }
          } catch (e) {
            console.error(`Failed to parse ${fieldName}:`, field)
          }
        }

        // Handle direct object input
        if (typeof field === "object" && field !== null) {
          return {
            type: ["percentage", "fixed"].includes(field.type)
              ? (field.type as "percentage" | "fixed")
              : defaultValue.type,
            value: field.value === 0 ? "" : !isNaN(Number(field.value)) ? Number(field.value) : defaultValue.value,
          }
        }

        return defaultValue
      }

      // Process invoice data with guaranteed fields
      const processedInvoiceData: InvoiceData = {
        invoiceNumber: invoiceToEdit.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: invoiceToEdit.date || new Date().toISOString().split("T")[0],
        dueDate: invoiceToEdit.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        customer: invoiceToEdit.customer || {
          name: "",
          email: "",
          address: "",
        },
        items: Array.isArray(invoiceToEdit.items)
          ? invoiceToEdit.items.map((item: InvoiceItem) => ({
            ...item,
            price: item.price === 0 ? "" : item.price,
            discount: parseFinancialField(item.discount, "discount", { type: "percentage", value: "" }),
            tax: parseFinancialField(item.tax, "tax", { type: "percentage", value: "" })
          }))
          : [{ name: "", description: "", quantity: 1, price: "", discount: { type: "percentage", value: "" }, tax: { type: "percentage", value: "" } }],
        amount: invoiceToEdit.amount || 0,
        notes: typeof invoiceToEdit.notes === "string" ? invoiceToEdit.notes : "",
        template: "classic" as const,
        status: invoiceToEdit.status === "Paid" ? "Paid" : "Pending"
      }

      setInvoiceData(processedInvoiceData)
      setIsFormExpanded(false) // Hide form by default when viewing an invoice

      // Debug log the processed data
      console.log("Processed Invoice Data:", processedInvoiceData)
    }
  }, [invoiceToEdit])

  // Invoice Classic Template
  const InvoiceClassic = ({ data, businessData }: { data: InvoiceData; businessData: BusinessData }) => {
    // Calculate all amounts
    const calculateItemTotal = (item: InvoiceItem) => {
      const price = item.price === "" ? 0 : Number(item.price);
      const quantity = item.quantity;
      const subtotal = price * quantity;

      // Calculate discount
      let discount = 0;
      if (item.discount.value && item.discount.value !== "") {
        if (item.discount.type === "percentage") {
          discount = (subtotal * Number(item.discount.value)) / 100;
        } else {
          discount = Number(item.discount.value);
        }
      }

      // Calculate tax
      let tax = 0;
      if (item.tax.value && item.tax.value !== "") {
        const afterDiscount = subtotal - discount;
        if (item.tax.type === "percentage") {
          tax = (afterDiscount * Number(item.tax.value)) / 100;
        } else {
          tax = Number(item.tax.value);
        }
      }

      return {
        subtotal,
        discount,
        tax,
        total: subtotal - discount + tax
      };
    };

    const itemTotals = data.items.map(calculateItemTotal);
    const subtotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = itemTotals.reduce((sum, item) => sum + item.discount, 0);
    const totalTax = itemTotals.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal - totalDiscount + totalTax;

    // Format date to show month name, day and year
    const formatDate = (dateString: string) => {
      if (!dateString) return "Not specified"
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    return (
      <div
        className="bg-white"
        style={{
          width: "210mm",
          minHeight: "287mm",
          margin: 0,
          boxSizing: "border-box",
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >


        {/* Header with logo */}
        <div className="flex justify-between mt-8 items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-gray-500">Invoice number: {data.invoiceNumber}</p>
              <p className="text-sm text-gray-500">Invoice Created: {formatDate(data.date)}</p>
            </div>
          </div>
        </div>

        {/* Business and Client Info */}
        <div className="grid grid-cols-1  md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h2>
            <div className="space-y-1">
              <p className="font-medium">{businessData.companyName || "Loading Company Details..."}</p>
              <p>{businessData.email || "contact@company.com"}</p>
              <p>{businessData.address || "123 Business St"}</p>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h2>
              <div className="space-y-1">
                <p className="font-medium">{data.customer.name}</p>
                <p>{data.customer.email}</p>
                <p className="whitespace-pre-line">{data.customer.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 font-medium w-[800px]">
            <p className="text-xl">
              ${formatCurrency(total)} due on <span className="pl-1">{formatDate(data.dueDate)}</span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-white">
              <tr className="text-left text-md border-b font-medium text-gray-800">
                <th className="py-3 px-1">Item</th>
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item, i) => (
                <tr key={i} className="text-gray-900">
                  <td className="py-3 px-4">{item.name || `Item ${i + 1}`}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">
                    ${formatCurrency(item.price === "" ? 0 : Number(item.price))}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    ${formatCurrency(calculateItemTotal(item).total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - Fixed right alignment */}
        <div className="w-full">
          <div className="float-right w-full md:w-1/2">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 px-2 text-right text-gray-600">Subtotal</td>
                  <td className="py-1 px-2 text-right font-medium">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-right text-gray-600">Discount</td>
                  <td className="py-1 px-2 text-right font-medium text-gray-800">-${formatCurrency(totalDiscount)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-right text-gray-600">Tax</td>
                  <td className="py-1 px-2 text-right font-medium text-gray-800">+${formatCurrency(totalTax)}</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 px-2 text-right font-bold text-gray-800">Total</td>
                  <td className="py-2 px-2 text-right font-bold text-lg text-gray-800">${formatCurrency(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="clear-both mt-8 pt-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h2>
            <p className="text-gray-600 whitespace-pre-line">{data.notes}</p>
          </div>
        )}
      </div>
    )
  }

  const [isLoading, setIsLoading] = useState(true)
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    logo: "",
  })
  const [sheetConnection, setSheetConnection] = useState({
    connected: false,
    sheetName: "",
    sheetId: "",
    lastSynced: "",
  })

  const [isSyncing, setIsSyncing] = useState(false)
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const hasBusinessDetails =
    businessData.companyName ||
    businessData.email ||
    businessData.phone ||
    businessData.address

  // Used to fetch business Details from the server/backend
  const fetchBusinessDetails = async () => {
    try {
      setIsLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.provider_token) {
        throw new Error("Google authentication required")
      }

      const response = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      if (response.data.businessDetails) {
        setBusinessData({
          companyName: response.data.businessDetails["Company Name"] || "",
          email: response.data.businessDetails["Business Email"] || "",
          phone: response.data.businessDetails["Phone Number"] || "",
          address: response.data.businessDetails["Address"] || "",
          logo: response.data.businessDetails["Logo"] || "",
        })
      }

      if (response.data.sheetConnection) {
        setSheetConnection(response.data.sheetConnection)
      }
    } catch (error) {
      console.error("Error fetching business details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch business details from Google Sheet.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  // Used to fetch business details from Google Sheet afer the user logs in
  useEffect(() => {
    fetchBusinessDetails()
  }, [])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  // Format date to show month name, day and year for email body
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
     


      {/* Main Content */}
      <div className=" mt-0 font-AfacadFlux w-full py-4 sm:py-8 px-4 mx-auto  rounded-b-3xl mb-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg rounded-2xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {invoiceToEdit ? "Invoice Details" : "Create Invoice"}
                </h1>
                {invoiceToEdit && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${invoiceToEdit.status === "Paid"
                    ? "bg-green-100 border border-green-200 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {invoiceToEdit.status === "Paid" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {invoiceToEdit.status}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm sm:text-base text-emerald-50">
                {invoiceToEdit
                  ? `Invoice #${invoiceData.invoiceNumber} - ${new Date(invoiceData.date).toLocaleDateString()}`
                  : "Generate and download professional invoices, and Click (Hide form) to view the invoice only"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className="flex items-center gap-2 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold shadow"
            >
              {isFormExpanded ? "Hide Form" : invoiceToEdit ? "Edit Invoice" : "Show Form"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isFormExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative">
          {/* Add a vertical separator between form and preview */}
          {isFormExpanded && (
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-10"></div>
          )}

          {/* Form Section - Now Collapsible */}
          <Collapsible open={isFormExpanded} onOpenChange={setIsFormExpanded} className="lg:col-span-1">
            <CollapsibleContent className="space-y-6 transition-all duration-300 ease-in-out">
              {/* Simplified Invoice Details Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Invoice Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="invoiceNumber">Invoice #</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                        disabled={!!invoiceToEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => updateInvoiceData("date", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Name</Label>
                        <Input
                          id="customerName"
                          value={invoiceData.customer.name}
                          onChange={(e) => updateInvoiceData("customer.name", e.target.value)}
                          placeholder="Customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={invoiceData.customer.email}
                          onChange={(e) => updateInvoiceData("customer.email", e.target.value)}
                          placeholder="customer@example.com"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="customerAddress">Address</Label>
                      <Textarea
                        id="customerAddress"
                        value={invoiceData.customer.address}
                        onChange={(e) => updateInvoiceData("customer.address", e.target.value)}
                        placeholder="Customer address"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>Items</div>
                    <Button variant="outline" type="button" onClick={addItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {invoiceData.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Item {index + 1}</span>
                            <span className="text-sm text-slate-500">
                              {item.name || "Unnamed Item"}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-name-${index}`}>Name</Label>
                            <Input
                              id={`item-name-${index}`}
                              value={item.name}
                              onChange={(e) => updateItem(index, "name", e.target.value)}
                              placeholder="Item name"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-description-${index}`}>Description</Label>
                            <Textarea
                              id={`item-description-${index}`}
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              placeholder="Item description"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                            <Input
                              id={`item-quantity-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                              min="0"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-price-${index}`}>Price</Label>
                            <Input
                              id={`item-price-${index}`}
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-discount-${index}`}>Discount</Label>
                            <div className="flex gap-2">
                              <Select
                                value={item.discount.type}
                                onValueChange={(value) => {
                                  updateItem(index, "discount", { ...item.discount, type: value });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">%</SelectItem>
                                  <SelectItem value="fixed">$</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                id={`item-discount-${index}`}
                                type="number"
                                value={item.discount.value}
                                onChange={(e) => updateItem(index, "discount", { ...item.discount, value: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`item-tax-${index}`}>Tax</Label>
                            <div className="flex gap-2">
                              <Select
                                value={item.tax.type}
                                onValueChange={(value) => {
                                  updateItem(index, "tax", { ...item.tax, type: value });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">%</SelectItem>
                                  <SelectItem value="fixed">$</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                id={`item-tax-${index}`}
                                type="number"
                                value={item.tax.value}
                                onChange={(e) => updateItem(index, "tax", { ...item.tax, value: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={invoiceData.notes}
                        onChange={(e) => updateInvoiceData("notes", e.target.value)}
                        placeholder="Add any additional notes or terms..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save and Download Invoice Button */}
              <div className="flex gap-3 justify-end no-print flex-wrap">
                {invoiceToEdit ? (
                  <Button
                    variant="outline"
                    onClick={handleUpdate}
                    className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
                  >
                    Update Invoice
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
                  >
                    Save Invoice
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto text-white">
                  Print Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEmailInvoice} 
                  className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!invoiceData.customer.email}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Invoice to Client
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview Section */}
          <div className="transition-all duration-500 ease-in-out col-span-full w-full lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
              <h2 className="text-xl font-bold mb-4 text-emerald-700">Invoice Summary</h2>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className={`font-semibold ${invoiceData.status === "Paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {invoiceData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="font-bold text-lg text-gray-900">
                    ${formatCurrency(calculateTotal())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Client:</span>
                  <span className="text-gray-800">{invoiceData.customer.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Due Date:</span>
                  <span className="text-gray-800">{invoiceData.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Invoice #:</span>
                  <span className="text-gray-800">{invoiceData.invoiceNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
              {/* Checkmark animation */}
              <svg className="w-16 h-16 text-green-600 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-5" />
              </svg>
              <h2 className="text-2xl font-bold mb-2 text-green-700">Invoice Saved!</h2>
              <p className="mb-4 text-gray-600">Your invoice has been saved successfully.</p>

            </div>
          </div>
        )}
        
      </div>
    </>
  )
}



