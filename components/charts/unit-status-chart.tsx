"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface Unit {
  id: string;
  number: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'maintenance';
  guest?: string;
}

interface UnitStatusChartProps {
  units: Unit[];
}

export function UnitStatusChart({ units }: UnitStatusChartProps) {
  // Calculate status distribution from real units data
  const statusCounts = units.reduce((acc, unit) => {
    if (unit.status === 'occupied') acc.occupied++;
    else if (unit.status === 'vacant') acc.vacant++;
    else if (unit.status === 'reserved') acc.reserved++;
    else if (unit.status === 'maintenance') acc.maintenance++;
    return acc;
  }, { occupied: 0, vacant: 0, reserved: 0, maintenance: 0 });

  const data = [
    { name: "مشغول", value: statusCounts.occupied, color: "var(--primary)" },
    { name: "شاغر", value: statusCounts.vacant, color: "var(--success)" },
    { name: "محجوز", value: statusCounts.reserved, color: "var(--warning)" },
    { name: "صيانة", value: statusCounts.maintenance, color: "var(--destructive)" },
  ].filter(item => item.value > 0); // Only show statuses that have units

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          }}
          formatter={(value: number) => [`${value} وحدة`, ""]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: "var(--foreground)", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
