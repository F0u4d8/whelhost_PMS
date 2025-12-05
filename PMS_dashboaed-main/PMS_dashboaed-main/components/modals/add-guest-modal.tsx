"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePMSStore } from "@/lib/store"
import { toast } from "sonner"

interface AddGuestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddGuestModal({ open, onOpenChange }: AddGuestModalProps) {
  const addGuest = usePMSStore((state) => state.addGuest)
  const [formData, setFormData] = useState({
    name: "",
    nationality: "سعودي",
    idType: "هوية وطنية",
    idNumber: "",
    phone: "",
    email: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.idNumber || !formData.phone) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة")
      return
    }

    addGuest({
      ...formData,
      reservations: 0,
    })

    toast.success("تم إضافة الضيف بنجاح")
    onOpenChange(false)
    setFormData({ name: "", nationality: "سعودي", idType: "هوية وطنية", idNumber: "", phone: "", email: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إضافة ضيف جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="محمد أحمد العلي"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">الجنسية</Label>
              <Select value={formData.nationality} onValueChange={(v) => setFormData({ ...formData, nationality: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سعودي">سعودي</SelectItem>
                  <SelectItem value="إماراتي">إماراتي</SelectItem>
                  <SelectItem value="كويتي">كويتي</SelectItem>
                  <SelectItem value="قطري">قطري</SelectItem>
                  <SelectItem value="بحريني">بحريني</SelectItem>
                  <SelectItem value="عماني">عماني</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idType">نوع الهوية</Label>
              <Select value={formData.idType} onValueChange={(v) => setFormData({ ...formData, idType: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="هوية وطنية">هوية وطنية</SelectItem>
                  <SelectItem value="جواز سفر">جواز سفر</SelectItem>
                  <SelectItem value="إقامة">إقامة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">رقم الهوية</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="1234567890"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966 50 123 4567"
                className="rounded-xl bg-background border-border"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@email.com"
                className="rounded-xl bg-background border-border"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl">
              إضافة الضيف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
