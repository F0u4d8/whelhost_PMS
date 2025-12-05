"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePMSStore, type Unit } from "@/lib/store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UnitStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit | null
}

const statuses = [
  { value: "vacant", label: "شاغر", color: "bg-success/20 text-success border-success/30" },
  { value: "occupied", label: "مشغول", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "out-of-service", label: "خارج الخدمة", color: "bg-destructive/20 text-destructive border-destructive/30" },
  { value: "departure-today", label: "مغادرة اليوم", color: "bg-warning/20 text-warning border-warning/30" },
  { value: "arrival-today", label: "وصول اليوم", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
] as const

export function UnitStatusModal({ open, onOpenChange, unit }: UnitStatusModalProps) {
  const updateUnit = usePMSStore((state) => state.updateUnit)

  const handleStatusChange = (status: Unit["status"]) => {
    if (unit) {
      updateUnit(unit.id, { status })
      toast.success(`تم تغيير حالة الوحدة ${unit.number} إلى ${statuses.find((s) => s.value === status)?.label}`)
      onOpenChange(false)
    }
  }

  if (!unit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">تغيير حالة الوحدة {unit.number}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {statuses.map((status) => (
            <Button
              key={status.value}
              variant="outline"
              className={cn(
                "justify-start rounded-xl h-12 border-2 transition-all",
                unit.status === status.value ? status.color : "bg-transparent hover:bg-muted/50",
              )}
              onClick={() => handleStatusChange(status.value)}
            >
              <div className={cn("w-3 h-3 rounded-full mr-3", status.color.replace("text-", "bg-").split(" ")[0])} />
              {status.label}
              {unit.status === status.value && <span className="mr-auto text-xs opacity-70">الحالة الحالية</span>}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
