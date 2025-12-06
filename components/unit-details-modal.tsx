"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Unit } from "@/lib/units-server-actions";
import { UnitTasksDisplay } from "@/components/unit-tasks-display";
import { 
  User, 
  Calendar, 
  MapPin, 
  Building, 
  Bed, 
  Car, 
  Utensils, 
  Wifi, 
  Coffee, 
  Mountain, 
  Check, 
  X,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UnitDetailsModalProps {
  unit: Unit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  occupied: {
    bg: "bg-primary/10 border-primary/30",
    badge: "bg-primary/20 text-primary",
    label: "مشغول",
  },
  vacant: {
    bg: "bg-success/10 border-success/30",
    badge: "bg-success/20 text-success",
    label: "شاغر",
  },
  "out-of-service": {
    bg: "bg-destructive/10 border-destructive/30",
    badge: "bg-destructive/20 text-destructive",
    label: "خارج الخدمة",
  },
  "departure-today": {
    bg: "bg-warning/10 border-warning/30",
    badge: "bg-warning/20 text-warning",
    label: "مغادرة اليوم",
  },
  "arrival-today": {
    bg: "bg-chart-2/10 border-chart-2/30",
    badge: "bg-chart-2/20 text-chart-2",
    label: "وصول اليوم",
  },
};

export function UnitDetailsModal({ unit, open, onOpenChange }: UnitDetailsModalProps) {
  const config = statusConfig[unit.status] || statusConfig.vacant; // fallback to vacant config if status is invalid

  // For now, we're just displaying the unit details and tasks
  // In a real implementation, this would have more sophisticated data display

  // Sample amenities data - in a real app, this would come from the unit data
  const amenities = [
    { id: 'wifi', name: 'واي فاي', icon: Wifi, available: true },
    { id: 'parking', name: 'موقف سيارات', icon: Car, available: true },
    { id: 'kitchen', name: 'مطبخ', icon: Utensils, available: true },
    { id: 'coffee', name: 'ماكينة قهوة', icon: Coffee, available: false },
    { id: 'balcony', name: 'شرفة', icon: Mountain, available: true },
  ];

  // Sample facilities data - in a real app, this would come from the unit data
  const facilities = [
    { id: 'gym', name: 'نادي رياضي', available: true },
    { id: 'pool', name: 'مسبح', available: true },
    { id: 'spa', name: 'سبا', available: false },
    { id: 'restaurant', name: 'مطعم', available: true },
  ];

  const rules = [
    "ممنوع التدخين في الغرف",
    " Quiet Hours 10 PM-7 AM",
    "No Pets Allowed",
    "Check-out before 12 PM"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الوحدة {unit.number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Info Section */}
          <div className="lg:col-span-1 space-y-4">
            <Card className={cn("border", config.bg)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{unit.name}</span>
                  <Badge className={cn("text-xs", config.badge)}>{config.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">الرقم: {unit.number}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">النوع: {unit.type === 'suite' ? 'جناح' : unit.type === 'room' ? 'غرفة' : unit.type === 'studio' ? 'ستوديو' : unit.type === 'apartment' ? 'شقة' : unit.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">الطابق: {unit.floor}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">الحالة الحالية: {config.label}</span>
                  </div>
                  
                  {unit.pricePerNight && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">السعر: </span>
                      <span className="text-sm font-medium">{unit.pricePerNight} ر.س/الليلة</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            {(unit.guest || unit.checkIn || unit.checkOut) && (
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الضيف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unit.guest && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{unit.guest}</span>
                      </div>
                    )}
                    
                    {unit.checkIn && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">الوصول: {unit.checkIn}</span>
                      </div>
                    )}
                    
                    {unit.checkOut && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">المغادرة: {unit.checkOut}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>المرافق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      {amenity.available ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hotel Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>مرافق الفندق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center gap-2">
                      {facility.available ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">{facility.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks and Rules Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Section */}
            {unit.id && (
              <UnitTasksDisplay
                unitId={unit.id}
                unitNumber={unit.number || unit.name}
                onTaskUpdate={() => {
                  // Refresh the unit data if needed
                  toast.info("تم تحديث المهام");
                }}
              />
            )}

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>قوانين الوحدة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Unit Images */}
            {unit.imageUrls && unit.imageUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>صور الوحدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {unit.imageUrls.map((imgUrl, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`صورة وحدة ${unit.number} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}