"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  Home,
  Activity,
  Clock,
  FileText,
  MessageSquare,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation, UnitStatus } from "@/lib/dashboard-server-actions";

const statusConfig = {
  active: { label: "نشطة", className: "bg-primary/20 text-primary border-primary/30" },
  paid: { label: "مدفوعة", className: "bg-success/20 text-success border-success/30" },
  upcoming: { label: "قادمة", className: "bg-warning/20 text-warning border-warning/30" },
  completed: { label: "مكتملة", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "ملغاة", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function DashboardClient({ initialData }: { initialData: Awaited<ReturnType<typeof getDashboardData>> }) {
  const [reservations, setReservations] = useState<Reservation[]>(initialData.reservations);
  const [units, setUnits] = useState<UnitStatus[]>(initialData.units);

  const [currentReservationIndex, setCurrentReservationIndex] = useState(0);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  const reservationsPerPage = 4;
  const unitsPerPage = 6;

  const visibleReservations = reservations.slice(
    currentReservationIndex,
    currentReservationIndex + reservationsPerPage
  );

  const visibleUnits = units.slice(
    currentUnitIndex,
    currentUnitIndex + unitsPerPage
  );

  const nextReservations = () => {
    if (currentReservationIndex + reservationsPerPage < reservations.length) {
      setCurrentReservationIndex(currentReservationIndex + reservationsPerPage);
    }
  };

  const prevReservations = () => {
    if (currentReservationIndex > 0) {
      setCurrentReservationIndex(currentReservationIndex - reservationsPerPage);
    }
  };

  const nextUnits = () => {
    if (currentUnitIndex + unitsPerPage < units.length) {
      setCurrentUnitIndex(currentUnitIndex + unitsPerPage);
    }
  };

  const prevUnits = () => {
    if (currentUnitIndex > 0) {
      setCurrentUnitIndex(currentUnitIndex - unitsPerPage);
    }
  };

  const totalReservations = reservations.length;
  const paidReservations = reservations.filter(r => r.status === "paid").length;
  const upcomingReservations = reservations.filter(r => r.status === "upcoming").length;
  const activeReservations = reservations.filter(r => r.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      {/* AirBnb-style header with your project colors */}
      <header className="fixed top-0 right-64 left-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-3">
            <span className="text-primary font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Alula Sky</span>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">U</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-0 bottom-0 right-0 w-64 bg-white border-l border-gray-200 z-40 p-4 overflow-y-auto">
        <nav className="mt-8">
          <a href="#" className="flex items-center px-4 py-2 text-primary bg-primary/10 rounded-lg mb-2">
            <Home className="w-5 h-5 ml-3" />
            لوحة التحكم
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mb-2">
            <Calendar className="w-5 h-5 ml-3" />
            الحجوزات
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mb-2">
            <FileText className="w-5 h-5 ml-3" />
            الفواتير
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mb-2">
            <MessageSquare className="w-5 h-5 ml-3" />
            المراسلات
          </a>
        </nav>
      </aside>

      <main className="pt-16 pr-64 pb-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 border border-border">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                مرحباً بك في منصة إدارة فندقك
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                تابع أداء فندقك، إدارة الحجوزات، ومراقبة وحداتك في مكان واحد
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="rounded-xl px-6 py-3 gap-2">
                  <Plus className="w-4 h-4" />
                  حجز جديد
                </Button>
                <Button variant="outline" className="rounded-xl px-6 py-3 gap-2">
                  <FileText className="w-4 h-4" />
                  تقارير
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">نظرة عامة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              title="إجمالي الحجوزات" 
              value={totalReservations} 
              icon={Calendar} 
              variant="primary" 
            />
            <KPICard 
              title="مدفوع بالكامل" 
              value={paidReservations} 
              icon={CreditCard} 
              variant="success" 
            />
            <KPICard 
              title="الحجوزات النشطة" 
              value={activeReservations} 
              icon={Activity} 
              variant="warning" 
            />
            <KPICard 
              title="الحجوزات القادمة" 
              value={upcomingReservations} 
              icon={Clock} 
              variant="default" 
            />
          </div>
        </section>

        {/* Recent Reservations */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">الحجوزات الحديثة</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={prevReservations}
                disabled={currentReservationIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={nextReservations}
                disabled={currentReservationIndex + reservationsPerPage >= reservations.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleReservations.map((reservation) => {
              const status = statusConfig[reservation.status as keyof typeof statusConfig];
              return (
                <Card key={reservation.id} className="border-border rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-foreground truncate">{reservation.id}</h3>
                          <Badge variant="outline" className={cn("rounded-full", status.className)}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{reservation.checkIn} - {reservation.checkOut}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            <span>{reservation.unit}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{reservation.guest}</span>
                          </div>
                          <div className="font-medium text-primary">
                            {reservation.total} ر.س
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl mr-2">
                        عرض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Unit Status */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">حالة الوحدات</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={prevUnits}
                disabled={currentUnitIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={nextUnits}
                disabled={currentUnitIndex + unitsPerPage >= units.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visibleUnits.map((unit) => (
              <div 
                key={unit.id} 
                className={cn(
                  "rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 cursor-pointer",
                  unit.status === "occupied" && "bg-primary/20",
                  unit.status === "vacant" && "bg-success/20",
                  unit.status === "reserved" && "bg-warning/20",
                  unit.status === "maintenance" && "bg-destructive/20",
                )}
              >
                <p className={cn(
                  "text-lg font-bold",
                  unit.status === "occupied" && "text-primary",
                  unit.status === "vacant" && "text-success",
                  unit.status === "reserved" && "text-warning",
                  unit.status === "maintenance" && "text-destructive",
                )}>{unit.number}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {unit.status === "occupied" && "مشغولة"}
                  {unit.status === "vacant" && "شاغرة"}
                  {unit.status === "reserved" && "محجوزة"}
                  {unit.status === "maintenance" && "维修中"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">الإجراءات السريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">حجز جديد</h3>
                <p className="text-sm text-muted-foreground mb-4">إنشاء حجز جديد</p>
                <Button className="w-full rounded-xl">إنشاء</Button>
              </CardContent>
            </Card>

            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold mb-1">الفواتير</h3>
                <p className="text-sm text-muted-foreground mb-4">إدارة الفواتير</p>
                <Button variant="outline" className="w-full rounded-xl">عرض</Button>
              </CardContent>
            </Card>

            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold mb-1">المراسلات</h3>
                <p className="text-sm text-muted-foreground mb-4">المحادثات</p>
                <Button variant="outline" className="w-full rounded-xl">عرض</Button>
              </CardContent>
            </Card>

            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-1">المهام</h3>
                <p className="text-sm text-muted-foreground mb-4">مهام الخدمة</p>
                <Button variant="outline" className="w-full rounded-xl">عرض</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">أداء الفندق</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">الإيرادات الشهرية</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl">
                  <p className="text-muted-foreground">مخطط الإيرادات</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">معدل الإشغال</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl">
                  <p className="text-muted-foreground">مخطط معدل الإشغال</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}