import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { DatePicker } from '../../components/ui/date-picker';
import { useToast } from '../../components/ui/use-toast';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

interface QuoteData {
  quoteNumber: string;
  quoteDate: Date;
  validUntil: Date;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
  notes: string;
}

export default function CreateQuote() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quoteData, setQuoteData] = useState<QuoteData>({
    quoteNumber: "",
    quoteDate: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paymentTerms: "Net 30",
    notes: "",
  });

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      total: 0,
    };
    setQuoteData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteData((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate total
          const total = calculateItemTotal(updatedItem);
          return { ...updatedItem, total };
        }
        return item;
      });

      // Recalculate quote totals
      const subtotal = calculateSubtotal(updatedItems);
      const tax = calculateTax(subtotal, quoteData.discount);
      const total = calculateTotal(subtotal, quoteData.discount, tax);

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const calculateItemTotal = (item: QuoteItem): number => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const discountAmount = (itemSubtotal * item.discount) / 100;
    const afterDiscount = itemSubtotal - discountAmount;
    const taxAmount = (afterDiscount * item.taxRate) / 100;
    return afterDiscount + taxAmount;
  };

  const calculateSubtotal = (items: QuoteItem[]): number => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number, discount: number): number => {
    const afterDiscount = subtotal - (subtotal * discount) / 100;
    return afterDiscount * 0.1; // Assuming 10% tax rate
  };

  const calculateTotal = (subtotal: number, discount: number, tax: number): number => {
    const afterDiscount = subtotal - (subtotal * discount) / 100;
    return afterDiscount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement quote creation logic
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
      navigate("/quotes");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quoteNumber">Quote Number</Label>
                <Input
                  id="quoteNumber"
                  value={quoteData.quoteNumber}
                  onChange={(e) =>
                    setQuoteData((prev) => ({
                      ...prev,
                      quoteNumber: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quoteDate">Quote Date</Label>
                <DatePicker
                  date={quoteData.quoteDate}
                  onSelect={(date: Date) =>
                    setQuoteData((prev) => ({
                      ...prev,
                      quoteDate: date,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <DatePicker
                  date={quoteData.validUntil}
                  onSelect={(date: Date) =>
                    setQuoteData((prev) => ({
                      ...prev,
                      validUntil: date,
                    }))
                  }
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={quoteData.customerName}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={quoteData.customerEmail}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={quoteData.customerAddress}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        customerAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Quote Items</h3>
                <Button type="button" onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
              {quoteData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", parseInt(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, "unitPrice", parseFloat(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(item.id, "discount", parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(item.id, "taxRate", parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select
                    value={quoteData.paymentTerms}
                    onValueChange={(value) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        paymentTerms: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={quoteData.notes}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <div className="text-right space-y-2">
                  <p>Subtotal: ${quoteData.subtotal.toFixed(2)}</p>
                  <p>Tax: ${quoteData.tax.toFixed(2)}</p>
                  <p className="font-bold">Total: ${quoteData.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/quotes")}
              >
                Cancel
              </Button>
              <Button type="submit">Create Quote</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 