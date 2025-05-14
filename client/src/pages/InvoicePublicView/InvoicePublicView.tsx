import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { InvoiceClassic } from "../CreateInvoices/create-invoice";
import { LoadingSpinner } from "../../components/ui/loadingSpinner";
import { Card } from "../../components/ui/card";
import { InvoiceData, BusinessData } from "../CreateInvoices/create-invoice";

export default function InvoicePublicView() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const sheetUrl = searchParams.get("sheetUrl");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token || !sheetUrl) {
          setError("Invalid link: missing token or sheetUrl.");
          setLoading(false);
          return;
        }
        // 1. Get invoiceId from backend
        const idRes = await fetch(
          `/api/invoices/shared/${token}?sheetUrl=${encodeURIComponent(sheetUrl)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("google_token") || ""}` } }
        );
        if (!idRes.ok) throw new Error("Invalid or expired link.");
        const { invoiceId } = await idRes.json();
        // 2. Fetch invoice data from backend
        const invRes = await fetch(
          `/api/sheets/data?sheetUrl=${encodeURIComponent(sheetUrl)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("google_token") || ""}` } }
        );
        if (!invRes.ok) throw new Error("Failed to fetch invoice data.");
        const invoices = await invRes.json();
        const invoice = invoices.find((inv: any) => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
        if (!invoice) throw new Error("Invoice not found.");
        setInvoiceData(invoice);
        // Optionally fetch business data if needed
        setBusinessData({ companyName: "", email: "", phone: "", address: "" });
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [token, sheetUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        <div className="mt-4 text-gray-500">Loading invoice...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <div className="text-red-600 font-bold mb-2">Error</div>
          <div className="text-gray-700">{error}</div>
        </Card>
      </div>
    );
  }
  if (!invoiceData || !businessData) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-3xl">
        <InvoiceClassic data={invoiceData} businessData={businessData} showShadow={true} />
      </div>
    </div>
  );
} 