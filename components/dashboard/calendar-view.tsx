"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Unit, Booking, Guest } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  units: (Unit & { room_type?: { name: string } | null })[]
  bookings: (Booking & { guest?: Guest | null })[]
}

const statusColors = {
  pending: "bg-warning/80",
  confirmed: "bg-primary/80",
  checked_in: "bg-success/80",
  checked_out: "bg-muted",
  cancelled: "bg-destructive/50",
  no_show: "bg-destructive/50",
}

export function CalendarView({ units, bookings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInView = 14

  const dates = useMemo(() => {
    const startDate = new Date(currentDate)
    return Array.from({ length: daysInView }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date
    })
  }, [currentDate])

  const getBookingsForUnit = (unitId: string) => {
    return bookings.filter((b) => b.unit_id === unitId)
  }

  const isDateInRange = (date: Date, checkIn: string, checkOut: string) => {
    const d = date.toISOString().split("T")[0]
    return d >= checkIn && d < checkOut
  }

  const getBookingForDate = (unitId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return bookings.find((b) => b.unit_id === unitId && dateStr >= b.check_in && dateStr < b.check_out)
  }

  const isCheckInDate = (booking: Booking, date: Date) => {
    return booking.check_in === date.toISOString().split("T")[0]
  }

  const formatDateHeader = (date: Date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      isToday: date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    }
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="flex border-b border-border">
              <div className="w-32 shrink-0 p-2 font-medium">Units</div>
              {dates.map((date) => {
                const { day, date: dateNum, isToday, isWeekend } = formatDateHeader(date)
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "flex-1 min-w-[60px] p-2 text-center text-sm border-l border-border",
                      isWeekend && "bg-muted/30",
                      isToday && "bg-primary/10",
                    )}
                  >
                    <div className="text-muted-foreground">{day}</div>
                    <div className={cn("font-semibold", isToday && "text-primary")}>{dateNum}</div>
                  </div>
                )
              })}
            </div>

            {/* Unit Rows */}
            {units.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No units found. Add units to see them on the calendar.
              </div>
            ) : (
              units.map((unit) => (
                <div key={unit.id} className="flex border-b border-border">
                  <div className="w-32 shrink-0 p-2">
                    <div className="font-medium truncate">{unit.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{unit.room_type?.name || "No type"}</div>
                  </div>
                  {dates.map((date) => {
                    const booking = getBookingForDate(unit.id, date)
                    const isCheckIn = booking && isCheckInDate(booking, date)
                    const { isWeekend, isToday } = formatDateHeader(date)

                    return (
                      <div
                        key={date.toISOString()}
                        className={cn(
                          "flex-1 min-w-[60px] p-1 border-l border-border relative",
                          isWeekend && "bg-muted/30",
                          isToday && "bg-primary/5",
                        )}
                      >
                        {booking && (
                          <div
                            className={cn(
                              "h-8 flex items-center px-2 text-xs text-white rounded-sm truncate",
                              statusColors[booking.status as keyof typeof statusColors],
                              !isCheckIn && "rounded-l-none",
                            )}
                            title={`${booking.guest?.first_name} ${booking.guest?.last_name}`}
                          >
                            {isCheckIn && (
                              <span className="truncate">
                                {booking.guest?.first_name} {booking.guest?.last_name?.charAt(0)}.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-warning/80" />
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary/80" />
            <span className="text-sm text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-success/80" />
            <span className="text-sm text-muted-foreground">Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <span className="text-sm text-muted-foreground">Checked Out</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
