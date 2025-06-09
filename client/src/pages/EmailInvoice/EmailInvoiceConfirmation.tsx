import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Check, Mail, ArrowLeft, FileText, Calendar, DollarSign, Download } from 'lucide-react';

export default function EmailInvoiceConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;

  console.log('Invoice data in EmailInvoiceConfirmation:', invoice);

  function formatCurrency(amount: number): string {
    return amount?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00";
  }

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleViewDownloadInvoice = () => {
    console.log("View/Download invoice");
    // This would typically generate and download a PDF or open invoice in new tab
    // You would implement your PDF generation/download logic here.
  };

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Invoice Data Found</h2>
          <p className="text-gray-600 mb-6">The invoice information could not be retrieved.</p>
          <button 
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button 
            onClick={handleBackToDashboard}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20  rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-green-800 rounded-full "></div>
            <div className="relative bg-green-800 rounded-full p-4">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Invoice Successfully Sent
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your invoice has been delivered to <span className="font-semibold text-emerald-700">{invoice.customer?.email}</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Invoice Preview */}
          <div className="lg:col-span-2">
            <div className="bg-transparent w-full mx-auto overflow-y-auto">
              {/* Company Logo */}
              { (invoice.logo || invoice.companyLogo) && (
                <img
                  src={invoice.logo || invoice.companyLogo}
                  alt="Company Logo"
                  className="h-12 w-auto object-contain mb-4"
                  style={{ background: 'none', boxShadow: 'none', border: 'none' }}
                />
              )}
              <div className="text-xs text-gray-500 mb-2 border-b border-gray-200 pb-2">
                From: {invoice.businessEmail}
                <br />
                To: {invoice.customer?.email}
              </div>
              {/* Logo and Company Name */}
              <div className="flex items-center gap-3 mb-2">
                {invoice.logo && (
                  <img
                    src={invoice.logo}
                    alt="Company Logo"
                    className="h-10 w-auto object-contain"
                    style={{ background: "none", boxShadow: "none" }}
                  />
                )}
                <div className="font-normal text-lg">Invoice #{invoice.invoiceNumber}</div>
              </div>

              <div className="text-green-800 font-medium text-xl mb-2 text-left">
                {invoice.companyName}
              </div>

              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center mb-4">
                <div className="text-xs text-gray-500 mt-5 mb-5">
                  INVOICE # {invoice.invoiceNumber || "—"}
                </div>

                <div className="text-3xl font-medium text-gray-800 mb-2">
                  ${formatCurrency(invoice.amount)}
                </div>

                <Button
                  variant="default"
                  className="bg-gray-800 text-white px-6 py-2 mb-1"
                  size="sm"
                  onClick={handleViewDownloadInvoice}
                >
                  View/Print Invoice 
                </Button>

                <div className="text-xs text-gray-500 mb-1 mt-5">
                  DUE {invoice.dueDate || "—"}
                </div>
              </div>

              <div className="text-sm text-center font-onest text-gray-400 mt-5 mb-10">
                Powered by  <span className="font-bold text-green-800">SheetBills</span> @sheetbills.com
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Status</h3>
                  <p className="text-sm text-gray-600">Successfully delivered</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent to:</span>
                  <span className="font-medium text-gray-900">{invoice.customer?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent at:</span>
                  <span className="font-medium text-gray-900">Just now</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => navigate('/invoices', { state: { invoiceToEdit: invoice }})}>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700">View Invoice Details</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Resend Email</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Customer will receive email notification</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Track when invoice is opened</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Receive payment notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="text-center mt-12">
          <button 
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 