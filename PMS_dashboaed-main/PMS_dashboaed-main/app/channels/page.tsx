"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState } from "react"

const units = [
  { id: "1", number: "101", name: "جناح ديلوكس" },
  { id: "2", number: "102", name: "غرفة عادية" },
  { id: "3", number: "103", name: "جناح رئاسي" },
  { id: "4", number: "104", name: "غرفة مزدوجة" },
  { id: "5", number: "105", name: "استوديو" },
  { id: "6", number: "106", name: "جناح عائلي" },
  { id: "7", number: "201", name: "غرفة فردية" },
  { id: "8", number: "202", name: "جناح تنفيذي" },
]

// Generate dates for the calendar
function generateDates(startDate: Date, days: number) {
  const dates = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }
  return dates
}

// Generate random availability and prices
function generateAvailability(unitId: string, date: Date) {
  const seed = unitId.charCodeAt(0) + date.getDate()
  const isAvailable = seed % 3 !== 0
  const price = 500 + (seed % 10) * 50
  return { isAvailable, price, availability: isAvailable ? 1 : 0 }
}

const weekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]

export default function ChannelsPage() {
  const [startDate, setStartDate] = useState(new Date())
  const dates = generateDates(startDate, 14)

  const handlePrevWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() - 7)
    setStartDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() + 7)
    setStartDate(newDate)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="mr-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">مدير القنوات</h1>
            <p className="text-muted-foreground mt-1">إدارة التوفر والأسعار</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-xl gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              تحديث شامل
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-2xl border border-border p-4">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="rounded-xl">
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {startDate.toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}
            </span>
          </div>

          <Button variant="ghost" size="icon" onClick={handleNextWeek} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky right-0 bg-card z-10 p-4 text-right text-sm font-medium text-muted-foreground w-40 border-l border-border">
                    الوحدة
                  </th>
                  {dates.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    const dayName = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]
                    return (
                      <th
                        key={index}
                        className={cn(
                          "p-3 text-center min-w-[100px] border-l border-border",
                          isToday && "bg-primary/10",
                        )}
                      >
                        <div className="text-xs text-muted-foreground">{dayName}</div>
                        <div className={cn("text-sm font-medium mt-1", isToday ? "text-primary" : "text-foreground")}>
                          {date.getDate()}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b border-border hover:bg-muted/30">
                    <td className="sticky right-0 bg-card z-10 p-4 border-l border-border">
                      <div className="font-medium text-foreground">{unit.number}</div>
                      <div className="text-xs text-muted-foreground">{unit.name}</div>
                    </td>
                    {dates.map((date, index) => {
                      const { isAvailable, price, availability } = generateAvailability(unit.id, date)
                      const isToday = date.toDateString() === new Date().toDateString()
                      return (
                        <td
                          key={index}
                          className={cn(
                            "p-2 text-center border-l border-border cursor-pointer transition-colors hover:bg-muted/50",
                            isToday && "bg-primary/5",
                            !isAvailable && "bg-destructive/10",
                          )}
                        >
                          <div className="space-y-1">
                            <div
                              className={cn("text-xs font-medium", isAvailable ? "text-success" : "text-destructive")}
                            >
                              {availability}
                            </div>
                            <Input
                              type="text"
                              defaultValue={price}
                              className="w-full h-7 text-center text-xs bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20" />
            <span className="text-muted-foreground">متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20" />
            <span className="text-muted-foreground">غير متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20" />
            <span className="text-muted-foreground">اليوم</span>
          </div>
        </div>
      </main>
    </div>
  )
}
