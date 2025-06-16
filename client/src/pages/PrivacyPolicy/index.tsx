import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              SheetBills collects and processes the following information to provide our invoicing services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Google Account information (email, name, profile picture) for authentication and service integration</li>
              <li>Business information (company name, address, tax ID, business email, phone number)</li>
              <li>Customer information (names, addresses, contact details) for invoice generation</li>
              <li>Invoice data (items, prices, payment terms, due dates)</li>
              <li>Google Sheets data that you choose to connect with SheetBills</li>
              <li>Usage data to improve our service and troubleshoot issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain the SheetBills invoicing service</li>
              <li>Sync and manage your Google Sheets data</li>
              <li>Generate and manage invoices</li>
              <li>Send invoice notifications and payment reminders</li>
              <li>Process payments through our integrated payment systems</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our service based on usage patterns</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-600 mb-4">
              Your data security is our priority. We implement the following measures:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Data is stored securely using Supabase's enterprise-grade infrastructure</li>
              <li>Google Sheets integration uses OAuth 2.0 for secure authentication</li>
              <li>All data transfers are encrypted using SSL/TLS</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular backups of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              SheetBills integrates with the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Google Sheets API for spreadsheet integration</li>
              <li>Supabase for authentication and data storage</li>
              <li>Payment processors for invoice payments</li>
              <li>Email service providers for notifications</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Each of these services has their own privacy policies and data handling practices. We recommend reviewing their privacy policies for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access all personal data we store about you</li>
              <li>Correct any inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw your consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your data for as long as your account is active and as needed to provide you services. If you delete your account:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Your account information will be deleted within 30 days</li>
              <li>Your Google Sheets data will remain in your Google Drive</li>
              <li>We may retain certain information for legal compliance purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
              <br />
              <a href="mailto:privacy@sheetbills.com" className="text-green-800 hover:text-green-700">
                privacy@sheetbills.com
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

export default PrivacyPolicy; 