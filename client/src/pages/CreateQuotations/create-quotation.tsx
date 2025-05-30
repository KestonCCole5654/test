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
import QuotationClassic from "../../components/QuotationClassic"

// Interface for quotation items
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

// Interface for quotation data
export interface QuotationData {
  quotationNumber: string
  date: string
  validUntil: string // Changed from dueDate to validUntil
  customer: {
    name: string
    email: string
    address: string
  }
  items: QuotationItem[]
  amount: number
  notes: string
  template: "classic"
  status: "Draft" | "Sent" | "Accepted" | "Rejected" // Modified status options
}

// Interface for business data
interface BusinessData {
  companyName: string
  phone: string
  address: string
  email: string
  logo: string
}

export default function QuotationForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isFormExpanded, setIsFormExpanded] = useState(!location.state?.hideForm)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)

  // State for quotation data
  const [quotationData, setQuotationData] = useState<QuotationData>(() => ({
    quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
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
    status: "Draft"
  }))

  // State for business data
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    logo: "",
  })

  // Update quotation data
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

  // Update quotation items
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

  // Add new item
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

  // Remove item
  const removeItem = (index: number) => {
    if (quotationData.items.length > 1) {
      const updatedItems = [...quotationData.items]
      updatedItems.splice(index, 1)
      updateQuotationData("items", updatedItems)
    }
  }

  // Calculate total
  const calculateTotal = () => {
    return quotationData.items.reduce((total, item) => {
      const price = item.price === "" ? 0 : Number(item.price)
      const itemTotal = item.quantity * price

      let itemDiscount = 0
      if (item.discount.value && item.discount.value !== "") {
        if (item.discount.type === "percentage") {
          itemDiscount = (itemTotal * Number(item.discount.value)) / 100
        } else {
          itemDiscount = Math.min(itemTotal, Number(item.discount.value))
        }
      }

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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Handle save quotation
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement save functionality
      toast({
        title: "Success",
        description: "Quotation saved successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quotation",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle update quotation
  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // TODO: Implement update functionality
      toast({
        title: "Success",
        description: "Quotation updated successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quotation",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Generate and save PDF
  const generateAndSavePDF = async (forEmail = false) => {
    if (!previewRef.current) return

    try {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = previewRef.current.innerHTML
      document.body.appendChild(tempDiv)

      tempDiv.style.width = "210mm"
      tempDiv.style.padding = "10mm"
      tempDiv.style.backgroundColor = "white"

      const noPrintElements = tempDiv.querySelectorAll(".no-print")
      noPrintElements.forEach((el) => {
        ; (el as HTMLElement).style.display = "none"
      })

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(tempDiv)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      const filename = forEmail
        ? `Quotation-${quotationData.quotationNumber}-for-${quotationData.customer.name.replace(/\s+/g, "-")}.pdf`
        : `Quotation-${quotationData.quotationNumber}.pdf`

      pdf.save(filename)

      if (forEmail) {
        toast({
          title: "PDF Generated",
          description: `Quotation PDF saved as "${filename}". Please attach this file to your email.`,
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

  return (
    <>
      {/* Preview Mode */}
      {!isFormExpanded && (
        <div className="w-full max-w-7xl mx-auto mt-5">
          {/* Breadcrumb Navigation */}
          <div className="mt-4 max-w-7xl mb-6">
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
                  <BreadcrumbPage>New Quotation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Two-column layout for preview mode */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Quotation Summary Card */}
            <div className="md:w-80 w-full flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-6">
                <div>
                  <div className="text-xs text-gray-500 font-normal mb-1">Quotation #</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2 break-all">{quotationData.quotationNumber}</div>
                  <div className="text-xs text-gray-500 font-normal mb-1">Client:</div>
                  <div className="text-base font-medium text-gray-800 mb-2">{quotationData.customer.name || 'Client Name'}</div>
                  <div className="text-xs text-gray-500 font-normal mb-1">Total Amount:</div>
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
                    onClick={() => generateAndSavePDF()}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Quotation
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-800 hover:bg-green-900 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                    onClick={() => {/* TODO: Implement convert to invoice */}}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Convert to Invoice
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Quotation Preview */}
            <div className="flex-1">
              <div ref={previewRef}>
                <QuotationClassic
                  quotationData={quotationData}
                  businessData={businessData}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Mode */}
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
                    <BreadcrumbPage>New Quotation</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Create New Quotation
                </h1>
                <p className="text-sm text-gray-500 font-light">
                  Create a professional quotation for your client
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
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
                {/* Quotation Information Card */}
                <Card className="border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium">Quotation Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quotationNumber" className="text-sm font-medium">Quotation #</Label>
                        <Input
                          id="quotationNumber"
                          value={quotationData.quotationNumber}
                          onChange={(e) => updateQuotationData("quotationNumber", e.target.value)}
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
                    </div>

                    {/* Customer Information */}
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

                {/* Items Card */}
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
                    <div className="space-y-6">
                      {quotationData.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Item {index + 1}</span>
                              <span className="text-sm text-gray-500 font-light">
                                {item.name || "Unnamed Item"}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-6 w-6 text-gray-500 hover:text-gray-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove item</span>
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

                {/* Notes Card */}
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

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end no-print">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="bg-green-800 hover:bg-green-900 text-white font-inter font-light"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving Quotation..." : "Save Quotation"}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div ref={previewRef}>
                <QuotationClassic
                  quotationData={quotationData}
                  businessData={businessData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 