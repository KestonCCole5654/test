import { supabase } from '@/lib/supabase';

export interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface Quote {
  quote_id: string;
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

export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
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
  quote_id?: string;
}

export const quoteService = {
  async createQuote(quote: Omit<Quote, 'quote_id'>): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('quote_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getQuoteById(quoteId: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_id', quoteId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('quote_id', quoteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async convertToInvoice(quoteId: string): Promise<Invoice> {
    // 1. Get the quote
    const quote = await this.getQuoteById(quoteId);

    // 2. Validate quote can be converted
    if (quote.status !== 'Accepted') {
      throw new Error('Only accepted quotes can be converted to invoices');
    }

    // 3. Create invoice from quote
    const invoice: Omit<Invoice, 'invoice_id'> = {
      invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      invoice_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'Draft',
      customer_id: quote.customer_id,
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_address: quote.customer_address,
      items: quote.items,
      subtotal: quote.subtotal,
      discount_type: quote.discount_type,
      discount_value: quote.discount_value,
      discount_amount: quote.discount_amount,
      tax_amount: quote.tax_amount,
      total_amount: quote.total_amount,
      payment_terms: quote.payment_terms,
      notes: quote.notes,
      quote_id: quote.quote_id
    };

    // 4. Insert the new invoice
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 5. Update quote status
    await this.updateQuote(quoteId, { status: 'Converted' });

    return newInvoice;
  },

  async deleteQuote(quoteId: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('quote_id', quoteId);

    if (error) throw error;
  }
}; 