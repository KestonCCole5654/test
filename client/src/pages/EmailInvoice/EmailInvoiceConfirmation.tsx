import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function EmailInvoiceConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;

  function formatCurrency(amount: number): string {
    return amount?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00";
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-onest">
        <h2 className="text-xl font-bold mb-2">No invoice data found</h2>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-onest py-8">
      {/* Animated Checkmark SVG */}
      <div className="mb-6">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="46" fill="#e6f9ed" stroke="#16a34a" strokeWidth="4" />
          <path
            d="M30 50l14 14 22-22"
            fill="none"
            stroke="#16a34a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-800 mb-2">Invoice Sent!</h2>
      <p className="mb-6 text-gray-600">Your invoice was sent successfully to the customer.</p>
      {/* Invoice Preview */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mb-8">
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
          From: {invoice.businessEmail}<br />
          To: {invoice.customer?.email}
        </div>
        <div className="flex items-center gap-3 mb-2">
          {invoice.logo && (
            <img
              src={invoice.logo}
              alt="Company Logo"
              className="h-10 w-auto object-contain"
              style={{ background: "none", boxShadow: "none" }}
            />
          )}
          <div className="font-normal text-lg">Invoice #{invoice.invoiceNumber || invoice.id}</div>
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
          <div className="text-xs text-gray-500 mb-1 mt-5">
            DUE {invoice.dueDate || "—"}
          </div>
        </div>
        <div className="text-sm whitespace-pre-line mb-2">
          {invoice.notes || "Thank you for your business!"}
        </div>
        <div className="text-sm text-center font-onest text-gray-400 mt-5 mb-2">
          Powered by <span className="font-bold text-green-800">SheetBills</span> @sheetbills.com
        </div>
      </div>
      <Button className="bg-green-800 text-white" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
    </div>
  );
} 