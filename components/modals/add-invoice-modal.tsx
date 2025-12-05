"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Invoice } from "@/lib/invoices-server-actions"
import { getReservationsPageData } from "@/lib/reservations-server-actions"

interface AddInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInvoice?: (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>
}

const VAT_RATE = 0.15

export function AddInvoiceModal({ open, onOpenChange, onAddInvoice }: AddInvoiceModalProps) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reservation: "",
    subtotal: "",
  })

  // Load reservations when the modal opens
  useEffect(() => {
    if (open) {
      const loadReservations = async () => {
        setIsLoading(true);
        try {
          const pageData = await getReservationsPageData();
          setReservations(pageData.reservations);
        } catch (error) {
          console.error("Error loading reservations:", error);
          toast.error("حدث خطأ أثناء تحميل الحجوزات");
        } finally {
          setIsLoading(false);
        }
      }

      loadReservations();
      // Reset form when modal opens
      setFormData({ reservation: "", subtotal: "" });
    }
  }, [open]);

  const selectedReservation = reservations.find((r) => r.id === formData.reservation);
  const subtotal = Number(formData.subtotal || selectedReservation?.total || 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reservation) {
      toast.error("الرجاء اختيار الحجز");
      return;
    }

    try {
      if (onAddInvoice) {
        const invoiceData: Omit<Invoice, 'id' | 'createdAt'> = {
          date: new Date().toISOString().split("T")[0],
          guest: selectedReservation?.guest || "Guest",
          contractNumber: formData.reservation,
          subtotal,
          vat,
          total,
          status: "pending",
        };

        await onAddInvoice(invoiceData);
        toast.success("تم إنشاء الفاتورة بنجاح");
        onOpenChange(false);
        setFormData({ reservation: "", subtotal: "" });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("حدث خطأ أثناء إنشاء الفاتورة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إنشاء فاتورة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>رقم الحجز</Label>
            <Select
              value={formData.reservation}
              onValueChange={(v) => {
                const res = reservations.find((r) => r.id === v);
                setFormData({ ...formData, reservation: v, subtotal: String(res?.total || "") });
              }}
            >
              <SelectTrigger className="rounded-xl bg-background border-border">
                <SelectValue placeholder="اختر الحجز" />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.id} - {res.guest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المبلغ قبل الضريبة</Label>
            <Input
              type="number"
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
              placeholder="2000"
              className="rounded-xl bg-background border-border"
              disabled={isLoading}
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المبلغ قبل الضريبة</span>
              <span className="font-medium">{subtotal.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
              <span className="font-medium">{vat.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="font-medium">الإجمالي</span>
              <span className="font-bold text-primary">{total.toLocaleString()} ر.س</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isLoading}>
              إنشاء الفاتورة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
