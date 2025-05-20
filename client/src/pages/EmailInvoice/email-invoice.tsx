"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { Card, CardContent } from "../../components/ui/card"

export default function EmailInvoice() {
  const navigate = useNavigate()

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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
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
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
