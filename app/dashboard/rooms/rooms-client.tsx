"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Home, MapPin, Bed, Users, Shower, Star, Settings, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Unit } from "@/lib/units-server-actions";
import { AddUnitModal } from "@/components/modals/add-unit-modal";
import { Toaster, toast } from "sonner";

interface RoomsClientProps {
  initialUnits: Unit[];
}

export default function RoomsClient({ initialUnits }: RoomsClientProps) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [units, searchQuery, statusFilter]);

  const statusConfig = {
    occupied: { label: "مشغولة", className: "bg-destructive/20 text-destructive border-destructive/30" },
    vacant: { label: "شاغرة", className: "bg-success/20 text-success border-success/30" },
    reserved: { label: "محجوزة", className: "bg-warning/20 text-warning border-warning/30" },
    maintenance: { label: "تحت الصيانة", className: "bg-muted text-muted-foreground border-border" },
    departureToday: { label: "مغادرة اليوم", className: "bg-purple/20 text-purple border-purple/30" },
    arrivalToday: { label: "وصول اليوم", className: "bg-blue/20 text-blue border-blue/30" },
  };

  const handleDelete = (id: string) => {
    setUnits(units.filter(unit => unit.id !== id));
    toast.success("تم حذف الوحدة بنجاح");
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setAddModalOpen(true);
  };

  return (
    <MainLayout>
      <Toaster position="top-center" richColors />

      <main className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الوحدات</h1>
            <p className="text-muted-foreground mt-1">إدارة وحدات المنشأة</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            إضافة وحدة
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الوحدة أو الاسم..."
              className="pr-10 rounded-xl bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="vacant">شاغرة</SelectItem>
              <SelectItem value="occupied">مشغولة</SelectItem>
              <SelectItem value="reserved">محجوزة</SelectItem>
              <SelectItem value="maintenance">تحت الصيانة</SelectItem>
              <SelectItem value="arriving_today">وصول اليوم</SelectItem>
              <SelectItem value="departing_today">مغادرة اليوم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">الرقم</TableHead>
                <TableHead className="text-right text-muted-foreground">الاسم</TableHead>
                <TableHead className="text-right text-muted-foreground">النوع</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">السعر / الليلة</TableHead>
                <TableHead className="text-right text-muted-foreground">السعة</TableHead>
                <TableHead className="text-right text-muted-foreground">الخصائص</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => {
                const status = statusConfig[unit.status as keyof typeof statusConfig] || statusConfig.vacant;
                return (
                  <TableRow key={unit.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{unit.number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-muted-foreground">{unit.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{unit.pricePerNight?.toLocaleString() || "غير محدد"} ر.س</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{unit.maxOccupancy} أشخاص</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{unit.bedrooms || 1} نوم</span>
                        <Shower className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{unit.bathrooms || 1} حمام</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => handleEdit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(unit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <AddUnitModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen} 
        initialData={editingUnit || undefined}
        onUnitSaved={(newUnit) => {
          if (editingUnit) {
            // Update existing unit
            setUnits(units.map(u => u.id === newUnit.id ? newUnit : u));
          } else {
            // Add new unit
            setUnits([...units, newUnit]);
          }
          setEditingUnit(null);
        }}
      />
    </MainLayout>
  );
}