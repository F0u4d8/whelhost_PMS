"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { KPICard } from "@/components/kpi-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, CalendarDays, CreditCard, Clock, CheckCircle, Eye, Trash2, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { Reservation } from "@/lib/reservations-server-actions"
import { addReservation as addReservationAction, deleteReservation as deleteReservationAction } from "@/lib/reservations-server-actions"
import { AddReservationModal } from "@/components/modals/add-reservation-modal"
import { Toaster, toast } from "sonner"

interface ReservationsClientProps {
  initialData: {
    reservations: Reservation[];
    units: any[]; // Using any for now to match the Unit interface defined in the server actions
    guests: any[]; // Using any for now to match the Guest interface defined in the server actions
  };
}

const statusConfig = {
  active: { label: "نشط", className: "bg-primary/20 text-primary border-primary/30" },
  paid: { label: "مدفوع", className: "bg-success/20 text-success border-success/30" },
  upcoming: { label: "قادم", className: "bg-warning/20 text-warning border-warning/30" },
  completed: { label: "مكتمل", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "ملغي", className: "bg-destructive/20 text-destructive border-destructive/30" },
}

export default function ReservationsClient({ initialData }: ReservationsClientProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialData.reservations)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReservations = useMemo(() => {
    return reservations.filter(
      (res) => res.id.toLowerCase().includes(searchQuery.toLowerCase()) || res.guest.includes(searchQuery),
    )
  }, [reservations, searchQuery])

  const totalReservations = reservations.length
  const paidReservations = reservations.filter((r) => r.status === "paid").length
  const upcomingReservations = reservations.filter((r) => r.status === "upcoming").length
  const completedReservations = reservations.filter((r) => r.status === "completed").length

  const handleDelete = async (id: string) => {
    try {
      await deleteReservationAction(id);
      setReservations(reservations.filter(res => res.id !== id));
      toast.success("تم حذف الحجز بنجاح");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("حدث خطأ أثناء حذف الحجز");
    }
  }

  const handleAddReservation = async (reservationData: Omit<Reservation, 'id' | 'date'>) => {
    try {
      const newReservation = await addReservationAction({...reservationData, date: new Date().toISOString().split("T")[0]});
      setReservations([...reservations, newReservation]);
      setAddModalOpen(false);
      toast.success("تم إضافة الحجز بنجاح");
    } catch (error) {
      console.error("Error adding reservation:", error);
      toast.error("حدث خطأ أثناء إضافة الحجز");
    }
  }

  const handlePrint = (reservation: Reservation) => {
    // Create a new window with the reservation details
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> تقرير الحجز - ${reservation.id} </title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              background: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              margin-top: 4px;
              color: #1f2937;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1> تقرير الحجز </h1>
            <p> رقم الحجز: ${reservation.id} </p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">اسم الضيف</div>
              <div class="value">${reservation.guest}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ الحجز</div>
              <div class="value">${reservation.date}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ الوصول</div>
              <div class="value">${reservation.checkIn}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ المغادرة</div>
              <div class="value">${reservation.checkOut}</div>
            </div>
            <div class="info-item">
              <div class="label">عدد الليالي</div>
              <div class="value">${reservation.nights}</div>
            </div>
            <div class="info-item">
              <div class="label">الوحدة</div>
              <div class="value">${reservation.unit}</div>
            </div>
            <div class="info-item">
              <div class="label">الإجمالي</div>
              <div class="value">${reservation.total} ر.س</div>
            </div>
            <div class="info-item">
              <div class="label">المتبقي</div>
              <div class="value">${reservation.balance} ر.س</div>
            </div>
          </div>

          <div class="info-item">
            <div class="label">الحالة</div>
            <div class="value">${statusConfig[reservation.status as keyof typeof statusConfig]?.label || reservation.status}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  return (
    <MainLayout>
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">الحجوزات</h1>
          <p className="text-muted-foreground mt-1">إدارة الحجوزات والمدفوعات</p>
        </div>
        <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          حجز جديد
        </Button>
      </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="إجمالي الحجوزات" value={totalReservations} icon={CalendarDays} variant="primary" />
          <KPICard title="مدفوع بالكامل" value={paidReservations} icon={CreditCard} variant="success" />
          <KPICard title="حجوزات قادمة" value={upcomingReservations} icon={Clock} variant="warning" />
          <KPICard title="مكتملة" value={completedReservations} icon={CheckCircle} variant="default" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الحجز أو اسم الضيف..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">رقم الحجز</TableHead>
                <TableHead className="text-right text-muted-foreground">تاريخ الحجز</TableHead>
                <TableHead className="text-right text-muted-foreground">الوصول</TableHead>
                <TableHead className="text-right text-muted-foreground">المغادرة</TableHead>
                <TableHead className="text-right text-muted-foreground">الليالي</TableHead>
                <TableHead className="text-right text-muted-foreground">الوحدة</TableHead>
                <TableHead className="text-right text-muted-foreground">الضيف</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجمالي</TableHead>
                <TableHead className="text-right text-muted-foreground">المتبقي</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((res) => {
                const status = statusConfig[res.status as keyof typeof statusConfig]
                return (
                  <TableRow key={res.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-primary">{res.id}</TableCell>
                    <TableCell className="text-muted-foreground">{res.date}</TableCell>
                    <TableCell>{res.checkIn}</TableCell>
                    <TableCell>{res.checkOut}</TableCell>
                    <TableCell>{res.nights}</TableCell>
                    <TableCell className="font-medium">{res.unit}</TableCell>
                    <TableCell>{res.guest}</TableCell>
                    <TableCell className="font-medium">{res.total} ر.س</TableCell>
                    <TableCell className={cn(res.balance > 0 ? "text-destructive" : "text-success")}>
                      {res.balance} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:text-primary"
                          onClick={() => handlePrint(res)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(res.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      <AddReservationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddReservation={handleAddReservation}
        units={initialData.units}
        guests={initialData.guests}
      />
    </MainLayout>
  )
}