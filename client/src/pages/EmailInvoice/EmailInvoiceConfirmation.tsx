import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Check, Mail, ArrowLeft, FileText, Calendar, DollarSign, Download } from 'lucide-react';

export default function EmailInvoiceConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;
  const shareableLink = location.state?.shareableLink;

  console.log('Invoice data in EmailInvoiceConfirmation:', invoice);
  console.log('Shareable link in EmailInvoiceConfirmation:', shareableLink);

  const subject = location.state?.subject || `${invoice.companyName} INVOICE #: ${invoice.invoiceNumber || invoice.id || ''}`;
  const from = location.state?.from || invoice.businessEmail;

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-transperent border-b border-gray-200 ">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button 
            onClick={handleBackToDashboard}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Success Banner */}
        <div className="text-center mb-5">
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
            Congratulations, your invoice has been delivered to <span className="font-semibold text-emerald-700">{invoice.customer?.email}</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-4xl bg-gray-50/50 font-onest flex flex-col md:flex-row gap-8 items-stretch md:items-center">
          {/* Invoice Preview */}
          <div className="flex-1 min-w-0 pt-10">
            <div className="bg-transparent w-full mx-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 48px)" }}>
              {/* Company Logo */}
              {(invoice.logo || invoice.companyLogo) && (
                <img
                  src={invoice.logo || invoice.companyLogo}
                  alt="Company Logo"
                  className="h-12 w-auto object-contain mb-4"
                  style={{ background: 'none', boxShadow: 'none', border: 'none' }}
                />
              )}
              <div className="text-xs text-gray-500 mb-2 border-b border-gray-200 pb-2">
               
                To: {invoice.customer?.email}
                <br />
                <span className="block mt-1">Subject: {subject}</span>
              </div>

              <div className="text-green-800 font-medium text-xl mb-2 text-left">
                {invoice.companyName}
              </div>

              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center mb-4">
                <div className="text-xs text-gray-500 mt-5 mb-5">
                  INVOICE # {invoice.invoiceNumber || invoice.id || "—"}
                </div>

                <div className="text-3xl font-medium text-gray-800 mb-2">
                  ${formatCurrency(invoice.amount)}
                </div>

                <Button
                  variant="default"
                  className="bg-gray-800 text-white px-6 py-2 mb-1"
                  size="sm"
                  onClick={() => shareableLink && window.open(shareableLink, '_blank')}
                  disabled={!shareableLink}
                >
                  View/Print Invoice
                </Button>

                <div className="text-xs text-gray-500 mb-1 mt-5">
                  DUE {invoice.dueDate}
                </div>
              </div>

              <div className="text-sm whitespace-pre-line mb-2">
                {invoice.message || `Dear ${invoice.customer?.name || "Customer"},

                Thank you for doing business with us. Feel free to contact us if you have any questions.`}
              </div>

              <div className="text-sm text-center font-onest text-gray-400 mt-5 mb-10">
                Powered by <span className="font-bold text-green-800">SheetBills</span> @sheetbills.com
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6"></div>
        </div>

        
      </div>
    </div>
  );
} 