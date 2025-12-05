"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Invoice, addInvoice as addInvoiceAction } from "@/lib/invoices-server-actions";
import { deleteInvoice as deleteInvoiceAction } from "@/lib/invoices-server-actions";
import { AddInvoiceModal } from "@/components/modals/add-invoice-modal";
import { ViewInvoiceModal } from "@/components/modals/view-invoice-modal";
import { AddReceiptModal } from "@/components/modals/add-receipt-modal";
import { Toaster, toast } from "sonner";

interface InvoicesClientProps {
  initialInvoices: Invoice[];
}

const statusConfig = {
  paid: { label: "مدفوعة", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "معلقة", className: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "متأخرة", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function InvoicesClient({ initialInvoices }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addReceiptModalOpen, setAddReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.guest.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoiceAction(id);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      toast.success("تم حذف الفاتورة بنجاح");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("حدث خطأ أثناء حذف الفاتورة");
    }
  };

  const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
      // Ensure the date is properly formatted
      const formattedInvoiceData = {
        ...invoiceData,
        date: invoiceData.date || new Date().toISOString().split('T')[0],
      };

      const newInvoice = await addInvoiceAction(formattedInvoiceData);

      setInvoices([...invoices, newInvoice]);
      setAddModalOpen(false);
      toast.success("تم إنشاء الفاتورة بنجاح");
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast.error("حدث خطأ أثناء إنشاء الفاتورة");
    }
  };

  const handleAddReceiptForInvoice = async (invoice: Invoice) => {
    // Set up default receipt data based on the invoice
    const receiptData = {
      type: "income" as const,
      amount: invoice.total,
      method: "نقدي", // Default payment method
      reservationNumber: invoice.contractNumber,
      notes: `سند قبض لفاتورة ${invoice.id}`,
    };

    setSelectedInvoiceForReceipt(receiptData);
    setAddReceiptModalOpen(true);
  };

  const handleAddReceiptFromInvoice = async (receiptData: any) => {
    try {
      // We need to import the receipt functions dynamically
      const { addReceipt } = await import("@/lib/receipts-server-actions");
      // Use the receiptData that's passed from the modal, not the selectedInvoiceForReceipt
      const newReceipt = await addReceipt(receiptData);

      toast.success("تم إنشاء السند بنجاح");
      setAddReceiptModalOpen(false);
      setSelectedInvoiceForReceipt(null);
    } catch (error) {
      console.error("Error adding receipt from invoice:", error);
      toast.error("حدث خطأ أثناء إنشاء السند");
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-center" richColors />

      <main className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الفواتير</h1>
            <p className="text-muted-foreground mt-1">إدارة الفواتير الضريبية</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            إنشاء فاتورة
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الفاتورة أو العقد..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="pending">معلقة</SelectItem>
              <SelectItem value="overdue">متأخرة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">معاينة</TableHead>
                <TableHead className="text-right text-muted-foreground">رقم الفاتورة</TableHead>
                <TableHead className="text-right text-muted-foreground">التاريخ</TableHead>
                <TableHead className="text-right text-muted-foreground">الضيف</TableHead>
                <TableHead className="text-right text-muted-foreground">رقم العقد</TableHead>
                <TableHead className="text-right text-muted-foreground">المبلغ</TableHead>
                <TableHead className="text-right text-muted-foreground">الضريبة</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجمالي</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig];
                return (
                  <TableRow key={invoice.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleView(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{invoice.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell>{invoice.guest}</TableCell>
                    <TableCell className="font-mono text-sm">{invoice.contractNumber}</TableCell>
                    <TableCell>{invoice.subtotal.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.vat.toLocaleString()} ر.س</TableCell>
                    <TableCell className="font-medium">{invoice.total.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <AddInvoiceModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddInvoice={handleAddInvoice}
      />
      <ViewInvoiceModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        invoice={selectedInvoice}
        onAddReceiptForInvoice={selectedInvoice ? handleAddReceiptForInvoice : undefined}
      />

      {addReceiptModalOpen && selectedInvoiceForReceipt && (
        <AddReceiptModal
          open={addReceiptModalOpen}
          onOpenChange={(open) => {
            setAddReceiptModalOpen(open);
            if (!open) setSelectedInvoiceForReceipt(null);
          }}
          onAddReceipt={handleAddReceiptFromInvoice}
          defaultValues={selectedInvoiceForReceipt}
        />
      )}
    </MainLayout>
  );
}