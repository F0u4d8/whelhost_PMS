"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePMSStore } from "@/lib/store"
import { toast } from "sonner"

interface AddReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddReceiptModal({ open, onOpenChange }: AddReceiptModalProps) {
  const { addReceipt, reservations } = usePMSStore()
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    method: "نقدي",
    reservationNumber: "-",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount) {
      toast.error("الرجاء إدخال المبلغ")
      return
    }

    const now = new Date()
    const dateStr = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`

    addReceipt({
      date: dateStr,
      type: formData.type,
      amount: Number(formData.amount),
      method: formData.method,
      reservationNumber: formData.reservationNumber,
      notes: formData.notes,
      user: "المستخدم الحالي",
    })

    toast.success(formData.type === "income" ? "تم إضافة سند القبض بنجاح" : "تم إضافة سند الصرف بنجاح")
    onOpenChange(false)
    setFormData({ type: "income", amount: "", method: "نقدي", reservationNumber: "-", notes: "" })
  }

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
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl">
              إضافة السند
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
