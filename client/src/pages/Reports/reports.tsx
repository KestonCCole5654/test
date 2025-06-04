import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';

interface Invoice {
  invoiceNumber: string;
  date: string;
  customer: { name: string; email: string; address: string };
  amount: number;
  tax: { type: string; value: number };
  items: any[];
  status: string;
}

const ReportsPage: React.FC = () => {
  const supabase = useSupabaseClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  // Fetch invoices on mount
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) throw new Error('Google authentication required');
        const sheetUrl = localStorage.getItem('defaultSheetUrl');
        if (!sheetUrl) throw new Error('No invoice spreadsheet selected');
        const response = await axios.get('https://sheetbills-server.vercel.app/api/sheets/data', {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            'X-Supabase-Token': session.access_token,
          },
          params: { sheetUrl },
        });
        setInvoices(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [supabase]);

  // Filter invoices by date range
  const filteredInvoices = invoices.filter(inv => {
    if (!dateRange.from && !dateRange.to) return true;
    const invDate = new Date(inv.date);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    if (from && invDate < from) return false;
    if (to && invDate > to) return false;
    return true;
  });

  // Calculate total tax
  const totalTax = filteredInvoices.reduce((sum, inv) => {
    if (inv.tax && typeof inv.tax.value === 'number') {
      return sum + inv.tax.value;
    }
    return sum;
  }, 0);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tax Report</h2>
        <p className="text-gray-600 mb-4">View total tax collected for your invoices. Select a date range to filter the report.</p>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading invoices...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <span className="font-semibold">Total Tax Collected:</span>{' '}
              <span className="text-green-800 font-bold">${totalTax.toFixed(2)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-green-800 text-white">
                  <tr>
                    <th className="px-3 py-2">Invoice #</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Tax</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => (
                    <tr key={inv.invoiceNumber} className="border-b">
                      <td className="px-3 py-2">{inv.invoiceNumber}</td>
                      <td className="px-3 py-2">{inv.date}</td>
                      <td className="px-3 py-2">{inv.customer?.name || ''}</td>
                      <td className="px-3 py-2">${inv.amount.toFixed(2)}</td>
                      <td className="px-3 py-2">${inv.tax?.value?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 py-2">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 