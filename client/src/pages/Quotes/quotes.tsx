import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { format } from 'date-fns';

interface Quote {
  quote_id: string;
  quote_number: string;
  quote_date: Date;
  valid_until: Date;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';
  customer_name: string;
  total_amount: number;
}

export default function Quotes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Implement quotes fetching logic
    // For now, using mock data
    setQuotes([
      {
        quote_id: '1',
        quote_number: 'Q-2024-001',
        quote_date: new Date(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Draft',
        customer_name: 'John Doe',
        total_amount: 1500.00
      },
      {
        quote_id: '2',
        quote_number: 'Q-2024-002',
        quote_date: new Date(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Sent',
        customer_name: 'Jane Smith',
        total_amount: 2750.00
      }
    ]);
    setLoading(false);
  }, []);

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      // TODO: Implement quote to invoice conversion logic
      toast({
        title: 'Success',
        description: 'Quote converted to invoice successfully',
      });
      navigate('/invoices');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert quote to invoice',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quotes</CardTitle>
            <Button onClick={() => navigate('/create-quote')}>Create Quote</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.quote_id}>
                  <TableCell>{quote.quote_number}</TableCell>
                  <TableCell>{format(quote.quote_date, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(quote.valid_until, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{quote.customer_name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${quote.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConvertToInvoice(quote.quote_id)}
                      disabled={quote.status !== 'Accepted'}
                    >
                      Convert to Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 