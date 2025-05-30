"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Trash2, Plus, Download, ChevronDown, ArrowLeft, CheckCircle, Clock, Mail, Pencil, Printer, Link2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Collapsible, CollapsibleContent } from "../../components/ui/collapsible"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import supabase from "../../components/Auth/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import QuotationClassic from '../../components/QuotationClassic'

export interface QuotationItem {
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

export interface QuotationData {
  quotationNumber: string
  date: string
  validUntil: string
  customer: {
    name: string
    email: string
    address: string
  }
  items: QuotationItem[]
  amount: number
  notes: string
  template: "classic"
  status?: "Accepted" | "Pending" | "Rejected"
}

export interface BusinessData {
  companyName: string
  phone: string
  address: string
  email: string
  logo?: string
}

export default function QuotationForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isFormExpanded, setIsFormExpanded] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareExpiresAt, setShareExpiresAt] = useState('')
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
  })

  const quotationToEdit = location.state?.quotation

  const [quotationData, setQuotationData] = useState<QuotationData>(() => {
    if (quotationToEdit) {
      return {
        quotationNumber: quotationToEdit.quotationNumber || quotationToEdit.id,
        date: quotationToEdit.date || new Date().toISOString().split("T")[0],
        validUntil: quotationToEdit.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        customer: quotationToEdit.customer || {
          name: "",
          email: "",
          address: "",
        },
        items: quotationToEdit.items || [{
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
        amount: quotationToEdit.amount || 0,
        notes: quotationToEdit.notes || "",
        template: quotationToEdit.template || "classic",
        status: quotationToEdit.status || "Pending"
      }
    } else {
      return {
        quotationNumber: `QUOT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        date: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
      }
    }
  })

  const previewRef = useRef<HTMLDivElement>(null)

  // Used to update quotation Data
  const updateQuotationData = (field: string, value: any) => {
    setQuotationData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof QuotationData] as any),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })
  }

  // Used to update Quotation Items
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...quotationData.items]
    if (["price", "quantity"].includes(field) && value === "") {
      updatedItems[index] = { ...updatedItems[index], [field]: "" }
    } else if (field === "discount" || field === "tax") {
      if (value.value === "") {
        updatedItems[index] = { ...updatedItems[index], [field]: { ...value, value: "" } }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }
    updateQuotationData("items", updatedItems)
  }

  // Used to Add Items
  const addItem = () => {
    updateQuotationData("items", [...quotationData.items, {
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
    if (quotationData.items.length > 1) {
      const updatedItems = [...quotationData.items]
      updatedItems.splice(index, 1)
      updateQuotationData("items", updatedItems)
    }
  }

  // Calculate total amount
  const calculateTotal = () => {
    return quotationData.items.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price
      const quantity = item.quantity || 0
      const discountValue = typeof item.discount.value === 'string' ? parseFloat(item.discount.value) || 0 : item.discount.value
      const taxValue = typeof item.tax.value === 'string' ? parseFloat(item.tax.value) || 0 : item.tax.value

      let itemTotal = price * quantity

      // Apply discount
      if (item.discount.type === 'percentage') {
        itemTotal -= (itemTotal * discountValue) / 100
      } else {
        itemTotal -= discountValue
      }

      // Apply tax
      if (item.tax.type === 'percentage') {
        itemTotal += (itemTotal * taxValue) / 100
      } else {
        itemTotal += taxValue
      }

      return total + itemTotal
    }, 0)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        alert("Google authentication required")
        return
      }

      // Get the SheetBills Quotations sheet URL
      const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      const quotationsSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Quotations")
      if (!quotationsSheet) {
        throw new Error("SheetBills Quotations sheet not found")
      }

      // Calculate totals for the quotation
      const total = calculateTotal()

      // Prepare the save request
      const saveResponse = await axios.post(
        "https://sheetbills-server.vercel.app/api/quotations/save",
        {
          accessToken: session.provider_token,
          quotationData: {
            ...quotationData,
            amount: total,
            status: 'Pending'
          },
          sheetUrl: quotationsSheet.sheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (saveResponse.data.success) {
        setShowSuccessModal(true)
        // Clear cache and navigate back to dashboard with refresh flag
        localStorage.removeItem("cachedQuotations")
        localStorage.removeItem("lastFetchTime")
        navigate('/dashboard', { state: { refresh: true } })
      } else {
        alert("Failed to save quotation")
      }
    } catch (error) {
      console.error("Error saving quotation:", error)
      alert("Failed to save quotation. Check console for details.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setIsUpdating(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        alert("Google authentication required")
        return
      }

      // Get the SheetBills Quotations sheet URL
      const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
      })

      const quotationsSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Quotations")
      if (!quotationsSheet) {
        throw new Error("SheetBills Quotations sheet not found")
      }

      // Calculate totals for the quotation
      const total = calculateTotal()

      // Get the original quotation ID
      const originalQuotationId = quotationToEdit.id || quotationToEdit.quotationNumber

      // Prepare the update request
      const updateResponse = await axios.post(
        "https://sheetbills-server.vercel.app/api/quotations/update",
        {
          accessToken: session.provider_token,
          quotationData: {
            ...quotationData,
            amount: total,
            id: originalQuotationId
          },
          quotationId: originalQuotationId,
          sheetUrl: quotationsSheet.sheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (updateResponse.data.success) {
        setShowSuccessModal(true)
        // Clear cache and navigate back to dashboard with refresh flag
        localStorage.removeItem("cachedQuotations")
        localStorage.removeItem("lastFetchTime")
        navigate('/dashboard', { state: { refresh: true } })
      } else {
        alert("Failed to update quotation")
      }
    } catch (error) {
      console.error("Error updating quotation:", error)
      alert("Failed to update quotation. Check console for details.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return

    try {
      // Create a temporary div to render the quotation without buttons
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
        ; (el as HTMLElement).style.display = "none"
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

      // Save the PDF
      const filename = `Quotation-${quotationData.quotationNumber}.pdf`
      pdf.save(filename)

      toast({
        title: "PDF Generated",
        description: `Quotation PDF saved as "${filename}"`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateQuotationLink = async () => {
    if (!quotationData.customer.email) {
      toast({
        title: "Error",
        description: "Customer email is required to generate a shareable link.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingLink(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      if (!session) {
        throw new Error("No active session")
      }

      // Create a shareable link for the quotation
      const response = await fetch("https://sheetbills-server.vercel.app/api/quotations/shared/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Supabase-Token": session.access_token || "",
        },
        body: JSON.stringify({
          quotationId: quotationData.quotationNumber,
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

      toast({
        title: "Link Generated",
        description: `Shareable link created. Link expires on ${formattedExpirationDate}`,
        variant: "default",
      })

      // Copy link to clipboard
      await navigator.clipboard.writeText(shareUrl)

      toast({
        title: "Link Copied",
        description: "Shareable link has been copied to your clipboard",
        variant: "default",
      })

      setShareUrl(shareUrl)
      setShareExpiresAt(expiresAt)
      setShowShareModal(true)
    } catch (error) {
      console.error("Error generating link:", error)
      toast({
        title: "Error",
        description: "Failed to generate shareable link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Quotation Summary Card */}
          <div className="md:w-80 w-full flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-6">
              <div>
                <div className="text-xs text-gray-500 font-normal mb-1">Quotation #</div>
                <div className="text-lg font-semibold text-gray-800 mb-2 break-all">{quotationData.quotationNumber}</div>
                <div className="text-xs text-gray-500 font-normal mb-1">Billed To:</div>
                <div className="text-base font-medium text-gray-800 mb-2">{quotationData.customer.name || 'Customer Name'}</div>
                <div className="text-xs text-gray-500 font-normal mb-1">Amount:</div>
                <div className="text-2xl font-bold text-green-800 mb-0">${formatCurrency(quotationData.amount || calculateTotal())}</div>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <Button
                  variant="default"
                  className="bg-green-800 hover:bg-green-900 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                  onClick={() => setIsFormExpanded(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Quotation
                </Button>
                <Button
                  variant="outline"
                  className="bg-green-800 hover:bg-green-900 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                  onClick={handleDownloadPDF}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Quotation
                </Button>
                <Button
                  variant="default"
                  className="bg-green-800 hover:bg-green-900 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                  onClick={handleGenerateQuotationLink}
                  disabled={isGeneratingLink}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  {isGeneratingLink ? "Generating Link ..." : "Generate Quotation Link"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Form and Preview */}
          <div className="flex-1">
            {isFormExpanded && (
              <div className="mt-0 max-w-7xl font-inter py-4 sm:py-8 px-4 mx-auto rounded-b-3xl mb-10">
                <div className="mb-8">
                  {/* Breadcrumb Navigation */}
                  <div className="mt-2 mb-6">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/quotations">Quotations</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{quotationToEdit ? "Edit Quotation" : "New Quotation"}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>

                  {/* Header Content */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                        {quotationToEdit ? "Edit Quotation" : "Create New Quotation"}
                      </h1>
                      <p className="text-sm text-gray-500 font-light">
                        {quotationToEdit
                          ? `Quotation #${quotationData.quotationNumber} - ${new Date(quotationData.date).toLocaleDateString()}`
                          : "Create a professional quotation for your client"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      {quotationToEdit && (
                        <Button
                          type="button"
                          disabled
                          className="bg-green-800 hover:bg-green-900 text-white px-7 py-2 font-medium cursor-default shadow-lg"
                        >
                          {quotationToEdit.status}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setIsFormExpanded(!isFormExpanded)}
                        className="bg-green-800 hover:bg-green-900 text-white font-medium px-6 py-2"
                      >
                        {isFormExpanded ? "Hide Form" : "Show Form"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Collapsible open={isFormExpanded} onOpenChange={setIsFormExpanded} className="lg:col-span-1">
                    <CollapsibleContent className="space-y-6">
                      <Card className="border">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-medium">Quotation Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="quotationNumber" className="text-sm font-medium">Quotation #</Label>
                              <Input
                                id="quotationNumber"
                                value={quotationData.quotationNumber}
                                onChange={(e) => updateQuotationData("quotationNumber", e.target.value)}
                                disabled={!!quotationToEdit}
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                              <Input
                                id="date"
                                type="date"
                                value={quotationData.date}
                                onChange={(e) => updateQuotationData("date", e.target.value)}
                                className="mt-1.5 font-inter font-light"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="validUntil" className="text-sm font-medium">Valid Until</Label>
                            <Input
                              id="validUntil"
                              type="date"
                              value={quotationData.validUntil}
                              onChange={(e) => updateQuotationData("validUntil", e.target.value)}
                              className="mt-1.5 font-inter font-light"
                            />
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-3">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="customerName" className="text-sm font-medium">Name</Label>
                                <Input
                                  id="customerName"
                                  value={quotationData.customer.name}
                                  onChange={(e) => updateQuotationData("customer.name", e.target.value)}
                                  placeholder="Customer name"
                                  className="mt-1.5 font-inter font-light"
                                />
                              </div>
                              <div>
                                <Label htmlFor="customerEmail" className="text-sm font-medium">Email</Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  value={quotationData.customer.email}
                                  onChange={(e) => updateQuotationData("customer.email", e.target.value)}
                                  placeholder="customer@example.com"
                                  className="mt-1.5 font-inter font-light"
                                />
                              </div>
                            </div>
                            <div className="mt-4">
                              <Label htmlFor="customerAddress" className="text-sm font-medium">Address</Label>
                              <Textarea
                                id="customerAddress"
                                value={quotationData.customer.address}
                                onChange={(e) => updateQuotationData("customer.address", e.target.value)}
                                placeholder="Customer address"
                                rows={2}
                                className="mt-1.5 font-inter font-light"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-medium flex items-center justify-between">
                            <span>Items</span>
                            <Button variant="outline" type="button" onClick={addItem} size="sm" className="font-medium">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {quotationData.items.map((item, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">Item {index + 1}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`item-name-${index}`} className="text-sm font-medium">Name</Label>
                                    <Input
                                      id={`item-name-${index}`}
                                      value={item.name}
                                      onChange={(e) => updateItem(index, "name", e.target.value)}
                                      placeholder="Item name"
                                      className="mt-1.5 font-inter font-light"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`item-description-${index}`} className="text-sm font-medium">Description</Label>
                                    <Textarea
                                      id={`item-description-${index}`}
                                      value={item.description}
                                      onChange={(e) => updateItem(index, "description", e.target.value)}
                                      placeholder="Item description"
                                      className="mt-1.5 font-inter font-light"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`item-quantity-${index}`} className="text-sm font-medium">Quantity</Label>
                                    <Input
                                      id={`item-quantity-${index}`}
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateItem(index, "quantity", val === "" ? "" : parseInt(val));
                                      }}
                                      min="0"
                                      className="mt-1.5 font-inter font-light"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`item-price-${index}`} className="text-sm font-medium">Price</Label>
                                    <Input
                                      id={`item-price-${index}`}
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateItem(index, "price", val === "" ? "" : parseFloat(val));
                                      }}
                                      min="0"
                                      step="0.01"
                                      className="mt-1.5 font-inter font-light"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`item-discount-${index}`} className="text-sm font-medium">Discount</Label>
                                    <div className="flex gap-2 mt-1.5">
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
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateItem(index, "discount", { ...item.discount, value: val === "" ? "" : parseFloat(val) });
                                        }}
                                        min="0"
                                        step="0.01"
                                        className="flex-1 font-inter font-light"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`item-tax-${index}`} className="text-sm font-medium">Tax</Label>
                                    <div className="flex gap-2 mt-1.5">
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
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateItem(index, "tax", { ...item.tax, value: val === "" ? "" : parseFloat(val) });
                                        }}
                                        min="0"
                                        step="0.01"
                                        className="flex-1 font-inter font-light"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-medium">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              value={quotationData.notes}
                              onChange={(e) => updateQuotationData("notes", e.target.value)}
                              placeholder="Add any additional notes or terms..."
                              className="mt-1.5 min-h-[100px]"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3 justify-end no-print">
                        {quotationToEdit ? (
                          <Button
                            variant="outline"
                            onClick={handleUpdate}
                            className="bg-green-800 hover:bg-green-900 text-white font-inter font-light"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating Quotation..." : "Update Quotation"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={handleSave}
                            className="bg-green-800 hover:bg-green-900 text-white font-inter font-light"
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving Quotation..." : "Save Quotation"}
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Preview Section */}
                  <div className="lg:col-span-1">
                    <div ref={previewRef} className="bg-white p-8 rounded-lg shadow-sm">
                      <QuotationClassic
                        quotationData={quotationData}
                        businessData={businessData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Success!</h2>
            <p className="mb-6">Your quotation has been saved successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Share Quotation</h2>
            <p className="mb-4">Share this link with your customer:</p>
            <div className="mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This link will expire on: {new Date(shareExpiresAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 