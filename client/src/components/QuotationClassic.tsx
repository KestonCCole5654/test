import { QuotationData, BusinessData } from "../pages/CreateQuotations/create-quotation"

interface QuotationClassicProps {
  quotationData: QuotationData
  businessData: BusinessData
}

export default function QuotationClassic({ quotationData, businessData }: QuotationClassicProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate item total
  const calculateItemTotal = (item: QuotationData['items'][0]) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price
    const quantity = item.quantity || 0
    const discountValue = typeof item.discount.value === 'string' ? parseFloat(item.discount.value) || 0 : item.discount.value
    const taxValue = typeof item.tax.value === 'string' ? parseFloat(item.tax.value) || 0 : item.tax.value

    let total = price * quantity

    // Apply discount
    if (item.discount.type === 'percentage') {
      total -= (total * discountValue) / 100
    } else {
      total -= discountValue
    }

    // Apply tax
    if (item.tax.type === 'percentage') {
      total += (total * taxValue) / 100
    } else {
      total += taxValue
    }

    return total
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
          <p className="text-gray-600">#{quotationData.quotationNumber}</p>
        </div>
        {businessData.logo && (
          <img src={businessData.logo} alt="Company Logo" className="h-16" />
        )}
      </div>

      {/* Business Info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{businessData.companyName}</h2>
        <p className="text-gray-600">{businessData.address}</p>
        <p className="text-gray-600">{businessData.phone}</p>
        <p className="text-gray-600">{businessData.email}</p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
          <p className="text-gray-900">{formatDate(quotationData.date)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Valid Until</h3>
          <p className="text-gray-900">{formatDate(quotationData.validUntil)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Bill To:</h3>
        <p className="text-gray-900 font-medium">{quotationData.customer.name}</p>
        <p className="text-gray-600">{quotationData.customer.address}</p>
        <p className="text-gray-600">{quotationData.customer.email}</p>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm font-medium text-gray-500">Item</th>
              <th className="text-left py-2 text-sm font-medium text-gray-500">Description</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Quantity</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Price</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-4 text-gray-900">{item.name}</td>
                <td className="py-4 text-gray-600">{item.description}</td>
                <td className="py-4 text-right text-gray-900">{item.quantity}</td>
                <td className="py-4 text-right text-gray-900">
                  ${formatCurrency(typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price)}
                </td>
                <td className="py-4 text-right text-gray-900">
                  ${formatCurrency(calculateItemTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${formatCurrency(quotationData.amount)}</span>
          </div>
          <div className="flex justify-between py-2 font-semibold">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">${formatCurrency(quotationData.amount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quotationData.notes && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Notes:</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{quotationData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p>This quotation is valid until {formatDate(quotationData.validUntil)}</p>
      </div>
    </div>
  )
} 