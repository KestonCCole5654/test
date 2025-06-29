import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/card";
import InvoiceClassic from "../../components/InvoiceClassic";

// You can import your InvoiceClassic component if you want to reuse the design
// import { InvoiceClassic } from "../CreateInvoices/create-invoice";

export default function PublicInvoice() {
  const { token } = useParams();
  const location = useLocation();
  const [invoice, setInvoice] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract sheetUrl from query string
  const query = new URLSearchParams(location.search);
  const sheetUrl = query.get("sheetUrl");

  useEffect(() => {
    async function fetchInvoice() {
      setLoading(true);
      setError(null);
      setInvoice(null);
      setBusinessData(null);
      if (!token || !sheetUrl) {
        setError("Missing token or sheetUrl");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `https://sheetbills-server.vercel.app/api/invoices/shared/${token}?sheetUrl=${encodeURIComponent(sheetUrl)}`
        );
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch invoice");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setInvoice(data.invoice);
        setBusinessData(data.businessData || {});
      } catch (err) {
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [token, sheetUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center font-onest justify-center bg-gray-50 py-8 px-2">
      <Card className="w-full max-w-4xl">
        
        {loading && <div className="text-center text-gray-500">Loading Invoice from link ...</div>}
        {error && (
          <div className="text-center text-red-600 mb-4">{error}</div>
        )}
        {invoice && (
          <div className="bg-white font-onest p-6">
            <InvoiceClassic data={invoice} businessData={businessData || {}} showShadow={false} />
          </div>
        )}
     
      </Card>
  
    </div>
  );
} 