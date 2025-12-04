'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Calendar,
  CreditCard,
  Download,
  Printer,
  Share2,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { BillingEntryForm } from './billing-entry-form';

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  source: string;
  status: string;
  created_at: string;
  unit?: {
    name: string;
  };
  guest?: {
    first_name: string;
    last_name: string;
  };
  hotel?: {
    currency: string;
  };
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  reference?: string;
  notes?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

interface InvoiceItemProps {
  hotelId: string;
  currency: string;
  startDate: string;
  endDate: string;
  bookings: Booking[];
  payments: Payment[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
}

export default function BillingReportsClient({ 
  hotelId, 
  currency, 
  startDate, 
  endDate, 
  bookings, 
  payments, 
  invoices, 
  invoiceItems 
}: InvoiceItemProps) {
  // Calculate statistics
  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalInvoices = invoices?.length || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  const totalInvoiceRevenue = invoices
    ?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

  const totalPayments = payments.length;
  const successfulPayments = payments.filter(p => p.status === "completed").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const failedPayments = payments.filter(p => p.status === "failed").length;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle download as PDF functionality
  const handleDownloadPDF = () => {
    window.print();
  };

  // Handle download as CSV functionality
  const handleDownloadCSV = () => {
    // Create CSV content for invoices
    const headers = ['Invoice Number', 'Date', 'Amount', 'Status', 'Guest'];
    const rows = (invoices || []).map(invoice => {
      return [
        invoice.invoice_number,
        formatDate(invoice.created_at),
        invoice.total_amount,
        invoice.status,
        'N/A' // Guest information would need to be joined
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `billing-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Billing Reports',
        text: `Billing reports for hotel from ${startDate} to ${endDate}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report URL copied to clipboard!');
    }
  };

  // Handle entry added callback
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleEntryAdded = () => {
    setReloadTrigger(prev => prev + 1); // Trigger a re-render to update data
  };

  useEffect(() => {
    if (reloadTrigger > 0) {
      // Instead of window.location.reload(), we could implement a more elegant solution
      // For now, this will cause a page refresh when an entry is added
      window.location.reload();
    }
  }, [reloadTrigger]);

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Billing Reports</h1>
          <p className="text-muted-foreground">Detailed view of all billing transactions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoiceRevenue.toLocaleString()} {currency}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All invoices created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments + failedPayments}</div>
            <p className="text-xs text-muted-foreground">Pending/Failed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add New Billing Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BillingEntryForm
            hotelId={hotelId}
            currency={currency}
            onEntryAdded={handleEntryAdded}
          />
        </CardContent>
      </Card>

      {/* Invoice Items Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing Entries
            </CardTitle>
            <p className="text-sm text-muted-foreground">All billing entries for the selected period</p>
          </div>
        </CardHeader>
        <CardContent>
          {invoiceItems.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No billing entries</h3>
              <p className="text-muted-foreground">No billing entries found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.map((item) => {
                    const invoice = invoices?.find(inv => inv.id === item.invoice_id);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {invoice?.invoice_number || 'N/A'}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit_price} {currency}</TableCell>
                        <TableCell>{item.total_price} {currency}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
            <p className="text-sm text-muted-foreground">All invoices for the selected period</p>
          </div>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No invoices found</h3>
              <p className="text-muted-foreground">No invoices found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>{invoice.total_amount} {currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invoice.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}