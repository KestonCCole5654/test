import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      // TODO: Implement API call to fetch quotes
      // For now, using mock data
      const mockQuotes: Quote[] = [
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
          total_amount: 2500.00
        }
      ];
      setQuotes(mockQuotes);
    } catch (error) {
      toast({
        title: "Error fetching quotes",
        description: "There was a problem loading your quotes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      // TODO: Implement conversion logic
      toast({
        title: "Quote converted successfully",
        description: "The quote has been converted to an invoice.",
      });
      navigate('/invoices');
    } catch (error) {
      toast({
        title: "Error converting quote",
        description: "There was a problem converting the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Sent: 'bg-blue-100 text-blue-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Converted: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Button onClick={() => navigate('/quotes/create')}>
          Create New Quote
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
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
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.quote_id}>
                  <TableCell>{quote.quote_number}</TableCell>
                  <TableCell>{format(quote.quote_date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(quote.valid_until, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{quote.customer_name}</TableCell>
                  <TableCell>${quote.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quotes/${quote.quote_id}`)}
                      >
                        View
                      </Button>
                      {quote.status === 'Accepted' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConvertToInvoice(quote.quote_id)}
                        >
                          Convert to Invoice
                        </Button>
                      )}
                    </div>
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