"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/main-layout";
import { KPICard } from "@/components/kpi-card";
import { UnitCard } from "@/components/unit-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid3X3, List, Plus, AlertCircle, CalendarCheck, UserX, LogIn, LogOut, Download, FileText } from "lucide-react";
import { Unit } from "@/lib/units-server-actions";
import { addUnit as addUnitAction, updateUnit as updateUnitAction, deleteUnit as deleteUnitAction } from "@/lib/units-server-actions";
import { AddUnitModal } from "@/components/modals/add-unit-modal";
import { Toaster, toast } from "sonner";

interface UnitsClientProps {
  initialUnits: Unit[];
}

export default function UnitsClient({ initialUnits }: UnitsClientProps) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.number?.includes(searchQuery) ||
        unit.name?.includes(searchQuery) ||
        (unit.guest?.includes(searchQuery) ?? false);
      const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
      const matchesType = typeFilter === "all" || unit.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [units, searchQuery, statusFilter, typeFilter]);

  const outOfService = units.filter((u) => u.status === "out-of-service").length;
  const available = units.filter((u) => u.status === "vacant").length;
  const arrivalToday = units.filter((u) => u.status === "arrival-today").length;
  const departureToday = units.filter((u) => u.status === "departure-today").length;

  const handleAddUnit = async (formData: any) => {
    try {
      const newUnit = await addUnitAction(formData);
      setUnits([...units, newUnit]);
      setAddModalOpen(false);
      toast.success("تم إضافة الوحدة بنجاح");
    } catch (error) {
      console.error("Error adding unit:", error);
      toast.error("حدث خطأ أثناء إضافة الوحدة");
    }
  };

  const handleUpdateUnit = async (id: string, formData: any) => {
    try {
      const updatedUnit = await updateUnitAction(id, formData);
      setUnits(units.map(unit => unit.id === id ? updatedUnit : unit));
      setAddModalOpen(false);
      setEditingUnit(null);
      toast.success("تم تحديث الوحدة بنجاح");
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error("حدث خطأ أثناء تحديث الوحدة");
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذه الوحدة؟")) return;

    try {
      await deleteUnitAction(id);
      setUnits(units.filter(unit => unit.id !== id));
      toast.success("تم حذف الوحدة بنجاح");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("حدث خطأ أثناء حذف الوحدة");
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setAddModalOpen(true);
  };

  // Export functions
  const exportToCSV = () => {
    if (filteredUnits.length === 0) {
      toast.error("لا توجد وحدات لتصديرها");
      return;
    }

    // Create CSV content
    const headers = ['الرقم', 'الاسم', 'النوع', 'الحالة', 'الطابق', 'السعر الأساسي', 'الضيوف'];
    const csvContent = [
      headers.join(','),
      ...filteredUnits.map(unit => [
        unit.number || '',
        unit.name || '',
        unit.type || '',
        unit.status === 'occupied' ? 'مشغول' :
        unit.status === 'vacant' ? 'شاغر' :
        unit.status === 'out-of-service' ? 'خارج الخدمة' :
        unit.status === 'departure-today' ? 'مغادرة اليوم' :
        unit.status === 'arrival-today' ? 'وصول اليوم' :
        unit.status || '',
        unit.floor || '',
        unit.roomType?.base_price || '',
        unit.guest || ''
      ].map(field => `"${field || ''}"`).join(','))
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `units-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredUnits.length === 0) {
      toast.error("لا توجد وحدات لتصديرها");
      return;
    }

    // Create a new window with the units table
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> تقرير الوحدات </title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              background: #ffffff;
              font-size: 14px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .units-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .units-table th,
            .units-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
            }
            .units-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1> تقرير الوحدات </h1>
            <p> تم إنشاء التقرير في: ${new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <table class="units-table">
            <thead>
              <tr>
                <th>الرقم</th>
                <th>الاسم</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>الطابق</th>
                <th>السعر الأساسي</th>
                <th>الضيوف</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUnits.map(unit => `
                <tr>
                  <td>${unit.number || ''}</td>
                  <td>${unit.name || ''}</td>
                  <td>${unit.type === 'suite' ? 'جناح' :
                      unit.type === 'room' ? 'غرفة' :
                      unit.type === 'studio' ? 'استوديو' :
                      unit.type || ''}</td>
                  <td>${unit.status === 'occupied' ? 'مشغول' :
                      unit.status === 'vacant' ? 'شاغر' :
                      unit.status === 'out-of-service' ? 'خارج الخدمة' :
                      unit.status === 'departure-today' ? 'مغادرة اليوم' :
                      unit.status === 'arrival-today' ? 'وصول اليوم' :
                      unit.status || ''}</td>
                  <td>${unit.floor || ''}</td>
                  <td>${unit.roomType?.base_price || ''}</td>
                  <td>${unit.guest || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

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
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-center" richColors />

      <main className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الوحدات</h1>
            <p className="text-muted-foreground mt-1">إدارة وحدات الإقامة</p>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-xl gap-2" onClick={() => {
              setEditingUnit(null);
              setAddModalOpen(true);
            }}>
              <Plus className="h-4 w-4" />
              إضافة وحدة
            </Button>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <KPICard title="خارج الخدمة" value={outOfService} icon={AlertCircle} variant="destructive" />
          <KPICard title="متاحة اليوم" value={available} icon={CalendarCheck} variant="success" />
          <KPICard title="عدم حضور" value={2} icon={UserX} variant="warning" />
          <KPICard title="الوصول اليوم" value={arrivalToday} icon={LogIn} variant="primary" />
          <KPICard title="المغادرة اليوم" value={departureToday} icon={LogOut} variant="warning" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن وحدة..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="occupied">مشغول</SelectItem>
              <SelectItem value="vacant">شاغر</SelectItem>
              <SelectItem value="out-of-service">خارج الخدمة</SelectItem>
              <SelectItem value="departure-today">مغادرة اليوم</SelectItem>
              <SelectItem value="arrival-today">وصول اليوم</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
              <SelectValue placeholder="تصفية حسب النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="suite">جناح</SelectItem>
              <SelectItem value="room">غرفة</SelectItem>
              <SelectItem value="studio">استوديو</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onEdit={handleEditUnit}
              onDelete={handleDeleteUnit}
            />
          ))}
        </div>

        {filteredUnits.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">لا توجد وحدات مطابقة للبحث</div>
        )}
      </main>

      <AddUnitModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddUnit={handleAddUnit}
        onUpdateUnit={handleUpdateUnit}
        editingUnit={editingUnit}
      />
    </MainLayout>
  )
}