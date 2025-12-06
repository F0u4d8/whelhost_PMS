"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { usePMSStore } from "@/lib/store"
import { Reservation } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Eye, Calendar, User, CreditCard, Coins, Building, Hash, MapPin } from "lucide-react"

interface ViewReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationId: string | null
}

export function ViewReservationModal({ open, onOpenChange, reservationId }: ViewReservationModalProps) {
  const { reservations, guests } = usePMSStore()

  // Find the reservation directly - no state needed since data is already in store
  const reservation = reservationId ? reservations.find(r => r.id === reservationId) || null : null
  const guest = reservation ? guests.find(g => g.name === reservation.guest) : null

  if (!reservationId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            تفاصيل الحجز
          </DialogTitle>
        </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Reservation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  {reservation.id}
                </h3>
                <p className="text-muted-foreground text-sm">
                  تم إنشاء الحجز في {reservation.date}
                </p>
              </div>

              <Badge className={cn(
                "rounded-full px-4 py-1 text-sm",
                reservation.status === "active" && "bg-primary/20 text-primary border-primary/30",
                reservation.status === "paid" && "bg-success/20 text-success border-success/30",
                reservation.status === "upcoming" && "bg-warning/20 text-warning border-warning/30",
                reservation.status === "completed" && "bg-muted text-muted-foreground border-border",
                reservation.status === "cancelled" && "bg-destructive/20 text-destructive border-destructive/30"
              )}>
                {reservation.status === "active" && "نشط"}
                {reservation.status === "paid" && "مدفوع"}
                {reservation.status === "upcoming" && "قائم"}
                {reservation.status === "completed" && "مكتمل"}
                {reservation.status === "cancelled" && "ملغي"}
              </Badge>
            </div>

            {/* Reservation Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">الفترة</span>
                </div>
                <p className="font-medium">
                  {reservation.checkIn} - {reservation.checkOut}
                </p>
                <p className="text-sm text-muted-foreground">{reservation.nights} ليالي</p>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">الوحدة</span>
                </div>
                <p className="font-medium">{reservation.unit}</p>
                <p className="text-sm text-muted-foreground">رقم الوحدة</p>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">الضيف</span>
                </div>
                <p className="font-medium">{reservation.guest}</p>
                <p className="text-sm text-muted-foreground">اسم الضيف</p>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm">السعر</span>
                </div>
                <p className="font-medium">{reservation.total} ر.س</p>
                <p className="text-sm text-muted-foreground">إجمالي الحجز</p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                معلومات الضيف
              </h4>

              {guest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                    <p className="font-medium">{guest.name}</p>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">الجنسية</p>
                    <p className="font-medium">{guest.nationality}</p>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">نوع الهوية</p>
                    <p className="font-medium">{guest.idType}</p>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">رقم الهوية</p>
                    <p className="font-medium">{guest.idNumber}</p>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-xl md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                    <p className="font-medium">{guest.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 text-muted" />
                  <p>لم يتم العثور على معلومات الضيف</p>
                </div>
              )}
            </div>

            {/* Reservation Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                تفاصيل الحجز
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">سعر الليلة</p>
                  <p className="font-medium">{reservation.pricePerNight} ر.س</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">القناة</p>
                  <p className="font-medium">{reservation.channel || "مباشر"}</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">المدفوع</p>
                  <p className="font-medium text-success">{reservation.paid} ر.س</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">المتبقي</p>
                  <p className={cn(
                    "font-medium",
                    reservation.balance > 0 ? "text-destructive" : "text-success"
                  )}>
                    {reservation.balance} ر.س
                  </p>
                </div>
              </div>

              {reservation.externalId && (
                <div className="bg-secondary/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">رقم الحجز الخارجي</p>
                  <p className="font-medium">{reservation.externalId}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                إغلاق
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">
                <CreditCard className="h-4 w-4 ml-2" />
                إدارة الدفع
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">لم يتم العثور على الحجز</h3>
            <p className="text-muted-foreground">الحجز المطلوب غير متوفر أو قد تم حذفه.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}