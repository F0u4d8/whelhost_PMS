"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { day: "السبت", occupancy: 85 },
  { day: "الأحد", occupancy: 72 },
  { day: "الإثنين", occupancy: 68 },
  { day: "الثلاثاء", occupancy: 91 },
  { day: "الأربعاء", occupancy: 78 },
  { day: "الخميس", occupancy: 95 },
  { day: "الجمعة", occupancy: 88 },
]

export function OccupancyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ color: "var(--foreground)" }}
          itemStyle={{ color: "var(--primary)" }}
          formatter={(value: number) => [`${value}%`, "نسبة الإشغال"]}
        />
        <Bar dataKey="occupancy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
