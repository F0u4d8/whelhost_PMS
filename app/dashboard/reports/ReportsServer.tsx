"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Users, Home, Calendar } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts"
import { MainLayout } from "@/components/main-layout"

interface ReportData {
  revenueData: { day: string; revenue: number; expenses: number }[];
  channelData: { name: string; value: number; color: string }[];
  occupancyData: { month: string; rate: number }[];
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalReservations: number;
    occupancyRate: number;
    avgRevenuePerReservation: number;
    totalGuests: number;
  };
}

export default function ReportsServer({ reportData }: { reportData: ReportData }) {
  const [reportType, setReportType] = useState("revenue")
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")

  const { revenueData, channelData, occupancyData, stats } = reportData

  const handleExport = (format: "pdf" | "csv") => {
    // Simulated export
    alert(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}`)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground">تحليل الأداء والإحصائيات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="w-4 h-4 ml-2" />
            CSV
          </Button>
          <Button onClick={() => handleExport("pdf")}>
            <FileText className="w-4 h-4 ml-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">الإيرادات</SelectItem>
                  <SelectItem value="occupancy">الإشغال</SelectItem>
                  <SelectItem value="channels">القنوات</SelectItem>
                  <SelectItem value="guests">الضيوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            <Button>تطبيق</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ر.س</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+12% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold">{stats.netIncome.toLocaleString()} ر.س</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+8% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نسبة الإشغال</p>
                <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Home className="w-5 h-5 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{stats.totalReservations} حجز</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الضيوف</p>
                <p className="text-2xl font-bold">{stats.totalGuests}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+5 ضيوف جدد</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              الإيرادات والمصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="المصروفات" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الحجوزات حسب القناة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>اتجاه نسبة الإشغال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="نسبة الإشغال %"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}