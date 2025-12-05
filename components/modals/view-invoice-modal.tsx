"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Invoice } from "@/lib/invoices-server-actions"
import { FileText, Calendar, User, Receipt, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ViewInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

const statusConfig = {
  paid: { label: "مدفوعة", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "معلقة", className: "bg-warning/20 text-warning border-warning/30" },
  overdue: { label: "متأخرة", className: "bg-destructive/20 text-destructive border-destructive/30" },
}

export function ViewInvoiceModal({ open, onOpenChange, invoice }: ViewInvoiceModalProps) {
  if (!invoice) return null

  const status = statusConfig[invoice.status]

  const handlePrint = () => {
    toast.success("جاري تحضير الفاتورة للطباعة...")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              فاتورة {invoice.id}
            </div>
            <Badge variant="outline" className={cn("rounded-full", status.className)}>
              {status.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">التاريخ</p>
                <p className="font-medium">{invoice.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
              <Receipt className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">رقم العقد</p>
                <p className="font-mono font-medium">{invoice.contractNumber}</p>
              </div>
            </div>
          </div>

          {/* Guest */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">الضيف</p>
              <p className="font-medium">{invoice.guest}</p>
            </div>
          </div>

          {/* Amounts */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المبلغ قبل الضريبة</span>
              <span className="font-medium">{invoice.subtotal.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
              <span className="font-medium">{invoice.vat.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="font-bold text-foreground">الإجمالي</span>
              <span className="font-bold text-primary text-xl">{invoice.total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl flex-1">
            إغلاق
          </Button>
          <Button onClick={handlePrint} className="rounded-xl flex-1 gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
