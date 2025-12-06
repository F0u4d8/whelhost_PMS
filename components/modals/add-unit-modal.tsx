"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { uploadMultipleImagesToStorage } from "@/lib/supabase-image-upload"
import { createClient } from "@/lib/supabase/client"

interface AddUnitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddUnit?: (formData: any) => Promise<void>
  onUpdateUnit?: (id: string, formData: any) => Promise<void>
  editingUnit?: any // Pass the unit being edited
}

export function AddUnitModal({
  open,
  onOpenChange,
  onAddUnit,
  onUpdateUnit,
  editingUnit
}: AddUnitModalProps) {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Default to Arabic
  const [formData, setFormData] = useState({
    number: editingUnit?.number || "",
    name: editingUnit?.name || "",
    type: editingUnit?.type || "room",
    floor: editingUnit?.floor || "1",
    pricePerNight: editingUnit?.pricePerNight?.toString() || "",
    status: editingUnit?.status || "vacant",
    city: editingUnit?.city || "" // Adding city field
  })
  const [cities, setCities] = useState<string[]>([]); // Available cities
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const isEditing = !!editingUnit;

  // Load available cities from hotels
  useEffect(() => {
    const loadCities = async () => {
      const supabase = createClient();

      // Get user's hotels to populate city options
      const { data: hotels, error } = await supabase
        .from('hotels')
        .select('city')
        .is('city', 'not', null)
        .order('city');

      if (error) {
        console.error("Error loading cities:", error);
        // Predefined list of Saudi cities as fallback
        setCities([
          "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة",
          "الدمام", "الخبر", "الظهران", "الجبيل",
          "الهفوف", "نجران", "أبها", "تبوك",
          "حفر الباطن", "الكويت", "القاهرة"
        ]);
      } else if (hotels) {
        const uniqueCities = [...new Set(hotels.map(h => h.city).filter(Boolean) as string[])];
        setCities(uniqueCities);

        // If editing, ensure selected city is available
        if (editingUnit?.city && !uniqueCities.includes(editingUnit.city)) {
          setCities(prev => [...prev, editingUnit.city]);
        }
      }
    };

    if (open) { // Only load when modal opens to avoid unnecessary calls
      loadCities();
    }
  }, [open, editingUnit?.city]);

  // Determine language based on URL or user preferences
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/ar')) {
      setLanguage('ar');
    } else {
      setLanguage('en');
    }
  }, []);

  // Translation function
  const t = (key: string) => {
    const translations = {
      // Arabic
      "ar": {
        "pleaseFillRequiredFields": "الرجاء تعبئة جميع الحقول المطلوبة",
        "uploadingImages": "جاري رفع الصور...",
        "uploadFailed": "فشل رفع بعض الصور",
        "unitUpdated": "تم تحديث الوحدة بنجاح",
        "unitAdded": "تم إضافة الوحدة بنجاح",
        "errorUpdating": "حدث خطأ أثناء تحديث الوحدة",
        "errorAdding": "حدث خطأ أثناء إضافة الوحدة",
        "editUnit": "تعديل وحدة",
        "addNewUnit": "إضافة وحدة جديدة",
        "unitNumber": "رقم الوحدة",
        "floor": "الطابق",
        "firstFloor": "الطابق الأول",
        "secondFloor": "الطابق الثاني",
        "thirdFloor": "الطابق الثالث",
        "unitName": "اسم الوحدة",
        "unitType": "نوع الوحدة",
        "suite": "جناح",
        "room": "غرفة",
        "studio": "استوديو",
        "pricePerNight": "السعر / ليلة",
        "unitImages": "صور الوحدة",
        "uploadImages": "رفع صور للوحدة",
        "cancel": "إلغاء",
        "update": "تحديث",
        "add": "إضافة",
        "adding": "جاري الإضافة...",
        "deluxeSuite": "جناح ديلوكس",
        "apt101": "101",
        "city": "المدينة",
        "selectCity": "اختر المدينة",
        "cityRequired": "الرجاء اختيار المدينة"
      },
      // English
      "en": {
        "pleaseFillRequiredFields": "Please fill all required fields",
        "uploadingImages": "Uploading images...",
        "uploadFailed": "Failed to upload some images",
        "unitUpdated": "Unit updated successfully",
        "unitAdded": "Unit added successfully",
        "errorUpdating": "Error updating unit",
        "errorAdding": "Error adding unit",
        "editUnit": "Edit Unit",
        "addNewUnit": "Add New Unit",
        "unitNumber": "Unit Number",
        "floor": "Floor",
        "firstFloor": "First Floor",
        "secondFloor": "Second Floor",
        "thirdFloor": "Third Floor",
        "unitName": "Unit Name",
        "unitType": "Unit Type",
        "suite": "Suite",
        "room": "Room",
        "studio": "Studio",
        "pricePerNight": "Price / Night",
        "unitImages": "Unit Images",
        "uploadImages": "Upload Images for Unit",
        "cancel": "Cancel",
        "update": "Update",
        "add": "Add",
        "adding": "Adding...",
        "deluxeSuite": "Deluxe Suite",
        "apt101": "101",
        "city": "City",
        "selectCity": "Select City",
        "cityRequired": "Please select a city"
      }
    };
    return translations[language][key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number || !formData.name || !formData.city) {
      toast.error(formData.city ? t("pleaseFillRequiredFields") : t("cityRequired"));
      return
    }

    try {
      setUploading(true)

      // Upload images if any
      let imageUrls: string[] = []
      if (files.length > 0) {
        toast.info(t("uploadingImages"))
        const uploadResult = await uploadMultipleImagesToStorage(files, "rooms")

        if (!uploadResult.success) {
          toast.error(t("uploadFailed"))
          if (uploadResult.errors.length > 0) {
            console.error("Upload errors:", uploadResult.errors)
          }
        } else {
          imageUrls = uploadResult.urls
        }
      }

      if (isEditing && editingUnit && onUpdateUnit) {
        await onUpdateUnit(editingUnit.id, {
          number: formData.number,
          name: formData.name,
          type: formData.type as any,
          floor: formData.floor,
          pricePerNight: Number(formData.pricePerNight),
          status: formData.status as any,
          city: formData.city, // Add city to update
          imageUrls, // Add the uploaded image URLs
        });
        toast.success(t("unitUpdated"));
      } else if (onAddUnit) {
        await onAddUnit({
          number: formData.number,
          name: formData.name,
          type: formData.type as any,
          floor: formData.floor,
          pricePerNight: Number(formData.pricePerNight),
          status: formData.status as any,
          city: formData.city, // Add city to new unit
          imageUrls, // Add the uploaded image URLs
        });
        toast.success(t("unitAdded"));
      }

      onOpenChange(false);
      setFormData({
        number: "",
        name: "",
        type: "room",
        floor: "1",
        pricePerNight: "",
        status: "vacant",
        city: "" // Reset city as well
      });
      setFiles([]); // Reset files after successful submission
    } catch (error) {
      console.error("Error saving unit:", error);
      toast.error(isEditing ? t("errorUpdating") : t("errorAdding"));
    } finally {
      setUploading(false)
    }
  }

  // Determine direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';
  const placeholderAlign = language === 'ar' ? 'placeholder:text-right' : 'placeholder:text-left';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[525px] bg-card border-border max-h-[90vh] overflow-y-auto ${textAlign}`} dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEditing ? t("editUnit") : t("addNewUnit")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">{t("unitNumber")}</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder={t("apt101")}
                className={`rounded-xl bg-background border-border ${placeholderAlign}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">{t("floor")}</Label>
              <Select value={formData.floor} onValueChange={(v) => setFormData({ ...formData, floor: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("firstFloor")}</SelectItem>
                  <SelectItem value="2">{t("secondFloor")}</SelectItem>
                  <SelectItem value="3">{t("thirdFloor")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t("unitName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("deluxeSuite")}
              className={`rounded-xl bg-background border-border ${placeholderAlign}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t("unitType")}</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite">{t("suite")}</SelectItem>
                  <SelectItem value="room">{t("room")}</SelectItem>
                  <SelectItem value="studio">{t("studio")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{t("pricePerNight")}</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                placeholder="500"
                className="rounded-xl bg-background border-border"
              />
            </div>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
              <SelectTrigger className="rounded-xl bg-background border-border">
                <SelectValue placeholder={t("selectCity")} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city, index) => (
                  <SelectItem key={index} value={city}>{city}</SelectItem>
                ))}
                {/* Add any manually entered city that's not in the list */}
                {formData.city && !cities.includes(formData.city) && (
                  <SelectItem key="manual" value={formData.city}>{formData.city}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>{t("unitImages")}</Label>
            <FileUpload
              onFilesChange={setFiles}
              maxFiles={5}
              label={t("uploadImages")}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
              disabled={uploading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={uploading}
            >
              {uploading ? t("adding") : (isEditing ? t("update") : t("add"))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
