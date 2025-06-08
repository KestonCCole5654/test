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
    const amount = invoice?.amount || 0;
    const dueDate = invoice?.dueDate || "";
    const invoiceDate = invoice?.date || "";
    return {
      to: customerEmail,
      from: businessEmail,
      subject: `Invoice #: ${invoiceId || invoice?.invoiceNumber || ""}`,
      message: `Dear ${customerName},\n\nWe appreciate your business. Please find your invoice details here. Feel free to contact us if you have any questions.\n\nInvoice Date: ${invoiceDate}\nSubtotal: $${amount}\nDue date: ${dueDate}`,
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

  const handleSend = () => {
    toast({
      title: "Email Sent",
      description: "The invoice email has been sent (simulated).",
      variant: "default",
    });
    navigate(-1);
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
                <DropdownMenuItem onClick={() => toast({ title: 'Email', description: 'Pretend to send via Email!' })}>
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
        <div
          className="bg-transparent w-full mx-auto overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 48px)" }}
        >
          {/* Company Logo */}
          { (invoice.logo || invoice.companyLogo || businessData.logo) && (
            <img
              src={invoice.logo || invoice.companyLogo || businessData.logo}
              alt="Company Logo"
              className="h-12 w-auto object-contain mb-4"
              style={{ background: 'none', boxShadow: 'none', border: 'none' }}
            />
          )}
          <div className="text-xs text-gray-500 mb-2 border-b border-gray-200 pb-2">
            From: {emailData.from}
            <br />
            To: {emailData.to}
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
            <div className="font-normal text-lg">{emailData.subject}</div>
          </div>

          <div className="text-green-800 font-medium text-xl mb-2 text-left">
            {companyName}
          </div>


          <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center mb-4">
            
            <div className="text-xs text-gray-500 mt-5 mb-5">
              INVOICE # {invoiceId || "—"}
            </div>

            <div className="text-3xl font-medium text-gray-800 mb-2">
              ${formatCurrency(amount)}
            </div>

            <Button
              variant="default"
              className="bg-gray-800 text-white px-6 py-2 mb-1"
              size="sm"
              onClick={() => window.print()}
            >
              View/Print Invoice 
            </Button>

            <div className="text-xs text-gray-500 mb-1 mt-5">
              DUE {dueDate || "—"}
            </div>
       
          </div>


          <div className="text-sm whitespace-pre-line mb-2">
            {emailData.message}
          </div>

          <div className="text-sm text-center font-onest text-gray-400 mt-5 mb-10">
            Powered by  <span className="font-bold text-green-800">SheetBills</span> @sheetbills.com
          </div>

        </div>
      </div>

      
    </div>
  );
}
