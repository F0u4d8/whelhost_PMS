"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { source: "Booking", reservations: 45 },
  { source: "Expedia", reservations: 32 },
  { source: "مباشر", reservations: 28 },
  { source: "Agoda", reservations: 18 },
  { source: "أخرى", reservations: 12 },
]

export function ReservationSourcesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="source"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          }}
          formatter={(value: number) => [`${value} حجز`, "عدد الحجوزات"]}
        />
        <Bar dataKey="reservations" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
