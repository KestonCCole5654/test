import React from "react";

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
}

const InvoiceClassic: React.FC<InvoiceClassicProps> = ({ data, businessData, showShadow = true }) => {
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
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
      className={`bg-white w-full font-cal max-w-full box-border flex flex-col justify-start${showShadow ? ' shadow-md' : ''}`}
      style={{ 
        minHeight: 'auto',
        maxHeight: '100%',
        margin: 0,
        padding: '1cm'
      }}
    >
      {/* Header with logo */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-cal-sans font-semibold text-green-800">INVOICE</h1>
          <div className="space-y-1 mt-1">
            <p className="text-sm font-cal-sans font-light text-gray-500">Invoice number: {data.invoiceNumber}</p>
            <p className="text-sm font-cal font-light text-gray-500">Invoice Created: {formatDate(data.date)}</p>
          </div>
        </div>
      </div>

      {/* Business and Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <h2 className="text-sm font-cal font-medium text-green-800 uppercase mb-1">From</h2>
          <div className="space-y-0.5">
            <p className="font-cal font-medium">{businessData.companyName || "Loading Company Details..."}</p>
            <p className="font-cal font-medium">{businessData.email || "contact@company.com"}</p>
            <p className="font-cal font-medium">{businessData.address || "123 Business St"}</p>
          </div>
        </div>

        <div>
          <div className="mb-2">
            <h2 className="text-sm font-cal font-medium text-green-800 uppercase mb-1">Bill To</h2>
            <div className="space-y-0.5">
              <p className="font-cal font-medium">{data.customer.name}</p>
              <p className="font-cal font-medium">{data.customer.email}</p>
              <p className="font-cal font-medium whitespace-pre-line">{data.customer.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto font-cal w-full mb-4">
        <table className="w-full font-cal max-w-full text-sm">
          <thead className="bg-green-800 text-white">
            <tr className="border-b font-semibold">
              <th className="py-2 px-4 first:pl-4 last:pr-4 text-left font-cal font-medium text-base text-green-100">Item</th>
              <th className="py-2 px-4 first:pl-4 last:pr-4 text-left font-cal font-medium text-base text-green-100">Description</th>
              <th className="py-2 px-4 first:pl-4 last:pr-4 text-right font-cal font-medium text-base text-green-100">Qty</th>
              <th className="py-2 px-4 first:pl-4 last:pr-4 text-right font-cal font-medium text-base text-green-100">Price</th>
              <th className="py-2 px-4 first:pl-4 last:pr-4 text-right font-cal font-medium text-base text-green-100">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="text-gray-900">
                <td className="py-2 px-4 first:pl-4 last:pr-4 text-left break-words">{item.name || `Item ${i + 1}`}</td>
                <td className="py-2 px-4 first:pl-4 last:pr-4 text-left break-words">{item.description}</td>
                <td className="py-2 px-4 first:pl-4 last:pr-4 text-right">{item.quantity}</td>
                <td className="py-2 px-4 first:pl-4 last:pr-4 text-right">
                  ${formatCurrency(item.price === "" ? 0 : Number(item.price))}
                </td>
                <td className="py-2 px-4 first:pl-4 last:pr-4 text-right font-cal font-medium">
                  ${formatCurrency(calculateItemTotal(item).total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="float-right w-full md:w-1/2 mb-4">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-1 px-2 text-right text-gray-600">Subtotal</td>
              <td className="py-1 px-2 text-right font-medium">${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 text-right text-gray-600">Discount</td>
              <td className="py-1 px-2 text-right font-medium text-gray-800">-${formatCurrency(totalDiscount)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 text-right text-gray-600">Tax</td>
              <td className="py-1 px-2 text-right font-medium text-gray-800">+${formatCurrency(totalTax)}</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 px-2 text-right font-bold text-green-800">Total</td>
              <td className="py-2 px-2 text-right font-bold text-lg text-green-800">${formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="clear-both mt-4 pt-4">
          <h2 className="text-sm font-semibold text-green-800 uppercase mb-1">Notes</h2>
          <p className="text-gray-600 whitespace-pre-line text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceClassic; 