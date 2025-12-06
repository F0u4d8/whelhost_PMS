"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CheckoutCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "unknown">("loading");
  const [paymentInfo, setPaymentInfo] = useState<{ id?: string; amount?: number; currency?: string }>({});

  useEffect(() => {
    const paymentId = searchParams.get("id");
    const paymentStatus = searchParams.get("status");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");

    // Determine status based on URL parameters
    if (paymentStatus === "success" || paymentStatus === "completed") {
      setStatus("success");
      setPaymentInfo({
        id: paymentId || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        currency: currency || "SAR"
      });
    } else if (paymentStatus === "failed" || paymentStatus === "error") {
      setStatus("failed");
      setPaymentInfo({ id: paymentId || undefined });
    } else {
      // If no status parameter, check if there are other payment parameters
      if (paymentId) {
        // For Moyasar, they typically redirect with the status in the URL
        // Let's try to determine the status based on presence of the payment ID
        setStatus("unknown");
        setPaymentInfo({ id: paymentId });
      }
    }
  }, [searchParams]);

  const getStatusContent = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          title: "الدفع ناجح!",
          message: `تمت عملية الدفع ${paymentInfo.amount ? `بقيمة ${paymentInfo.amount} ${paymentInfo.currency || "SAR"}` : ""} بنجاح.`,
          button: (
            <Link href="/dashboard" className="w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-[#1E2228]">
                الذهاب إلى لوحة التحكم
              </Button>
            </Link>
          )
        };
      case "failed":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "فشلت عملية الدفع",
          message: paymentInfo.id 
            ? `فشلت عملية الدفع مع المعرف: ${paymentInfo.id}` 
            : "فشلت عملية الدفع. يرجى المحاولة مرة أخرى.",
          button: (
            <Link href="/checkout" className="w-full">
              <Button variant="outline" className="w-full border-[#494C4F] text-[#EBEAE6]">
                المحاولة مرة أخرى
              </Button>
            </Link>
          )
        };
      case "unknown":
        return {
          icon: <CreditCard className="h-16 w-16 text-amber-500" />,
          title: "جاري التحقق من حالة الدفع",
          message: "نقوم بالتحقق من حالة عملية الدفع الخاصة بك...",
          button: (
            <Link href="/dashboard" className="w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-[#1E2228]">
                الذهاب إلى لوحة التحكم
              </Button>
            </Link>
          )
        };
      default:
        return {
          icon: <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />,
          title: "جاري معالجة الدفع...",
          message: "الرجاء الانتظار بينما نقوم بمعالجة عملية الدفع الخاصة بك.",
          button: null
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-[#1E2228] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-[#494C4F] bg-[#1E2228]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {content.icon}
            </div>
            <CardTitle className="text-[#EBEAE6] text-2xl">{content.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-[#494C4F]">
              {content.message}
            </p>
            
            {status === "loading" && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            )}
            
            {content.button && (
              <div className="pt-4">
                {content.button}
              </div>
            )}
            
            <div className="text-center text-sm text-[#494C4F]">
              <p>مدعوم من Moyasar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}