import React, { useState, useEffect } from "react";
import LogoUpload from "./LogoUpload";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Types for props
interface InvoiceItem {
  name: string;
  description: string;
  
  quantity: number;
  price: number | string;
  discount: {
    type: "percentage" | "fixed";
    value: number | string;
  };
  tax: {
    type: "percentage" | "fixed";
    value: number | string;
  };
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: InvoiceItem[];
  amount: number;
  notes: string;
  template: "classic";
  status?: "Paid" | "Pending";
  color?: string;
}

interface BusinessData {
  companyName: string;
  phone: string;
  address: string;
  email: string;
  logo?: string;
}

interface InvoiceClassicProps {
  data: InvoiceData;
  businessData: BusinessData;
  showShadow?: boolean;
  onBusinessDataUpdate?: (updatedData: BusinessData) => void;
}

const InvoiceClassic: React.FC<InvoiceClassicProps> = ({ 
  data, 
  businessData: initialBusinessData, 
  showShadow = true,
  onBusinessDataUpdate 
}) => {
  const [businessData, setBusinessData] = useState<BusinessData>(initialBusinessData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if business data is loaded
    if (initialBusinessData && initialBusinessData.companyName) {
      setBusinessData(initialBusinessData);
      setIsLoading(false);
    }
  }, [initialBusinessData]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-800"></div>
      <span className="text-sm text-gray-500">Loading business details...</span>
    </div>
  );

  // Calculate all amounts
  const calculateItemTotal = (item: InvoiceItem) => {
    const price = item.price === "" ? 0 : Number(item.price);
    const quantity = item.quantity;
    const subtotal = price * quantity;

    // Calculate discount
    let discount = 0;
    if (item.discount.value && item.discount.value !== "") {
      if (item.discount.type === "percentage") {
        discount = (subtotal * Number(item.discount.value)) / 100;
      } else {
        discount = Number(item.discount.value);
      }
    }

    // Calculate tax
    let tax = 0;
    if (item.tax.value && item.tax.value !== "") {
      const afterDiscount = subtotal - discount;
      if (item.tax.type === "percentage") {
        tax = (afterDiscount * Number(item.tax.value)) / 100;
      } else {
        tax = Number(item.tax.value);
      }
    }

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    };
  };

  const itemTotals = data.items.map(calculateItemTotal);
  const subtotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = itemTotals.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = itemTotals.reduce((sum, item) => sum + item.tax, 0);
  const total = subtotal - totalDiscount + totalTax;

  // Format date to show month name, day and year
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    // Parse as local date (not UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Format currency
  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div
      className={`bg-white w-full font-cal max-w-full box-border flex flex-col justify-start${showShadow ? ' shadow-md' : ''} pb-8`}
      style={{ minHeight: 'auto', margin: 0 }}
    >
      {/* Color strip at the top */}
      <div className="w-full h-2" style={{ backgroundColor: data.color || '#166534' }}></div>
      
      {/* Header with logo */}
      <div className="flex justify-between mt-6 items-start mb-8 px-6">
        <div>
          <h1 className="text-2xl font-onest font-semibold" style={{ color: data.color || '#166534' }}>INVOICE</h1>
          <div className="space-y-2 mt-2">
            <p className="text-sm font-onest font-light text-gray-500">Invoice number: {data.invoiceNumber}</p>
            <p className="text-sm font-onest font-light text-gray-500">Invoice Created: {formatDate(data.date)}</p>
          </div>
        </div>

        {/* Logo on the right side */}
        <div className="flex flex-col items-end">
          {isLoading ? (
            <LoadingSpinner />
          ) : businessData.logo ? (
            <img 
              src={businessData.logo} 
              alt="Company Logo" 
              className="h-20 w-auto object-contain"
            />
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">No logo uploaded</p>
              <LogoUpload 
                onLogoUploaded={async (url) => {
                  try {
                    // Get the current session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.provider_token) {
                      throw new Error("Google authentication required");
                    }

                    // Get the sheet URL from localStorage
                    const sheetUrl = localStorage.getItem("defaultSheetUrl");
                    if (!sheetUrl) {
                      throw new Error("Sheet URL not found");
                    }

                    // Update business details with the new logo URL
                    const response = await axios.put(
                      "https://sheetbills-server.vercel.app/api/update-business-details",
                      {
                        logo: url,
                        sheetUrl: sheetUrl
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${session.provider_token}`,
                          "X-Supabase-Token": session.access_token
                        }
                      }
                    );

                    if (response.data.success) {
                      // Update local state
                      const updatedBusinessData = {
                        ...businessData,
                        logo: url
                      };
                      setBusinessData(updatedBusinessData);
                      
                      // Notify parent component if callback exists
                      if (onBusinessDataUpdate) {
                        onBusinessDataUpdate(updatedBusinessData);
                      }
                    }
                  } catch (error) {
                    console.error("Failed to update logo:", error);
                  }
                }}
                showPreview={false}
                className="max-w-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Business and Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 px-6">
        <div>
          <h2 className="text-sm font-cal font-medium uppercase mb-2" style={{ color: data.color || '#166534' }}>From</h2>
          <div className="space-y-2">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="font-cal font-medium text-sm">{businessData.companyName || "Company Name Not Set"}</p>
                <p className="font-cal font-medium text-sm">{businessData.email || "Email Not Set"}</p>
                <p className="font-cal font-medium text-sm">{businessData.address || "Address Not Set"}</p>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-sm font-cal font-medium uppercase mb-2" style={{ color: data.color || '#166534' }}>Bill To</h2>
            <div className="space-y-2">
              <p className="font-cal font-medium text-sm">{data.customer.name}</p>
              <p className="font-cal font-medium text-sm">{data.customer.email}</p>
              <p className="font-cal font-medium text-sm whitespace-pre-line">{data.customer.address}</p>
            </div>
          </div>
        </div>

        
      </div>

      {/* Due amount row - now full width, outside the grid */}
      <div className="mt-2 font-medium w-full px-6 pb-5 mb-5 ">
        <p className="text-xl md:text-1xl" style={{ color: data.color || '#166534' }}>
          ${formatCurrency(total)} due <span className="pl-1">{formatDate(data.dueDate)}</span>
        </p>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto font-cal w-full px-6 mb-6">
        <table className="w-full font-cal max-w-full text-sm">
          <thead style={{ backgroundColor: data.color || '#166534' }} className="text-white">
            <tr className="border-b font-semibold">
              <th className="py-2 px-3 first:pl-4 last:pr-4 text-left font-cal font-medium text-sm text-white">Item</th>
              <th className="py-2 px-3 first:pl-4 last:pr-4 text-left font-cal font-medium text-sm text-white">Description</th>
              <th className="py-2 px-3 first:pl-4 last:pr-4 text-right font-cal font-medium text-sm text-white">Qty</th>
              <th className="py-2 px-3 first:pl-4 last:pr-4 text-right font-cal font-medium text-sm text-white">Price</th>
              <th className="py-2 px-3 first:pl-4 last:pr-4 text-right font-cal font-medium text-sm text-white">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y font-cal divide-gray-200">
            {data.items.map((item, i) => (
              <tr key={i} className="text-gray-900">
                <td className="py-2 px-3 first:pl-4 last:pr-4 text-left break-words">{item.name || `Item ${i + 1}`}</td>
                <td className="py-2 px-3 first:pl-4 last:pr-4 text-left break-words text-sm">{item.description}</td>
                <td className="py-2 px-3 first:pl-4 last:pr-4 text-right">{item.quantity}</td>
                <td className="py-2 px-3 first:pl-4 last:pr-4 text-right">
                  ${formatCurrency(item.price === "" ? 0 : Number(item.price))}
                </td>
                <td className="py-2 px-3 first:pl-4 last:pr-4 text-right font-cal font-medium">
                  ${formatCurrency(calculateItemTotal(item).total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals - Fixed right alignment */}
      <div className="w-full mt-6 px-6">
        <div className="float-right w-full md:w-1/2">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 px-2 text-right text-gray-600 text-sm">Subtotal</td>
                <td className="py-2 px-2 text-right font-medium text-sm">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-right text-gray-600 text-sm">Discount</td>
                <td className="py-2 px-2 text-right font-medium text-gray-800 text-sm">-${formatCurrency(totalDiscount)}</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-right text-gray-600 text-sm">Tax</td>
                <td className="py-2 px-2 text-right font-medium text-gray-800 text-sm">+${formatCurrency(totalTax)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-3 px-2 text-right font-bold text-base" style={{ color: data.color || '#166534' }}>Total</td>
                <td className="py-3 px-2 text-right font-bold text-lg" style={{ color: data.color || '#166534' }}>${formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="clear-both mt-4 pt-2 px-4">
          <h2 className="text-sm font-semibold uppercase mb-1" style={{ color: data.color || '#166534' }}>Notes</h2>
          <p className="text-gray-600 text-sm whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Footer with branding */}
      <div className="mt-8 p-4 border-t text-center flex justify-center border-gray-200">
        <div className="text-center text-sm text-gray-500">
          Powered by <span className="font-medium" style={{ color: data.color || '#166534' }}>SheetBills</span> @sheetbills.com
        </div>
      </div>

    </div>
  );
};

export default InvoiceClassic;