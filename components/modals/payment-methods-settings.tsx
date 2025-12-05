"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PaymentMethodsSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethods: string[];
  onAddPaymentMethod: (method: string) => void;
  onRemovePaymentMethod: (method: string) => void;
}

export function PaymentMethodsSettings({ 
  open, 
  onOpenChange, 
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod
}: PaymentMethodsSettingsProps) {
  const [newMethod, setNewMethod] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMethod.trim()) {
      if (paymentMethods.some(pm => pm.toLowerCase() === newMethod.trim().toLowerCase())) {
        toast.error("طريقة الدفع موجودة مسبقًا");
        return;
      }
      onAddPaymentMethod(newMethod.trim());
      setNewMethod("");
      toast.success("تم إضافة طريقة الدفع بنجاح");
    }
  };

  const handleRemove = (method: string) => {
    onRemovePaymentMethod(method);
    toast.success("تم حذف طريقة الدفع بنجاح");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-foreground">إدارة طرق الدفع</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              placeholder="إضافة طريقة دفع جديدة"
              className="rounded-xl bg-background border-border"
            />
            <Button type="submit" className="rounded-xl">
              إضافة
            </Button>
          </form>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {paymentMethods.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد طرق دفع</p>
            ) : (
              paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <span>{method}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleRemove(method)}
                  >
                    حذف
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}