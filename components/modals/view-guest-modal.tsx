"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Guest } from "@/lib/store"
import { User, Phone, Mail, CreditCard, Flag, CalendarDays } from "lucide-react"

interface ViewGuestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
}

export function ViewGuestModal({ open, onOpenChange, guest }: ViewGuestModalProps) {
  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            بيانات الضيف
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-xl font-bold text-foreground">{guest.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Flag className="w-4 h-4" />
              <span>{guest.nationality}</span>
            </div>
          </div>

          {/* ID Info */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{guest.idType}</p>
              <p className="font-mono font-medium">{guest.idNumber}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="text-sm font-medium" dir="ltr">
                  {guest.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">البريد</p>
                <p className="text-sm font-medium truncate">{guest.email}</p>
              </div>
            </div>
          </div>

          {/* Reservations Count */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/30">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="text-foreground">إجمالي الحجوزات</span>
            </div>
            <span className="text-2xl font-bold text-primary">{guest.reservations}</span>
          </div>
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full">
          إغلاق
        </Button>
      </DialogContent>
    </Dialog>
  )
}
