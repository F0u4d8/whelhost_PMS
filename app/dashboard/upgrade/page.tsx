import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default async function UpgradePage() {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get hotel ID for the logged-in user
  const { data: userHotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (hotelError || !userHotel) {
    redirect("/hotels");
  }

  // If user has premium access, redirect to dashboard
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  if (!profileError && profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date())) {
    redirect("/dashboard");
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">الحصول على الإصدار المميز</CardTitle>
            <CardDescription>
              قم بترقية حسابك للوصول إلى جميع ميزات إدارة الفندق المتقدمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الميزات المميزة تشمل:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>تقارير تفصيلية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>إدارة حجوزات متقدمة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>تخصيص تجربة الضيف</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>التكامل مع بوابات الدفع</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>دعم فني مميز</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => {
                    // In a real implementation, this would redirect to a payment page
                    window.location.href = '/dashboard/settings';
                  }}
                >
                  ترقية الحساب الآن
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}