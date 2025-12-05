"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePMSStore } from "@/lib/store"
import { toast } from "sonner"

interface AddPaymentLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentLinkModal({ open, onOpenChange }: AddPaymentLinkModalProps) {
  const addPaymentLink = usePMSStore((state) => state.addPaymentLink)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiresIn: "7",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة")
      return
    }

    const today = new Date()
    const expiresAt = new Date(today)
    expiresAt.setDate(expiresAt.getDate() + Number(formData.expiresIn))

    addPaymentLink({
      createdAt: today.toISOString().split("T")[0],
      amount: Number(formData.amount),
      description: formData.description,
      status: "active",
      expiresAt: expiresAt.toISOString().split("T")[0],
      url: `https://pay.pms.com/pl-${Date.now()}`,
    })

    toast.success("تم إنشاء رابط الدفع بنجاح")
    onOpenChange(false)
    setFormData({ amount: "", description: "", expiresIn: "7" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إنشاء رابط دفع جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>المبلغ (ر.س)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="2000"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="حجز وحدة 101..."
              className="rounded-xl bg-background border-border resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>صلاحية الرابط (أيام)</Label>
            <Input
              type="number"
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
              placeholder="7"
              min="1"
              max="30"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl">
              إنشاء الرابط
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
