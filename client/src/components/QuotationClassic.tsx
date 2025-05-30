import { QuotationData } from "../pages/CreateQuotations/create-quotation"

interface BusinessData {
  companyName: string
  phone: string
  address: string
  email: string
  logo: string
}

interface QuotationClassicProps {
  quotationData: QuotationData
  businessData: BusinessData
}

export default function QuotationClassic({ quotationData, businessData }: QuotationClassicProps) {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate item total
  const calculateItemTotal = (item: QuotationData["items"][0]): number => {
    const price = typeof item.price === "string" ? parseFloat(item.price) || 0 : item.price
    const quantity = item.quantity || 0
    let total = price * quantity

    // Apply discount
    if (item.discount.value) {
      const discountValue = typeof item.discount.value === "string" ? parseFloat(item.discount.value) || 0 : item.discount.value
      if (item.discount.type === "percentage") {
        total -= (total * discountValue) / 100
      } else {
        total -= discountValue
      }
    }

    // Apply tax
    if (item.tax.value) {
      const taxValue = typeof item.tax.value === "string" ? parseFloat(item.tax.value) || 0 : item.tax.value
      if (item.tax.type === "percentage") {
        total += (total * taxValue) / 100
      } else {
        total += taxValue
      }
    }

    return total
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QUOTATION</h1>
          <p className="text-sm text-gray-500">Quotation #{quotationData.quotationNumber}</p>
        </div>
        {businessData.logo && (
          <img src={businessData.logo} alt="Company Logo" className="h-16 object-contain" />
        )}
      </div>

      {/* Business and Client Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">From:</h2>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{businessData.companyName}</p>
            <p>{businessData.address}</p>
            <p>{businessData.phone}</p>
            <p>{businessData.email}</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">To:</h2>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{quotationData.customer.name}</p>
            <p>{quotationData.customer.address}</p>
            <p>{quotationData.customer.email}</p>
          </div>
        </div>
      </div>

      {/* Quotation Details */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-sm font-medium">{formatDate(quotationData.date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Valid Until</p>
          <p className="text-sm font-medium">{formatDate(quotationData.validUntil)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-sm font-medium">{quotationData.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-500">Item</th>
              <th className="text-left py-2 text-sm font-medium text-gray-500">Description</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Quantity</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Price</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 text-sm">{item.name}</td>
                <td className="py-3 text-sm text-gray-500">{item.description}</td>
                <td className="py-3 text-sm text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-right">${formatCurrency(typeof item.price === "string" ? parseFloat(item.price) || 0 : item.price)}</td>
                <td className="py-3 text-sm text-right">${formatCurrency(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium">${formatCurrency(quotationData.amount)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-bold">${formatCurrency(quotationData.amount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quotationData.notes && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotationData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>This is a computer-generated quotation. No signature is required.</p>
        <p className="mt-1">Thank you for your business!</p>
      </div>
    </div>
  )
} 