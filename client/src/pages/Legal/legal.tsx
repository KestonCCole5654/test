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
        onClick={() => window.history.back()}
        className="mb-8 flex items-center text-green-700 hover:text-green-900 font-cal-sans text-sm focus:outline-none"
        aria-label="Go back"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Back
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
              This Privacy Policy describes how SheetBills ("we", "our", or "us") collects, uses, and protects your personal information and Google API data when you use our invoicing tool.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">2. Information We Collect</h2>
            <p className="text-gray-600">
              When you use SheetBills, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Google Account Information:</strong> We authenticate your account using Google OAuth 2.0. Through this process, we access your:
                <ul className="list-circle pl-6 text-gray-600 space-y-1 mt-1">
                  <li><strong>Email Address (`userinfo.email` scope):</strong> Used for user identification and communication.</li>
                  <li><strong>Basic Profile Information (`userinfo.profile` scope):</strong> Such as your name and profile picture, used for personalizing your in-app experience.</li>
                </ul>
              </li>
              <li>
                <strong>Google Drive Data (`drive.file` scope):</strong> SheetBills creates and accesses specific spreadsheet files (e.g., 'Master Tracking Sheet', 'SheetBills Invoices') that are owned by you and stored in your Google Drive. We do not access other files in your Drive unless explicitly created or opened by SheetBills.
              </li>
              <li>
                <strong>Google Sheets Data (`spreadsheets` scope):</strong> All invoice data and business details you input into SheetBills are stored directly within Google Spreadsheets in your Google Drive. This includes:
                <ul className="list-circle pl-6 text-gray-600 space-y-1 mt-1">
                  <li>Invoice numbers, dates, due dates</li>
                  <li>Customer names, emails, addresses</li>
                  <li>Invoice item details (name, description, quantity, price, discount, tax)</li>
                  <li>Amounts, notes, template choices, status (Paid/Pending), color, send status, and date sent.</li>
                  <li>Your business name, email, phone, address, and logo URL.</li>
                </ul>
                SheetBills accesses and manages this data within your Google Sheets to provide core invoicing functionality.
              </li>
              <li><strong>Usage Data:</strong> Aggregated and anonymized information about how users interact with the Service, used to improve functionality. This data does not personally identify you.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">3. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information collected to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and operate the core features of SheetBills, including creating, reading, updating, and deleting invoices and customer records directly within your Google Sheets.</li>
              <li>Authenticate your account and manage seamless integration with Google Drive and Google Sheets.</li>
              <li>Personalize your in-app experience by displaying your name and email.</li>
              <li>Diagnose technical issues, monitor performance, and improve the Service's functionality and user experience.</li>
              <li>Respond to inquiries and provide customer support related to your use of SheetBills.</li>
            </ul>
            <p className="text-gray-600 mt-4">
              We process your Google user data (email, profile info, Drive, and Sheets data) exclusively to provide and improve the functionality of SheetBills as an invoicing tool integrated with Google Sheets. We do not use this data for personalized advertising.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">4. Data Storage and Security</h2>
            <p className="text-gray-600">
              SheetBills operates as a connector to your Google Sheets. **We do not store your detailed invoice or customer data on our own servers.** Your primary invoice and business data always resides within your Google Drive account, which is subject to Google's robust security measures.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We use secure authentication protocols (OAuth 2.0) provided by Google and HTTPS encryption to protect your data during transmission between your browser, our server, and Google's APIs.</li>
              <li>We may temporarily store encrypted access tokens and user session information (e.g., in your browser's local storage or session storage) to maintain your login session and enable continuous functionality. These tokens are used solely to facilitate authorized access to your Google Sheets and Drive files, and we do not access your data beyond what is strictly required for the operation of the Service.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">5. Third-Party Services</h2>
            <p className="text-gray-600">
              SheetBills primarily integrates with Google APIs (Google Sheets API, Google Drive API, Google OAuth APIs) to connect with your Google account and manage your data. This use is subject to Google's API Services User Data Policy, including the Limited Use requirements, and Google's Terms of Service and Privacy Policy.
            </p>
            <p className="text-gray-600">
              We may also use other third-party services for analytics or other operational purposes (e.g., Vercel for hosting), but we do not share your personal data or Google API data with them for advertising or marketing purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">6. Data Retention</h2>
            <p className="text-gray-600">
              We retain only the minimal data necessary for the Service to function (e.g., session tokens, user IDs). Your invoice and business data, stored in your Google Sheets, is retained according to your Google account settings and policies. You can revoke SheetBills' access to your Google account at any time via your Google account settings (e.g., at <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer" className="text-green-800 hover:text-emerald-700 underline">Connected apps & services</a>).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">7. Your Rights</h2>
            <p className="text-gray-600">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access or request a copy of your personal data held by us.</li>
              <li>Correct or update your personal information.</li>
              <li>Delete certain data or withdraw consent for specific uses.</li>
              <li>Opt-out of data collection for usage analytics (if applicable).</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights regarding data held by SheetBills or to inquire about your Google Sheets data, please contact us at kestoncole3456@gmail.com. For data directly stored in Google Sheets, you can manage it through your Google Drive and Google Sheets interfaces.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">8. Children's Privacy</h2>
            <p className="text-gray-600">
              The Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have inadvertently received personal information from a child under 13, we will delete such information from our records.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. If changes are made, the new policy will be posted on this page with an updated effective date. Your continued use of the Service after the policy has been updated signifies your acceptance of the revised policy. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-gray-900">10. Contact</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, our data practices, or need assistance, please contact us at:
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