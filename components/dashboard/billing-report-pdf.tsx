import { Invoice, InvoiceItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BillingReportPDFProps {
  invoices: Invoice[];
  hotelName: string;
  period: { start: string; end: string };
  currency: string;
}

export function BillingReportPDF({ 
  invoices, 
  hotelName, 
  period, 
  currency 
}: BillingReportPDFProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing Report</h1>
          <p className="text-gray-600">Hotel: {hotelName}</p>
          <p className="text-gray-600">Period: {formatDate(period.start)} to {formatDate(period.end)}</p>
          <div className="mt-8 text-gray-500">
            <p>No invoices found for the selected period.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  const totalReceived = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Report</h1>
        <p className="text-lg text-gray-700">Hotel: {hotelName}</p>
        <p className="text-gray-600">Period: {formatDate(period.start)} to {formatDate(period.end)}</p>
        <div className="mt-4 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Invoices</p>
            <p className="text-xl font-bold">{invoices.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount, currency)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Invoice #</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{invoice.invoice_number}</td>
                <td className="border border-gray-300 px-4 py-2">{formatDate(invoice.created_at)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {invoice.notes || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(invoice.total_amount || 0, currency)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {invoice.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Total:</span>
              <span className="font-bold">{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p className="mt-2">This report is confidential and intended solely for the addressee.</p>
      </div>
    </div>
  );
}