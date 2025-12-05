"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface BookingPolicy {
  id: string;
  name: string;
  description: string;
  type: "cancellation" | "check_in" | "check_out" | "age" | "other";
  value: string;
  isActive: boolean;
}

interface BookingPoliciesSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policies: BookingPolicy[];
  onAddPolicy: (policy: Omit<BookingPolicy, 'id'>) => void;
  onUpdatePolicy: (id: string, policy: Partial<BookingPolicy>) => void;
  onDeletePolicy: (id: string) => void;
}

export function BookingPoliciesSettings({ 
  open, 
  onOpenChange, 
  policies,
  onAddPolicy,
  onUpdatePolicy,
  onDeletePolicy
}: BookingPoliciesSettingsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [editingPolicy, setEditingPolicy] = useState<BookingPolicy | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "cancellation" as "cancellation" | "check_in" | "check_out" | "age" | "other",
    value: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPolicy) {
        await onUpdatePolicy(editingPolicy.id, formData);
        toast.success("تم تحديث سياسة الحجز بنجاح");
      } else {
        await onAddPolicy(formData);
        toast.success("تم إضافة سياسة الحجز بنجاح");
      }
      
      setFormData({
        name: "",
        description: "",
        type: "cancellation",
        value: "",
        isActive: true,
      });
      setEditingPolicy(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving booking policy:", error);
      toast.error("حدث خطأ أثناء حفظ سياسة الحجز");
    }
  };

  const handleEdit = (policy: BookingPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      type: policy.type,
      value: policy.value,
      isActive: policy.isActive,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeletePolicy(id);
      toast.success("تم حذف سياسة الحجز بنجاح");
    } catch (error) {
      console.error("Error deleting booking policy:", error);
      toast.error("حدث خطأ أثناء حذف سياسة الحجز");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">سياسات الحجز</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "list" ? "default" : "outline"}
            onClick={() => setActiveTab("list")}
            className="rounded-xl"
          >
            القائمة
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("add");
              setEditingPolicy(null);
              setFormData({
                name: "",
                description: "",
                type: "cancellation",
                value: "",
                isActive: true,
              });
            }}
            className="rounded-xl"
          >
            {editingPolicy ? "تعديل" : "إضافة"} سياسة
          </Button>
        </div>
        
        {activeTab === "list" ? (
          <div className="max-h-80 overflow-y-auto">
            {policies.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد سياسات حجز</p>
            ) : (
              <div className="space-y-2">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <div>
                      <h4 className="font-medium">{policy.name}</h4>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {policy.type} | {policy.value}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleEdit(policy)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleDelete(policy.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم السياسة</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl bg-background border-border"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl bg-background border-border resize-none"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع السياسة</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger className="rounded-xl bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancellation">إلغاء الحجز</SelectItem>
                    <SelectItem value="check_in">وقت الدخول</SelectItem>
                    <SelectItem value="check_out">وقت المغادرة</SelectItem>
                    <SelectItem value="age">السن</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>القيمة</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="rounded-xl bg-background border-border"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isActive">مفعلة</Label>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setActiveTab("list")} className="rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingPolicy ? "تحديث" : "إضافة"} السياسة
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}