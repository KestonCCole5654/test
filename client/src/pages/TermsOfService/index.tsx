import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Service Description</h2>
            <p className="text-gray-600 mb-4">
              SheetBills is an invoicing service that integrates with Google Sheets to help businesses create, manage, and send professional invoices. By using SheetBills, you agree to these terms and conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account Requirements</h2>
            <p className="text-gray-600 mb-4">
              To use SheetBills, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Have a valid Google account</li>
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Usage</h2>
            <p className="text-gray-600 mb-4">
              When using SheetBills, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to reverse engineer or modify the service</li>
              <li>Not use the service to send spam or malicious content</li>
              <li>Not interfere with the proper functioning of the service</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain accurate and up-to-date business information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Google Sheets Integration</h2>
            <p className="text-gray-600 mb-4">
              Our service integrates with Google Sheets. By using this integration, you:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Grant SheetBills permission to access and modify your Google Sheets</li>
              <li>Understand that we will only access sheets you explicitly connect</li>
              <li>Are responsible for maintaining appropriate access controls</li>
              <li>Can revoke access at any time through your Google Account settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
            <p className="text-gray-600 mb-4">
              SheetBills offers both free and paid services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Free tier includes basic invoicing features</li>
              <li>Paid plans may be introduced with additional features</li>
              <li>Payment processing fees may apply to certain transactions</li>
              <li>All prices are subject to change with notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Modifications</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Modify or discontinue any part of the service</li>
              <li>Change pricing with 30 days notice</li>
              <li>Update these terms at any time</li>
              <li>Suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              SheetBills is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Any loss of data or business interruption</li>
              <li>Delays or failures in service delivery</li>
              <li>Inaccuracies in invoice calculations</li>
              <li>Issues with third-party integrations</li>
              <li>Indirect or consequential damages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your access to SheetBills:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>For violations of these terms</li>
              <li>For fraudulent or illegal activity</li>
              <li>For non-payment of fees (if applicable)</li>
              <li>At our discretion with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:legal@sheetbills.com" className="text-green-800 hover:text-green-700">
                legal@sheetbills.com
              </a>
            </p>
          </section>

          <section>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 