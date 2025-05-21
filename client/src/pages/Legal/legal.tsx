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
      {/* Back Button */}
      <button
        onClick={() => window.location.href = '/login'}
        className="mb-8 flex items-center text-green-700 hover:text-green-900 font-cal-sans text-sm focus:outline-none"
        aria-label="Back to Login"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Back to Login
      </button>

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
          <div className="text-sm text-gray-500 mb-8">
            Effective Date: 05/20/2025
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using SheetBills, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">2. Service Description</h2>
            <p className="text-gray-600">
              SheetBills is an invoicing tool that integrates with Google Sheets to help you create, manage, and send invoices. The service requires a Google account and access to Google Sheets.
            </p>
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
              <li>Maintaining appropriate backup of your data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">4. Service Limitations</h2>
            <p className="text-gray-600">
              SheetBills is provided "as is" without any warranties. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Uninterrupted or error-free service</li>
              <li>Compatibility with all devices or browsers</li>
              <li>Complete accuracy of generated invoices</li>
              <li>Availability of all features at all times</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">5. Service Modifications</h2>
            <p className="text-gray-600">
              We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">6. Contact Information</h2>
            <p className="text-gray-600">
              For any questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email: kestoncole3456@gmail.com</li>
              <li>Website: sheetbills-client.vercel.app</li>
              <li>Company Name: SheetBills ™</li>
            </ul>
          </section>
        </TabsContent>

        {/* Privacy Policy Content */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="text-sm text-gray-500 mb-8">
            Effective Date: 05/20/2025
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">1. Introduction</h2>
            <p className="text-gray-600">
              This Privacy Policy describes how SheetBills ("we", "our", or "us") collects, uses, and protects your personal information when you use our invoicing tool.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">2. Information We Collect</h2>
            <p className="text-gray-600">
              When you use SheetBills, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Google Account Information: Required to authenticate and connect to Google Sheets via OAuth.</li>
              <li>Invoice Data: Information you input or generate using SheetBills, stored in your Google Sheets.</li>
              <li>Usage Data: Aggregated and anonymized information about how users interact with the Service, used to improve functionality.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">3. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information collected to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and operate the core features of SheetBills.</li>
              <li>Authenticate your account and manage integration with Google Sheets.</li>
              <li>Diagnose technical issues and improve the Service.</li>
              <li>Respond to inquiries and provide customer support.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">4. Data Storage and Security</h2>
            <p className="text-gray-600">
              SheetBills does not store your invoice data on its own servers. Your data resides in your Google Drive.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We use secure authentication protocols (OAuth 2.0) and HTTPS encryption to protect your data during transmission.</li>
              <li>We may store access tokens temporarily and securely to enable functionality, but we do not access your data beyond what is required for the operation of the Service.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">5. Third-Party Services</h2>
            <p className="text-gray-600">
              SheetBills integrates with Google APIs to connect with Google Sheets. This use is subject to Google's Terms of Service and Privacy Policy.
            </p>
            <p className="text-gray-600">
              We do not sell, rent, or share your personal data with third parties for advertising or marketing purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">6. Data Retention</h2>
            <p className="text-gray-600">
              We retain only the minimal data necessary for the Service to function. You can revoke our access at any time via your Google account settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">7. Your Rights</h2>
            <p className="text-gray-600">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access or request a copy of your personal data.</li>
              <li>Correct or update your personal information.</li>
              <li>Delete certain data or withdraw consent for specific uses.</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact us at kestoncole3456@gmail.com
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">8. Children's Privacy</h2>
            <p className="text-gray-600">
              The Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. If changes are made, the new policy will be posted on this page with an updated effective date. Your continued use of the Service after the policy has been updated signifies your acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">10. Contact</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email: kestoncole3456@gmail.com</li>
              <li>Website: sheetbills-client.vercel.app</li>
              <li>Company Name: SheetBills ™</li>
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