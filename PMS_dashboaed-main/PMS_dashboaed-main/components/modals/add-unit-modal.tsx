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

interface AddUnitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUnitModal({ open, onOpenChange }: AddUnitModalProps) {
  const addUnit = usePMSStore((state) => state.addUnit)
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "room",
    floor: "1",
    pricePerNight: "",
    status: "vacant" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number || !formData.name) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة")
      return
    }

    addUnit({
      number: formData.number,
      name: formData.name,
      type: formData.type,
      floor: formData.floor,
      pricePerNight: Number(formData.pricePerNight),
      status: formData.status,
    })

    toast.success("تم إضافة الوحدة بنجاح")
    onOpenChange(false)
    setFormData({ number: "", name: "", type: "room", floor: "1", pricePerNight: "", status: "vacant" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إضافة وحدة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">رقم الوحدة</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="101"
                className="rounded-xl bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">الطابق</Label>
              <Select value={formData.floor} onValueChange={(v) => setFormData({ ...formData, floor: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">الطابق الأول</SelectItem>
                  <SelectItem value="2">الطابق الثاني</SelectItem>
                  <SelectItem value="3">الطابق الثالث</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">اسم الوحدة</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="جناح ديلوكس"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">نوع الوحدة</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite">جناح</SelectItem>
                  <SelectItem value="room">غرفة</SelectItem>
                  <SelectItem value="studio">استوديو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر / ليلة</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                placeholder="500"
                className="rounded-xl bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="rounded-xl">
              إضافة الوحدة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
