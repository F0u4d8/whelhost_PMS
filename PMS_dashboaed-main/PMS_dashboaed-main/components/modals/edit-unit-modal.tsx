"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePMSStore, type Unit } from "@/lib/store"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { uploadMultipleImagesToStorage, deleteImageFromStorage } from "@/lib/supabase-image-upload"

interface EditUnitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit
}

export function EditUnitModal({ open, onOpenChange, unit }: EditUnitModalProps) {
  const updateUnit = usePMSStore((state) => state.updateUnit)
  const [formData, setFormData] = useState({
    number: unit.number,
    name: unit.name,
    type: unit.type || "room",
    floor: unit.floor || "1",
    pricePerNight: unit.pricePerNight ? unit.pricePerNight.toString() : "",
    status: unit.status,
  })
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>(unit.imageUrls || [])

  // Update form data when unit prop changes
  useEffect(() => {
    if (unit) {
      setFormData({
        number: unit.number,
        name: unit.name,
        type: unit.type || "room",
        floor: unit.floor || "1",
        pricePerNight: unit.pricePerNight ? unit.pricePerNight.toString() : "",
        status: unit.status,
      })
      setCurrentImageUrls(unit.imageUrls || [])
    }
  }, [unit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number || !formData.name) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة")
      return
    }

    try {
      setUploading(true)

      // Upload new images if any
      let newImageUrls: string[] = []
      if (files.length > 0) {
        toast.info("جاري رفع الصور...")
        const uploadResult = await uploadMultipleImagesToStorage(files, "rooms")

        if (!uploadResult.success) {
          toast.error("فشل رفع بعض الصور")
          if (uploadResult.errors.length > 0) {
            console.error("Upload errors:", uploadResult.errors)
          }
        } else {
          newImageUrls = uploadResult.urls
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...currentImageUrls, ...newImageUrls]

      // Update the unit in the store
      updateUnit(unit.id, {
        number: formData.number,
        name: formData.name,
        type: formData.type,
        floor: formData.floor,
        pricePerNight: Number(formData.pricePerNight),
        status: formData.status,
        imageUrls: allImageUrls, // Add the image URLs
      })

      toast.success("تم تحديث الوحدة بنجاح")
      onOpenChange(false)
      setFiles([])
    } catch (error) {
      console.error("Error updating unit:", error)
      toast.error("حدث خطأ أثناء تحديث الوحدة")
    } finally {
      setUploading(false)
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (index: number) => {
    const imageToDelete = currentImageUrls[index]
    if (!imageToDelete) return

    try {
      // Remove from current URL list
      const updatedImageUrls = currentImageUrls.filter((_, i) => i !== index)
      setCurrentImageUrls(updatedImageUrls)

      // Delete from storage
      await deleteImageFromStorage(imageToDelete, "rooms")
      toast.success("تم حذف الصورة بنجاح")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("فشل حذف الصورة")
      // If deletion failed, restore the URL
      setCurrentImageUrls(currentImageUrls)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card border-border max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">تحديث وحدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">رقم الوحدة</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="101"
                className="rounded-xl bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">الطابق</Label>
              <Select value={formData.floor} onValueChange={(v) => setFormData({ ...formData, floor: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">الطابق الأول</SelectItem>
                  <SelectItem value="2">الطابق الثاني</SelectItem>
                  <SelectItem value="3">الطابق الثالث</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">اسم الوحدة</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="جناح ديلوكس"
              className="rounded-xl bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">نوع الوحدة</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite">جناح</SelectItem>
                  <SelectItem value="room">غرفة</SelectItem>
                  <SelectItem value="studio">استوديو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر / ليلة</Label>
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

          {/* Current Images */}
          {currentImageUrls.length > 0 && (
            <div className="space-y-2">
              <Label>الصور الحالية</Label>
              <div className="grid grid-cols-3 gap-2">
                {currentImageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Unit image ${index + 1}`}
                      className="rounded-lg object-cover w-full h-20"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteImage(index)
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>إضافة صور جديدة</Label>
            <FileUpload
              onFilesChange={setFiles}
              maxFiles={5}
              label="رفع صور للوحدة"
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
              إلغاء
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={uploading}
            >
              {uploading ? "جاري التحديث..." : "تحديث الوحدة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
