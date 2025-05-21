"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState("terms")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "terms" || tab === "privacy") {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Legal</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-cal-sans font-medium text-gray-900 mb-8">Legal Information</h1>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
        </TabsList>

        {/* Terms of Service Content */}
        <TabsContent value="terms" className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using SheetBills, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">2. Use License</h2>
            <p className="text-gray-600">
              Permission is granted to temporarily use SheetBills for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in SheetBills</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">3. User Responsibilities</h2>
            <p className="text-gray-600">
              As a user of SheetBills, you are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your use of the service complies with all applicable laws</li>
              <li>Providing accurate and complete information when using the service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">4. Service Modifications</h2>
            <p className="text-gray-600">
              SheetBills reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>
        </TabsContent>

        {/* Privacy Policy Content */}
        <TabsContent value="privacy" className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">1. Information Collection</h2>
            <p className="text-gray-600">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Account information (name, email, profile picture)</li>
              <li>Business information (company name, address, contact details)</li>
              <li>Usage data and preferences</li>
              <li>Google Sheets integration data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">2. Information Usage</h2>
            <p className="text-gray-600">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process your transactions</li>
              <li>Send you important updates and notifications</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">3. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">4. Third-Party Services</h2>
            <p className="text-gray-600">
              Our service integrates with Google Sheets and other third-party services. These services have their own privacy policies and terms of service. We recommend reviewing their policies to understand how they handle your data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">5. Your Rights</h2>
            <p className="text-gray-600">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>
        </TabsContent>
      </Tabs>

      {/* Last Updated Notice */}
      <div className="mt-12 pt-6 border-t text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  )
} 