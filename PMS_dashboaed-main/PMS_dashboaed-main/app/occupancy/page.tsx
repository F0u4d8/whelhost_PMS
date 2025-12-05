"use client"

import { useState, useMemo } from "react"
import { usePMSStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/main-layout"

export default function OccupancyPage() {
  const { units, reservations, addReservation, guests } = usePMSStore()
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15))
  const [selectedCell, setSelectedCell] = useState<{ unitId: string; date: string } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    guest: "",
    checkIn: "",
    checkOut: "",
    pricePerNight: 0,
  })

  // Generate days for the calendar view (14 days)
  const days = useMemo(() => {
    const result = []
    for (let i = 0; i < 14; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() + i)
      result.push(date)
    }
    return result
  }, [currentDate])

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatDayHeader = (date: Date) => {
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    return {
      day: date.getDate(),
      weekday: dayNames[date.getDay()],
      month: date.toLocaleDateString("ar-SA", { month: "short" }),
    }
  }

  const getReservationForCell = (unitNumber: string, date: Date) => {
    const dateStr = formatDate(date)
    return reservations.find(
      (r) => r.unit === unitNumber && r.status !== "cancelled" && dateStr >= r.checkIn && dateStr < r.checkOut,
    )
  }

  const isCheckIn = (unitNumber: string, date: Date) => {
    const dateStr = formatDate(date)
    return reservations.some((r) => r.unit === unitNumber && r.checkIn === dateStr && r.status !== "cancelled")
  }

  const isCheckOut = (unitNumber: string, date: Date) => {
    const dateStr = formatDate(date)
    return reservations.some((r) => r.unit === unitNumber && r.checkOut === dateStr && r.status !== "cancelled")
  }

  const handleCellClick = (unit: (typeof units)[0], date: Date) => {
    const reservation = getReservationForCell(unit.number, date)
    if (!reservation) {
      setSelectedCell({ unitId: unit.id, date: formatDate(date) })
      setFormData({
        guest: "",
        checkIn: formatDate(date),
        checkOut: "",
        pricePerNight: unit.pricePerNight || 0,
      })
      setIsAddModalOpen(true)
    }
  }

  const handleAddReservation = () => {
    const unit = units.find((u) => u.id === selectedCell?.unitId)
    if (!unit || !formData.guest || !formData.checkIn || !formData.checkOut) return

    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const total = nights * formData.pricePerNight

    addReservation({
      date: new Date().toISOString().split("T")[0],
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights,
      unit: unit.number,
      guest: formData.guest,
      pricePerNight: formData.pricePerNight,
      total,
      paid: 0,
      balance: total,
      status: "upcoming",
      channel: "direct",
    })

    setIsAddModalOpen(false)
    setSelectedCell(null)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const channelColors: Record<string, string> = {
    direct: "bg-primary",
    booking: "bg-blue-500",
    airbnb: "bg-rose-500",
    expedia: "bg-yellow-500",
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تقويم الإشغال</h1>
          <p className="text-muted-foreground">عرض وإدارة حجوزات الوحدات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date(2024, 0, 15))}>
            اليوم
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>مباشر</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>Booking.com</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500" />
          <span>Airbnb</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span>متاح</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Row */}
            <div className="grid grid-cols-[120px_repeat(14,1fr)] border-b border-border">
              <div className="p-3 bg-secondary/50 border-l border-border">
                <span className="text-sm font-medium">الوحدة</span>
              </div>
              {days.map((date) => {
                const { day, weekday, month } = formatDayHeader(date)
                const isToday = formatDate(date) === formatDate(new Date(2024, 0, 18))
                return (
                  <div
                    key={date.toISOString()}
                    className={cn("p-2 text-center border-l border-border", isToday && "bg-primary/10")}
                  >
                    <div className="text-xs text-muted-foreground">{weekday}</div>
                    <div className={cn("text-lg font-semibold", isToday && "text-primary")}>{day}</div>
                    <div className="text-xs text-muted-foreground">{month}</div>
                  </div>
                )
              })}
            </div>

            {/* Unit Rows */}
            {units.map((unit) => (
              <div
                key={unit.id}
                className="grid grid-cols-[120px_repeat(14,1fr)] border-b border-border last:border-b-0"
              >
                <div className="p-3 bg-secondary/30 border-l border-border">
                  <div className="font-medium text-sm">{unit.number}</div>
                  <div className="text-xs text-muted-foreground truncate">{unit.name}</div>
                </div>
                {days.map((date) => {
                  const reservation = getReservationForCell(unit.number, date)
                  const checkIn = isCheckIn(unit.number, date)
                  const checkOut = isCheckOut(unit.number, date)

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "relative h-16 border-l border-border cursor-pointer hover:bg-secondary/50 transition-colors",
                        !reservation && "bg-secondary/10",
                      )}
                      onClick={() => handleCellClick(unit, date)}
                    >
                      {reservation && (
                        <div
                          className={cn(
                            "absolute inset-y-2 flex items-center justify-center text-white text-xs font-medium",
                            channelColors[reservation.channel || "direct"] || "bg-primary",
                            checkIn ? "right-0 left-0 rounded-r-md mr-1" : "right-0",
                            checkOut ? "left-0 rounded-l-md ml-1" : "left-0",
                          )}
                          style={{
                            right: checkIn ? "4px" : "0",
                            left: checkOut ? "4px" : "0",
                          }}
                        >
                          {checkIn && <span className="truncate px-2">{reservation.guest.split(" ")[0]}</span>}
                        </div>
                      )}
                      {!reservation && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Reservation Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة حجز جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الضيف</Label>
              <Select value={formData.guest} onValueChange={(value) => setFormData({ ...formData, guest: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الضيف" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.name}>
                      {guest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الوصول</Label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ المغادرة</Label>
                <Input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>السعر لليلة</Label>
              <Input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddReservation}>إضافة الحجز</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
