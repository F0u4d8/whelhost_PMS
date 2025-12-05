"use client"

import { Sidebar } from "@/components/sidebar"
import { MainLayout } from "@/components/main-layout"
import { SettingsSection } from "@/components/settings-section"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  Mail,
  CreditCard,
  DollarSign,
  ShoppingCart,
  CalendarCheck,
  Network,
  ListChecks,
  ClipboardList,
  Star,
  Building,
  Home,
  Tag,
  Clock,
  Zap,
  Briefcase,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <MainLayout>

        {/* Finance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            المالية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingsSection icon={Mail} title="إدارة البريد" description="تكوين إعدادات البريد الإلكتروني">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تكوين
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={CreditCard} title="طرق الدفع" description="إدارة بوابات وطرق الدفع">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={DollarSign} title="الرسوم والضرائب" description="تكوين الرسوم والضرائب الإضافية">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تعديل
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={ShoppingCart} title="المشتريات" description="إدارة المشتريات والموردين">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                فتح
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            الحجوزات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingsSection icon={ListChecks} title="شروط الحجز" description="تعديل سياسات وشروط الحجز">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تحرير
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Network} title="إدارة المصادر" description="تكوين قنوات الحجز">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Tag} title="أنواع الحجوزات" description="تصنيف أنواع الحجوزات المختلفة">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                عرض
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={ClipboardList} title="مهام الخدمة" description="إدارة مهام خدمة الغرف">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Star} title="تقييمات الضيوف" description="إعدادات التقييمات والمراجعات">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تكوين
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>
          </div>
        </div>

        {/* Facility Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            إدارة المنشأة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingsSection icon={Home} title="بيانات الحساب" description="معلومات المنشأة والحساب">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تعديل
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Tag} title="أنواع الوحدات" description="تصنيف أنواع الوحدات">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Building} title="قائمة الوحدات" description="إدارة جميع الوحدات">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                عرض
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={DollarSign} title="قواعد التسعير" description="استراتيجيات التسعير الديناميكي">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تكوين
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Clock} title="ساعات العمل" description="تحديد أوقات العمل والتشغيل">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تعديل
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Zap} title="المرافق والاستهلاك" description="إدارة الكهرباء والماء وغيرها">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Briefcase} title="الشركات والموردين" description="إدارة الشركات والموردين">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                عرض
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Mail} title="إدارة البريد الإلكتروني" description="قوالب البريد الإلكتروني">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تحرير
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            إدارة المستخدمين
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsSection icon={Users} title="المستخدمين" description="إدارة حسابات المستخدمين">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                إدارة
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>

            <SettingsSection icon={Shield} title="الأدوار والصلاحيات" description="تكوين صلاحيات الوصول">
              <Button variant="outline" className="w-full rounded-xl gap-2 bg-transparent">
                تكوين
                <ChevronRight className="w-4 h-4" />
              </Button>
            </SettingsSection>
          </div>
        </div>
      </MainLayout>
  )
}
