import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/components/ui/use-toast';

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

interface QuoteData {
  quote_number: string;
  quote_date: Date;
  valid_until: Date;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  items: QuoteItem[];
  subtotal: number;
  discount_type: 'Percentage' | 'Fixed';
  discount_value: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_terms: string;
  notes: string;
}

export default function CreateQuote() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [quoteData, setQuoteData] = useState<QuoteData>({
    quote_number: '',
    quote_date: new Date(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'Draft',
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    items: [],
    subtotal: 0,
    discount_type: 'Percentage',
    discount_value: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 0,
    payment_terms: 'Net 30',
    notes: ''
  });

  const handleAddItem = () => {
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        tax_rate: 0,
        total: 0
      }]
    }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...quoteData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: calculateItemTotal(newItems[index])
    };

    setQuoteData(prev => ({
      ...prev,
      items: newItems,
      subtotal: calculateSubtotal(newItems),
      discount_amount: calculateDiscount(newItems, prev.discount_type, prev.discount_value),
      tax_amount: calculateTax(newItems),
      total_amount: calculateTotal(newItems, prev.discount_type, prev.discount_value)
    }));
  };

  const calculateItemTotal = (item: QuoteItem) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * item.tax_rate) / 100;
    return afterDiscount + tax;
  };

  const calculateSubtotal = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateDiscount = (items: QuoteItem[], type: 'Percentage' | 'Fixed', value: number) => {
    const subtotal = calculateSubtotal(items);
    return type === 'Percentage' ? (subtotal * value) / 100 : value;
  };

  const calculateTax = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const afterDiscount = itemSubtotal - itemDiscount;
      return sum + (afterDiscount * item.tax_rate) / 100;
    }, 0);
  };

  const calculateTotal = (items: QuoteItem[], discountType: 'Percentage' | 'Fixed', discountValue: number) => {
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(items, discountType, discountValue);
    const tax = calculateTax(items);
    return subtotal - discount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement quote creation logic
      toast({
        title: "Quote created successfully",
        description: "Your quote has been saved and is ready to be sent.",
      });
      navigate('/quotes');
    } catch (error) {
      toast({
        title: "Error creating quote",
        description: "There was a problem creating your quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote_number">Quote Number</Label>
                  <Input
                    id="quote_number"
                    value={quoteData.quote_number}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, quote_number: e.target.value }))}
                    placeholder="Q-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={quoteData.status}
                    onValueChange={(value) => setQuoteData(prev => ({ ...prev, status: value as QuoteData['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quote Date</Label>
                  <DatePicker
                    date={quoteData.quote_date}
                    onSelect={(date) => setQuoteData(prev => ({ ...prev, quote_date: date }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <DatePicker
                    date={quoteData.valid_until}
                    onSelect={(date) => setQuoteData(prev => ({ ...prev, valid_until: date }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={quoteData.customer_name}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, customer_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={quoteData.customer_email}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="customer_address">Address</Label>
                  <Textarea
                    id="customer_address"
                    value={quoteData.customer_address}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, customer_address: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quoteData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={item.tax_rate}
                        onChange={(e) => handleItemChange(index, 'tax_rate', Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={handleAddItem} variant="outline">
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={quoteData.discount_type}
                    onValueChange={(value) => setQuoteData(prev => ({ ...prev, discount_type: value as 'Percentage' | 'Fixed' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    value={quoteData.discount_value}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={quoteData.payment_terms}
                    onValueChange={(value) => setQuoteData(prev => ({ ...prev, payment_terms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Net 90">Net 90</SelectItem>
                      <SelectItem value="50% Advance">50% Advance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${quoteData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>${quoteData.discount_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${quoteData.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${quoteData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/quotes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 