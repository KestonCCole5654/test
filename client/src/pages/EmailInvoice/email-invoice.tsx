"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "../../components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import axios from "axios";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Calendar, Download } from "lucide-react";

interface EmailData {
  to: string;
  from: string;
  subject: string;
  message: string;
}

interface BusinessData {
  companyName: string;
  phone: string;
  address: string;
  email: string;
  logo?: string;
}

export default function EmailInvoice() {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const location = useLocation();
  const invoice = location.state?.invoice;
  const supabase = useSupabaseClient();
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    logo: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) {
          throw new Error("Google authentication required");
        }
        const sheetUrl = localStorage.getItem("defaultSheetUrl");
        if (!sheetUrl) {
          throw new Error("No invoice spreadsheet selected");
        }
        const response = await axios.get("https://sheetbills-server.vercel.app/api/business-details", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
          params: { sheetUrl },
        });
        if (response.data.businessDetails) {
          setBusinessData({
            companyName: response.data.businessDetails["Company Name"] || "",
            email: response.data.businessDetails["Business Email"] || "",
            phone: response.data.businessDetails["Phone Number"] || "",
            address: response.data.businessDetails["Address"] || "",
            logo: response.data.businessDetails["Logo"] || "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch business details from Google Sheet.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinessDetails();
  }, [supabase, toast]);

  // Always call hooks first!
  const [emailData, setEmailData] = useState<EmailData>(() => {
    const businessEmail = invoice?.businessEmail || "";
    const companyName = invoice?.companyName || "";
    const customerEmail = invoice?.customer?.email || "";
    const customerName = invoice?.customer?.name || "";
    return {
      to: customerEmail,
      from: businessEmail,
      subject: `Invoice #: ${invoiceId || invoice?.invoiceNumber || ""}`,
      message: `Dear ${customerName},\n\nWe appreciate your business. Please find your invoice details here. Feel free to contact us if you have any questions.`,
    };
  });

  if (!invoice) {
    return (
      <div className="min-h-screen font-onest flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">No invoice data found</h2>
          <p className="mb-4">Please return to the dashboard and try again.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const businessEmail = invoice.businessEmail || "";
  const companyName = invoice.companyName || "";
  const customerEmail = invoice.customer?.email || "";
  const customerName = invoice.customer?.name || "";
  const amount = invoice.amount || 0;
  const dueDate = invoice.dueDate || "";
  const invoiceDate = invoice.date || "";

  const handleSend = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        throw new Error("Google authentication required");
      }

      const sheetUrl = localStorage.getItem("defaultSheetUrl");
      if (!sheetUrl) {
        throw new Error("No invoice spreadsheet selected");
      }

      const response = await axios.post(
        "https://sheetbills-server.vercel.app/api/send-invoice-email",
        {
          invoiceId: invoiceId || invoice?.invoiceNumber,
          sheetUrl
        },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "X-Supabase-Token": session.access_token,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Invoice email has been sent successfully.",
        });
        navigate('/email-invoice/confirmation', { state: { invoice } });
      } else {
        throw new Error(response.data.error || "Failed to send invoice email");
      }
    } catch (error) {
      console.error("Error sending invoice email:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invoice email",
        variant: "destructive",
      });
    }
  };

  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="w-full max-w-7xl bg-gray-50/50 font-onest flex flex-col md:flex-row gap-8  items-stretch md:items-center">

     

      {/* Left: Email Form */}
      <div className="flex-1 flex items-center justify-center min-w-0 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-left mb-1">Send Invoice</h1>
          <p className="text-sm text-gray-500 font-normal text-left mb-6">
            You can send this invoice to your customer via WhatsApp, email, or SMS. 
          </p>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                value={emailData.from}
                onChange={(e) =>
                  setEmailData({ ...emailData, from: e.target.value })
                }
                placeholder="your@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={emailData.to}
                onChange={(e) =>
                  setEmailData({ ...emailData, to: e.target.value })
                }
                placeholder="recipient@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Body</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) =>
                  setEmailData({ ...emailData, message: e.target.value })
                }
                className="min-h-[120px]"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-green-800 text-white">Send Invoice</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast({ title: 'WhatsApp', description: 'Pretend to send via WhatsApp!' })}>
                  Send via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSend}>
                  Send via Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: 'SMS', description: 'Pretend to send via SMS!' })}>
                  Send via SMS
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Right: Invoice Preview */}
      <div className="flex-1 min-w-0 pt-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {(invoice.logo || invoice.companyLogo) && (
                  <div className="w-12 h-12 bg-white rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={invoice.logo || invoice.companyLogo}
                      alt="Company Logo"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{invoice.companyName}</h2>
                  <p className="text-slate-300 text-sm">{invoice.businessEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300">Invoice</div>
                <div className="text-lg font-semibold">#{invoice.invoiceNumber}</div>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-8">
            {/* Recipient Info */}
            <div className="mb-8">
              <div className="text-sm text-gray-500 mb-2">Bill To:</div>
              <div className="font-semibold text-gray-900">{invoice.customer?.name || 'Customer'}</div>
              <div className="text-gray-600">{invoice.customer?.email}</div>
            </div>

            {/* Amount Section with Download Button */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 mb-8 border border-emerald-200">
              <div className="text-center">
                <div className="text-sm text-emerald-700 font-medium mb-2">Total Amount Due</div>
                <div className="text-4xl font-bold text-emerald-800 mb-4">
                  ${formatCurrency(amount)}
                </div>
                <div className="inline-flex items-center text-sm text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Due: {invoice.dueDate}
                </div>
                
                {/* View/Download Invoice Button */}
                <div className="mt-4">
                  <button 
                    onClick={() => window.print()}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View/Download Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Notes:</div>
                <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {invoice.notes}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <div className="text-sm text-gray-500">
                Powered by <span className="font-semibold text-emerald-700">SheetBills</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">@sheetbills.com</div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
