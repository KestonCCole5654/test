"use client"

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { Card, CardContent } from "../../components/ui/card"

interface EmailData {
  to: string
  from: string
  subject: string
  message: string
}

export default function EmailInvoice() {
  const navigate = useNavigate()
  const { invoiceNumber } = useParams();

  // Example: fetch invoice data by invoiceNumber here if needed
  // For now, just use invoiceNumber in the subject

  const customerEmail = ''
  const businessEmail = ''
  const customerName = ''
  const amount = 0
  const dueDate = ''
  const invoiceDate = ''
  const companyName = ''

  const [emailData, setEmailData] = useState<EmailData>({
    to: customerEmail,
    from: businessEmail,
    subject: `Invoice #: ${invoiceNumber || ''}`,
    message: `Dear ${customerName},\n\nWe appreciate your business. Please find your invoice details here. Feel free to contact us if you have any questions.\n\nInvoice Date: ${invoiceDate}\nSubtotal: $${amount}\nDue date: ${dueDate}`,
  })

  const handleSend = () => {
    // Implement your send logic here
    // For now, just navigate back
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6">
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
                <BreadcrumbPage>Email Invoice</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="w-full max-w-6xl bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
          {/* Left: Email Form */}
          <div className="flex-1 min-w-0">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Invoices  Soon!</h1>
                  <p className="text-gray-600 mb-6">
                    We're working on bringing you a seamless email invoice experience. 
                    This feature will allow you to send professional invoice emails directly to your clients.
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Expected features:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Professional email templates</li>
                      <li>• Invoice PDF attachments</li>
                      <li>• Email tracking and delivery status</li>
                      <li>• Customizable email content</li>
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-8"
                    onClick={() => navigate(-1)}
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Invoice Preview */}
          <div className="flex-1 min-w-0">
            {/* Add your invoice preview component here */}
          </div>
        </div>
      </div>
    </div>
  )
}
