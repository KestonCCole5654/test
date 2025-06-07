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
import { useSupabaseClient } from '@supabase/auth-helpers-react'
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
import InvoiceClassic from "../../components/InvoiceClassic"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { supabase } from '../../lib/supabase'
import ColorSuggestions from '../../components/ColorSuggestions'
import { EmailInvoiceModal } from '../../components/EmailInvoiceModal'

// Replace the printStyles constant with this updated version
const printStyles = `
  @media print {
    /* Reset page margins and hide unnecessary elements */
    @page {
      margin: 0;
      size: A4;
    }

    /* Hide navigation, buttons, and other UI elements */
    nav, 
    button,
    .no-print,
    .breadcrumb,
    .sticky,
    .grid > div:not(.invoice-preview-print) {
      display: none !important;
    }

    /* Show the invoice preview container */
    .invoice-preview-print {
      display: block !important;
      position: relative !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 20px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
    }

    /* Ensure the invoice content is visible */
    .invoice-preview-print * {
      visibility: visible !important;
      color: black !important;
    }

    /* Reset any background colors and ensure text is black */
    body {
      background: white !important;
      color: black !important;
    }

    /* Ensure proper layout in print mode */
    .grid {
      display: block !important;
    }

    /* Remove any shadows or decorative elements */
    * {
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }
`;

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
  color?: string
  logo?: string
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
  id?: string
  name: string
  email: string
  address: string
  phone?: string
  company?: string
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
  const supabase = useSupabaseClient()
  const [selectedSpreadsheetUrl, setSelectedSpreadsheetUrl] = useState<string | null>(() => {
    // First try to get from location state
    if (location.state?.selectedSpreadsheetUrl) {
      localStorage.setItem("defaultSheetUrl", location.state.selectedSpreadsheetUrl)
      return location.state.selectedSpreadsheetUrl
    }
    // Then try to get from localStorage
    return localStorage.getItem("defaultSheetUrl")
  })
  const key = location.state?.key
  const hideForm = location.state?.hideForm

  // Add useEffect to fetch spreadsheet URL if not available
  useEffect(() => {
    const fetchSpreadsheetUrl = async () => {
      if (!selectedSpreadsheetUrl) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.provider_token) {
            throw new Error("Google authentication required")
          }

          const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              "X-Supabase-Token": session.access_token,
            },
          })

          const invoicesSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Invoices")
          if (invoicesSheet?.sheetUrl) {
            setSelectedSpreadsheetUrl(invoicesSheet.sheetUrl)
            localStorage.setItem("defaultSheetUrl", invoicesSheet.sheetUrl)
          }
        } catch (error) {
          console.error("Error fetching spreadsheet URL:", error)
          toast({
            title: "Error",
            description: "Failed to fetch spreadsheet URL. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    fetchSpreadsheetUrl()
  }, [selectedSpreadsheetUrl, toast, supabase.auth])

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
        status: "Pending",
        color: "#166534"
      })
    }
    return () => {
      console.log('InvoiceForm unmounted')
    }
  }, [key])

  const [isFormExpanded, setIsFormExpanded] = useState(!location.state?.hideForm)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    if (invoiceToEdit) {
      return {
        invoiceNumber: invoiceToEdit.invoiceNumber || invoiceToEdit.id,
        date: invoiceToEdit.date || new Date().toISOString().split("T")[0],
        dueDate: invoiceToEdit.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        customer: invoiceToEdit.customer || {
          name: "",
          email: "",
          address: "",
        },
        items: invoiceToEdit.items || [{
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
        amount: invoiceToEdit.amount || 0,
        notes: invoiceToEdit.notes || "",
        template: invoiceToEdit.template || "classic",
        status: invoiceToEdit.status || "Pending",
        color: (typeof invoiceToEdit.color === "string" && invoiceToEdit.color.trim() !== "") ? invoiceToEdit.color : "#166534",
        logo: invoiceToEdit.logo || ""
      }
    } else {
      return {
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
        status: "Pending",
        color: "#166534"
      }
    }
  })

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
    // Allow empty string for price, quantity, discount, and tax
    if (["price", "quantity"].includes(field) && value === "") {
      updatedItems[index] = { ...updatedItems[index], [field]: "" }
    } else if (field === "discount" || field === "tax") {
      // Allow empty string for discount/tax value
      if (value.value === "") {
        updatedItems[index] = { ...updatedItems[index], [field]: { ...value, value: "" } }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }
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

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
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

      // Always pass the current invoice spreadsheet URL as sheetUrl
      const sheetUrl = selectedSpreadsheetUrl;
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected")
      }

      // Fetch business details from the correct spreadsheet
      const response = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          "X-Supabase-Token": session.access_token,
        },
        params: {
          sheetUrl: sheetUrl
        }
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

  const [shareableLink, setShareableLink] = useState<string>("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  // Function to generate shareable invoice link
  const handleGenerateInvoiceLink = async () => {
    try {
      setIsGeneratingLink(true)
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session object:", session);
      if (sessionError) {
        console.log("Session error:", sessionError);
        throw new Error(sessionError.message)
      }
      if (!session) {
        console.log("No session found!");
        throw new Error("No active session")
      }

      // Get the SheetBills Invoices sheet URL if not available in location state
      let sheetUrl = selectedSpreadsheetUrl;
      if (!sheetUrl) {
        const response = await axios.get("https://sheetbills-server.vercel.app/api/sheets/spreadsheets", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
        });

        const invoicesSheet = response.data.spreadsheets.find((sheet: { name: string; sheetUrl: string }) => sheet.name === "SheetBills Invoices");
        if (!invoicesSheet) {
          throw new Error("SheetBills Invoices sheet not found");
        }
        sheetUrl = invoicesSheet.sheetUrl;
      }

      // Use only the google_access_token from localStorage for debugging
      const googleToken = localStorage.getItem("google_access_token");
      console.log("Google Token from localStorage:", googleToken);
      console.log("Supabase Token Used:", session.access_token);

      // Debug log for invoiceId and sheetUrl
      console.log("About to create share link with:", {
        invoiceId: invoiceData.invoiceNumber,
        sheetUrl
      });

      // Create a shareable link for the invoice
      const response = await fetch("https://sheetbills-server.vercel.app/api/invoices/shared/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${googleToken}`,
          "X-Supabase-Token": session.access_token || "",
        },
        body: JSON.stringify({
          invoiceId: invoiceData.invoiceNumber,
          sheetUrl: sheetUrl,
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

      setShareableLink(shareUrl)
      
      // Show success toast
      toast({
        title: "Link Generated",
        description: `Shareable link created. Link expires on ${formattedExpirationDate}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating shareable link:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate shareable link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Add useEffect to inject print styles
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
        // Clear cache and navigate back to dashboard with refresh flag
        localStorage.removeItem("cachedInvoices")
        localStorage.removeItem("lastFetchTime")
        navigate('/dashboard', { state: { refresh: true } })
      } else {
        alert("Failed to update invoice")
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      alert("Failed to update invoice. Check console for details.")
    } finally {
      setIsUpdating(false)
    }
  }

  const [customers, setCustomers] = useState<Customer[]>([])
 
  // Add useEffect to fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("No active session")
        }

        const response = await fetch("https://sheetbills-server.vercel.app/api/customers", {
          headers: {
            "Authorization": `Bearer ${session.provider_token}`,
            "x-supabase-token": session.access_token
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }

        const data = await response.json()
        setCustomers(data.customers)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }

    fetchCustomers()
  }, [])

  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

      // Save customer info before saving invoice
      const customerToSave = {
        name: invoiceData.customer.name,
        email: invoiceData.customer.email,
        address: invoiceData.customer.address,
        notes: invoiceData.notes || ""
      }
      // Check if customer already exists (by email or name)
      const existingCustomer = customers.find(
        (c: Customer) => c.email === customerToSave.email || c.name === customerToSave.name
      )
      if (!existingCustomer && customerToSave.name && customerToSave.email) {
        try {
          await fetch("https://sheetbills-server.vercel.app/api/customers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.provider_token}`,
              "x-supabase-token": session.access_token
            },
            body: JSON.stringify(customerToSave)
          })
        } catch (err) {
          console.error("Error saving customer info:", err)
          // Optionally show a toast, but don't block invoice save
        }
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
        // Clear cache and navigate back to dashboard with refresh flag
        localStorage.removeItem("cachedInvoices")
        localStorage.removeItem("lastFetchTime")
        navigate('/dashboard', { state: { refresh: true } })
      } else {
        alert("Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Failed to save invoice. Check console for details.")
    } finally {
      setIsSaving(false)
    }
  }

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isSavingAndEmailing, setIsSavingAndEmailing] = useState(false)

  const handleSaveAndEmail = async () => {
    setIsSavingAndEmailing(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        alert("Google authentication required")
        return
      }

      // Save customer info before saving invoice
      const customerToSave = {
        name: invoiceData.customer.name,
        email: invoiceData.customer.email,
        address: invoiceData.customer.address,
        notes: invoiceData.notes || ""
      }
      
      // Check if customer already exists
      const existingCustomer = customers.find(
        (c: Customer) => c.email === customerToSave.email || c.name === customerToSave.name
      )
      if (!existingCustomer && customerToSave.name && customerToSave.email) {
        try {
          await fetch("https://sheetbills-server.vercel.app/api/customers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.provider_token}`,
              "x-supabase-token": session.access_token
            },
            body: JSON.stringify(customerToSave)
          })
        } catch (err) {
          console.error("Error saving customer info:", err)
        }
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
        // Clear cache
        localStorage.removeItem("cachedInvoices")
        localStorage.removeItem("lastFetchTime")
        
        // Show success toast
        toast({
          title: "Success",
          description: "Invoice saved successfully.",
        })
        
        // Show email modal
        setShowEmailModal(true)
      } else {
        throw new Error("Failed to save invoice")
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingAndEmailing(false)
    }
  }

  const handleEmailSend = async (emailData: any) => {
    try {
      // Here you would implement the email sending logic
      console.log('Sending email with data:', emailData)
      toast({
        title: "Success",
        description: "Invoice email sent successfully.",
      })
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
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
        invoiceNumber: invoiceToEdit.invoiceNumber || invoiceToEdit.id || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
        status: invoiceToEdit.status === "Paid" ? "Paid" : "Pending",
        color: (typeof invoiceToEdit.color === "string" && invoiceToEdit.color.trim() !== "") ? invoiceToEdit.color : "#166534",
        logo: invoiceToEdit.logo || ""
      }

      setInvoiceData(processedInvoiceData)
      setIsFormExpanded(false) // Hide form by default when viewing an invoice

      // Debug log the processed data
      console.log("Processed Invoice Data:", processedInvoiceData)
    }
  }, [invoiceToEdit])

  return (
    <>
      {/* Preview Mode - Cleaned up */}
      {!isFormExpanded && (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4">
          {/* Breadcrumb Navigation */}
          <div className="max-w-7xl mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{invoiceToEdit ? "Edit Invoice" : "New Invoice"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Two-column layout for preview mode */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Invoice Summary Card */}
            <div className="md:w-80 w-full flex-shrink-0">
              <div className="bg-white border border-gray-200 p-6 flex flex-col gap-6">
                
                <div>
                  <div className="text-sm text-gray-500 font-normal mb-1">Invoice #</div>
                  <div className="text-xl font-cal font-normal text-gray-800 mb-2 break-all">{invoiceData.invoiceNumber}</div>
                  <div className="text-sm text-gray-500 font-normal mb-1">Billed To:</div>
                  <div className="text-base font-normal text-gray-800 mb-2">{invoiceData.customer.name || 'Customer Name'}</div>
                  <div className="text-sm text-gray-500 font-normal mb-1">Amount Due:</div>
                  <div className="text-3xl font-cal font-normal text-green-800 mb-12">${formatCurrency(invoiceData.amount || calculateTotal())}</div>
                </div>

                <div className="flex w-full justify-center mb-10">
                  <ul className="hidden font-sans font-normal  text-md md:block text-center text-[#5C5B61] leading-relaxed space-y-1 md:-mt-3">
                    <li className="flex  items-center justify-center lg:justify-start gap-2 ">
                      <Button
                        variant="default"
                        className="bg-green-800 hover:bg-green-900 text-white font-normal px-4 py-2 shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                        onClick={() => setIsFormExpanded(true)}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit Invoice
                      </Button>
                    </li>

                    <li className="flex  items-center justify-center lg:justify-start gap-2">
                      <Button
                        variant="outline"
                        className="bg-green-800 hover:bg-green-900 text-white font-normal px-4 py-2 shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                        onClick={() => navigate(`/print-invoice/${invoiceToEdit?.id || invoiceData.invoiceNumber}`, {
                          state: { invoiceId: invoiceToEdit?.id || invoiceData.invoiceNumber }
                        })}
                      >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                      </Button>
                    </li>

                    <li className="flex  items-center justify-center lg:justify-start gap-2">
                      <Button
                        variant="default"
                        className="bg-green-800 hover:bg-green-900 text-white font-normal px-4 py-2 shadow-sm transition-all duration-150 w-full flex items-center justify-center gap-2"
                        onClick={handleGenerateInvoiceLink}
                        disabled={isGeneratingLink}
                      >
                        <Link2 className="w-4 h-4" />
                        {isGeneratingLink ? "Generating Public Invoice Link ..." : "Generate Invoice Link"}
                      </Button>
                    </li>
                  </ul>
                </div>
                {/* Shareable Link UI - shown directly under the three buttons */}
                {shareableLink && (
                  <div className="mt-2 p-2 bg-gray-50  w-full border border-gray-200 flex flex-col gap-2">
                    <p className="text-xs text-gray-600">Shareable Invoice Link:</p>
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="w-full p-1 border rounded text-xs font-extralight font-onest bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-green-800 text-white rounded"
                      onClick={() => {
                        navigator.clipboard.writeText(shareableLink)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? "Copied" : "Copy Link"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {/* Right: Invoice Preview */}
            <div className="flex-1 min-w-0">
              <div className="invoice-preview-print bg-white border border-gray-200 ">
                <div className="w-full overflow-auto">
                  <InvoiceClassic data={invoiceData} businessData={businessData} showShadow={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Mode (Form) */}
      {isFormExpanded && (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4 ">
          <div className="mb-6">
            {/* Breadcrumb Navigation */}
            <div className="mt-0 mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{invoiceToEdit ? "Edit Invoice" : "New Invoice"}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Header Content - Tidy, aligned, simple badge */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-2">
              {/* Title and subtitle */}
              <div>
                <h1 className="text-2xl font-normal text-gray-900 mb-1">
                  {invoiceToEdit ? "Edit Invoice" : "Create New Invoice"}
                </h1>
                <p className="text-sm text-gray-500 font-light">
                  {invoiceToEdit
                    ? `Invoice #: ${invoiceData.invoiceNumber} - ${new Date(invoiceData.date).toLocaleDateString()}`
                    : "Create a professional invoice for your client"}
                </p>
              </div>
              {/* Controls: color picker + preview button */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <label htmlFor="invoiceColorEdit" className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="color"
                      id="invoiceColorEdit"
                      value={(typeof invoiceData.color === "string" && invoiceData.color.trim() !== "") ? invoiceData.color : '#166534'}
                      onChange={e => updateInvoiceData("color", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-normal">Choose a Invoice Template Color</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => updateInvoiceData("color", "#166534")}
                    className="text-sm text-green-800 hover:text-gray-800 flex items-center gap-1"
                    title="Reset to default green color"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset to default color
                  </button>
                </div>
                {invoiceData.logo && (
                  <ColorSuggestions
                    logoUrl={invoiceData.logo}
                    onColorSelect={(color) => updateInvoiceData("color", color)}
                  />
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsFormExpanded(!isFormExpanded)}
                  className="bg-green-800 hover:bg-green-900 text-white font-normal px-6 py-2 w-full md:w-auto"
                >
                  {isFormExpanded ? "Preview Mode" : "Edit Mode"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Collapsible open={isFormExpanded} onOpenChange={setIsFormExpanded} className="lg:col-span-1">
              <CollapsibleContent className="space-y-6">
                <Card className="border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-normal">Invoice Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="invoiceNumber" className="text-sm font-normal">Invoice #</Label>
                        <Input
                          id="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                          disabled={!!invoiceToEdit}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date" className="text-sm font-normal">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={invoiceData.date}
                          onChange={(e) => updateInvoiceData("date", e.target.value)}
                          className="mt-1.5 font-inter font-light"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate" className="text-sm font-normal">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={invoiceData.dueDate}
                          onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                          className="mt-1.5  font-inter font-light"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-normal mb-3">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerName" className="text-sm font-normal">Name</Label>
                          <div className="relative">
                            <Input
                              id="customerName"
                              ref={inputRef}
                              value={invoiceData.customer.name}
                              onChange={e => {
                                updateInvoiceData("customer.name", e.target.value)
                                setShowSuggestions(true)
                              }}
                              onFocus={() => {
                                if (invoiceData.customer.name.length > 0) setShowSuggestions(true)
                              }}
                              onBlur={e => {
                                // Delay hiding to allow click on suggestion
                                setTimeout(() => setShowSuggestions(false), 100)
                              }}
                              placeholder="Customer name"
                              className="mt-1.5 font-inter font-light"
                              autoComplete="off"
                            />
                            {showSuggestions && invoiceData.customer.name && (
                              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded-lg shadow-md max-h-48 overflow-auto">
                                {customers.filter(customer =>
                                  customer.name.toLowerCase().includes(invoiceData.customer.name.toLowerCase())
                                ).length === 0 ? (
                                  <div className="px-4 py-2 text-gray-500">No customer found.</div>
                                ) : (
                                  customers
                                    .filter(customer =>
                                      customer.name.toLowerCase().includes(invoiceData.customer.name.toLowerCase())
                                    )
                                    .map(customer => (
                                      <div
                                        key={customer.id}
                                        className="px-4 py-2 cursor-pointer hover:bg-green-50 hover:text-green-800 transition-colors"
                                        onMouseDown={e => {
                                          // onMouseDown to prevent blur before click
                                          e.preventDefault()
                                          updateInvoiceData("customer", {
                                            name: customer.name,
                                            email: customer.email,
                                            address: customer.address
                                          })
                                          setShowSuggestions(false)
                                        }}
                                      >
                                        {customer.name}
                                      </div>
                                    ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="customerEmail" className="text-sm font-normal">Email</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={invoiceData.customer.email}
                            onChange={(e) => updateInvoiceData("customer.email", e.target.value)}
                            placeholder="customer@example.com"
                            className="mt-1.5 font-inter font-light"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="customerAddress" className="text-sm font-normal">Address</Label>
                        <Textarea
                          id="customerAddress"
                          value={invoiceData.customer.address}
                          onChange={(e) => updateInvoiceData("customer.address", e.target.value)}
                          placeholder="Customer address"
                          rows={2}
                          className="mt-1.5  font-inter font-light"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-normal flex items-center justify-between">
                      <span>Items</span>
                      <Button variant="outline" type="button" onClick={addItem} size="sm" className="font-normal">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {invoiceData.items.map((item, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-normal">Item {index + 1}</span>
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
                              <Label htmlFor={`item-name-${index}`} className="text-sm font-normal">Name</Label>
                              <Input
                                id={`item-name-${index}`}
                                value={item.name}
                                onChange={e => updateItem(index, "name", e.target.value)}
                                placeholder="Item name"
                                className="mt-1.5  font-inter font-light"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`item-description-${index}`} className="text-sm font-normal">Description</Label>
                              <Textarea
                                id={`item-description-${index}`}
                                value={item.description}
                                onChange={e => updateItem(index, "description", e.target.value)}
                                placeholder="Item description"
                                className="mt-1.5  font-inter font-light"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`item-quantity-${index}`} className="text-sm font-normal">Quantity</Label>
                              <Input
                                id={`item-quantity-${index}`}
                                type="number"
                                value={item.quantity}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateItem(index, "quantity", val === "" ? "" : parseInt(val));
                                }}
                                min="0"
                                className="mt-1.5 font-inter font-light"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`item-price-${index}`} className="text-sm font-normal">Price</Label>
                              <Input
                                id={`item-price-${index}`}
                                type="number"
                                value={item.price}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateItem(index, "price", val === "" ? "" : parseFloat(val));
                                }}
                                min="0"
                                step="0.01"
                                className="mt-1.5  font-inter font-light"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`item-discount-${index}`} className="text-sm font-normal">Discount</Label>
                              <div className="flex gap-2 mt-1.5">
                                <Select
                                  value={item.discount.type}
                                  onValueChange={value => {
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
                                  onChange={e => {
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
                              <Label htmlFor={`item-tax-${index}`} className="text-sm font-normal">Tax</Label>
                              <div className="flex gap-2 mt-1.5">
                                <Select
                                  value={item.tax.type}
                                  onValueChange={value => {
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
                                  onChange={e => {
                                    const val = e.target.value;
                                    updateItem(index, "tax", { ...item.tax, value: val === "" ? "" : parseFloat(val) });
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="flex-1  font-inter font-light"
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
                    <CardTitle className="text-lg font-normal">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="notes" className="text-sm font-normal">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={invoiceData.notes}
                        onChange={(e) => updateInvoiceData("notes", e.target.value)}
                        placeholder="Add any additional notes or terms..."
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex w-full justify-end gap-4 no-print">
                  {invoiceToEdit ? (
                    <Button
                      variant="outline"
                      onClick={handleUpdate}
                      className="bg-green-800 hover:bg-green-900 text-white font-inter font-light"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating Invoice..." : "Update Invoice"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSave}
                        className="bg-green-800 hover:bg-green-900 text-white font-inter font-light"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving Invoice..." : "Save Invoice"}
                      </Button>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Preview Section - Modified for proper printing */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {/* Add a print-specific wrapper */}
                <div className="invoice-preview-print" style={{ backgroundColor: 'white' }}>
                <div className="bg-white border ">
                  <InvoiceClassic data={invoiceData} businessData={businessData} showShadow={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal and other overlays remain unchanged */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            {/* Checkmark animation */}
            <h2 className="text-2xl font-normal mb-2 text-green-800">Invoice Saved</h2>
            <p className="mb-4 text-gray-600">Your invoice has been saved successfully.</p>
          </div>
        </div>
      )}

      {/* Add the email modal */}
      <EmailInvoiceModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleEmailSend}
        customerEmail={invoiceData.customer.email}
        businessEmail={businessData.email}
        invoiceNumber={invoiceData.invoiceNumber}
        customerName={invoiceData.customer.name}
        amount={invoiceData.amount || calculateTotal()}
        dueDate={invoiceData.dueDate}
        invoiceDate={invoiceData.date}
        companyName={businessData.companyName}
      />
    </>
  )
}



