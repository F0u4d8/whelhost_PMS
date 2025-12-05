"use client";

import { useState } from "react";
import { Property, PropertyFormData } from "@/lib/properties-server-actions";
import { addProperty as addPropertyAction, updateProperty as updatePropertyAction, deleteProperty as deletePropertyAction } from "@/lib/properties-server-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreVertical, Building2, MapPin, Home, Network, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

import { MainLayout } from "@/components/main-layout";

interface PropertiesClientProps {
  initialProperties: Property[];
}

export default function PropertiesClient({ initialProperties }: PropertiesClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    nameAr: "",
    type: "hotel",
    address: "",
    city: "",
    country: "السعودية",
    unitsCount: 0,
    status: "active",
    channelConnected: false,
  });

  const filteredProperties = properties.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.nameAr.includes(search) || p.city.includes(search),
  );

  const handleSubmit = async () => {
    try {
      let updatedProperties;
      
      if (editingProperty) {
        // Update existing property
        const updatedProperty = await updatePropertyAction(editingProperty, formData);
        updatedProperties = properties.map(p => 
          p.id === editingProperty ? updatedProperty : p
        );
        setProperties(updatedProperties);
      } else {
        // Add new property
        const newProperty = await addPropertyAction(formData);
        updatedProperties = [...properties, newProperty];
        setProperties(updatedProperties);
      }
      
      setIsAddModalOpen(false);
      setEditingProperty(null);
      resetForm();
    } catch (error) {
      console.error("Error saving property:", error);
      alert("حدث خطأ أثناء حفظ العقار");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameAr: "",
      type: "hotel",
      address: "",
      city: "",
      country: "السعودية",
      unitsCount: 0,
      status: "active",
      channelConnected: false,
    });
  };

  const openEditModal = (property: Property) => {
    setFormData({
      name: property.name,
      nameAr: property.nameAr,
      type: property.type,
      address: property.address,
      city: property.city,
      country: property.country,
      unitsCount: property.unitsCount,
      status: property.status,
      channelConnected: property.channelConnected,
    });
    setEditingProperty(property.id);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا العقار؟")) return;
    
    try {
      await deletePropertyAction(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("حدث خطأ أثناء حذف العقار");
    }
  };

  const typeLabels = {
    hotel: "فندق",
    apartments: "شقق",
    resort: "منتجع",
    villa: "فيلا",
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">العقارات</h1>
          <p className="text-muted-foreground">إدارة العقارات والمنشآت</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة عقار
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث في العقارات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden group">
            <div className="relative h-40 bg-secondary">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant={property.status === "active" ? "default" : "secondary"}>
                  {property.status === "active" ? "نشط" : "غير نشط"}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/properties/${property.id}`}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditModal(property)}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{property.nameAr}</h3>
                  <p className="text-sm text-muted-foreground">{property.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {property.city}، {property.country}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.unitsCount || 0} وحدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{typeLabels[property.type]}</span>
                  </div>
                </div>
                {property.channelConnected && (
                  <div className="flex items-center gap-2 text-primary">
                    <Network className="w-4 h-4" />
                    <span className="text-sm">متصل بالقنوات</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) {
            setEditingProperty(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProperty ? "تعديل العقار" : "إضافة عقار جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الاسم (عربي)</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="فندق علولا سكاي"
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم (إنجليزي)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alula Sky Hotel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>نوع العقار</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">فندق</SelectItem>
                  <SelectItem value="apartments">شقق</SelectItem>
                  <SelectItem value="resort">منتجع</SelectItem>
                  <SelectItem value="villa">فيلا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="شارع الملك فهد"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المدينة</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="الرياض"
                />
              </div>
              <div className="space-y-2">
                <Label>الدولة</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="السعودية"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>عدد الوحدات</Label>
              <Input
                type="number"
                value={formData.unitsCount}
                onChange={(e) => setFormData({ ...formData, unitsCount: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit}>{editingProperty ? "حفظ التغييرات" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}