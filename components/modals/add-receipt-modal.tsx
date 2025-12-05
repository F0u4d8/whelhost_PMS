"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Receipt } from "@/lib/receipts-server-actions"
import { getReservationsPageData } from "@/lib/reservations-server-actions"

interface AddReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddReceipt?: (receiptData: Omit<Receipt, 'id' | 'createdAt'>) => Promise<void>
  defaultValues?: Partial<Omit<Receipt, 'id' | 'createdAt' | 'date'>>
}

export function AddReceiptModal({ open, onOpenChange, onAddReceipt, defaultValues }: AddReceiptModalProps) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: defaultValues?.amount?.toString() || "",
    method: defaultValues?.method || "نقدي",
    reservationNumber: defaultValues?.reservationNumber || "-",
    notes: defaultValues?.notes || "",
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
      // Set form data based on default values if provided, otherwise reset
      if (defaultValues) {
        setFormData({
          type: defaultValues.type || "income",
          amount: defaultValues.amount?.toString() || "",
          method: defaultValues.method || "نقدي",
          reservationNumber: defaultValues.reservationNumber || "-",
          notes: defaultValues.notes || "",
        });
      } else {
        // Reset form when modal opens
        setFormData({ type: "income", amount: "", method: "نقدي", reservationNumber: "-", notes: "" });
      }
    }
  }, [open, defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error("الرجاء إدخال المبلغ");
      return;
    }

    try {
      if (onAddReceipt) {
        const receiptData: Omit<Receipt, 'id' | 'createdAt'> = {
          date: new Date().toISOString().split("T")[0],
          type: formData.type,
          amount: Number(formData.amount),
          method: formData.method,
          reservationNumber: formData.reservationNumber === "-" ? "" : formData.reservationNumber,
          notes: formData.notes,
          user: "Current User", // This will be replaced by the server with the actual user
        };

        await onAddReceipt(receiptData);
        toast.success(formData.type === "income" ? "تم إضافة سند القبض بنجاح" : "تم إضافة سند الصرف بنجاح");
        onOpenChange(false);
        setFormData({ type: "income", amount: "", method: "نقدي", reservationNumber: "-", notes: "" });
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast.error("حدث خطأ أثناء إضافة السند");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إضافة سند جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع السند</Label>
              <Select
                value={formData.type}
                onValueChange={(v: "income" | "expense") => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">سند قبض (إيرادات)</SelectItem>
                  <SelectItem value="expense">سند صرف (مصروفات)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                className="rounded-xl bg-background border-border"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                  <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم الحجز</Label>
              <Select
                value={formData.reservationNumber}
                onValueChange={(v) => setFormData({ ...formData, reservationNumber: v })}
              >
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">بدون حجز</SelectItem>
                  {reservations.map((res) => (
                    <SelectItem key={res.id} value={res.id}>
                      {res.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل ملاحظات إضافية..."
              className="rounded-xl bg-background border-border resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isLoading}>
              إضافة السند
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
