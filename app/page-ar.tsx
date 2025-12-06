'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Menu,
  Star,
  Award,
  Sparkles,
  User,
  LogOut,
  MapPin,
  Calendar,
  Home,
  Search,
  Heart,
  ShoppingCart,
  Phone,
  Mail,
  Globe,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Mountain,
  Building,
  Moon,
  Sun,
  Check,
  X,
  ChefHat,
  Shield,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/server';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PublicUnitsDisplayArServer } from '@/components/public-units-display-ar-server';
import { SelfCheckInDisplayArServer } from '@/components/selfcheckin-display-ar-server';
import { MonthlyRentalsDisplayArServer } from '@/components/monthly-rentals-display-ar-server';
import { getPublicUnits } from '@/lib/public-units-service';

// Navigation menu items in Arabic
const navigation = [
  { name: 'الرئيسية', href: '/ar' },
  { name: 'المدن الشهيرة', href: '#cities' },
  { name: 'العروض', href: '#offers' },
  { name: 'الإيجارات الشهرية', href: '#monthly' },
  { name: 'اتصل بنا', href: '#contact' },
];

// Popular Saudi Arabian cities data in Arabic
const popularCities = [
  { id: 1, name: 'الرياض', image: '/cities/riyadh-kingdom-tower.jpg', href: '/search?city=riyadh', region: 'منطقة الرياض' },
  { id: 2, name: 'جدة', image: '/cities/jeddah-seafront.jpg', href: '/search?city=jeddah', region: 'منطقة مكة المكرمة' },
  { id: 3, name: 'مكة المكرمة', image: '/cities/makkah-haram.jpg', href: '/search?city=makkah', region: 'منطقة مكة المكرمة' },
  { id: 4, name: 'المدينة المنورة', image: '/cities/medina-prophet-mosque.jpg', href: '/search?city=medina', region: 'منطقة المدينة المنورة' },
  { id: 5, name: 'الدمام', image: '/cities/dammam-cityscape.jpg', href: '/search?city=dammam', region: 'المنطقة الشرقية' },
  { id: 6, name: 'تبوك', image: '/cities/tabuk-heritage.jpg', href: '/search?city=tabuk', region: 'منطقة تبوك' },
  { id: 7, name: 'الخبر', image: '/cities/khobar-marina.jpg', href: '/search?city=khobar', region: 'المنطقة الشرقية' },
  { id: 8, name: 'الطائف', image: '/cities/taif-mountain.jpg', href: '/search?city=taif', region: 'منطقة مكة المكرمة' },
  { id: 9, name: 'أبها', image: '/cities/abha-asir-region.jpg', href: '/search?city=abha', region: 'منطقة عسير' },
  { id: 10, name: 'حائل', image: '/cities/hail-district.jpg', href: '/search?city=hail', region: 'منطقة حائل' },
  { id: 11, name: 'عرعر', image: '/cities/arar-northern-borders.jpg', href: '/search?city=arar', region: 'منطقة الحدود الشمالية' },
  { id: 12, name: 'الباحة', image: '/cities/bahah-mountainous.jpg', href: '/search?city=bahah', region: 'منطقة الباحة' },
];

// Daily offers data in Arabic
const dailyOffers = [
  {
    id: 1,
    title: 'فندق قصر روיאל - خصم 35%',
    description: 'إقامة فاخرة في قلب الرياض مع سبا ومطاعم',
    originalPrice: 950,
    discountedPrice: 618,
    image: '/offers/riyadh-ritz-carlton-exterior.jpg',
    discountPercentage: 35,
    location: 'الرياض',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'منتجع مارينا جدة - خصم صيفي 30%',
    description: 'منتجع فاخر على شاطئ البحر مع وصول خاص للشاطئ',
    originalPrice: 820,
    discountedPrice: 574,
    image: '/offers/jeddah-fairmont-beach.jpg',
    discountPercentage: 30,
    location: 'جدة',
    rating: 4.7,
  },
  {
    id: 3,
    title: 'أبراج البيت - عرض مكة الخاص',
    description: 'فندق مميز بالقرب من الحرم مع إطلالات خلابة',
    originalPrice: 750,
    discountedPrice: 525,
    image: '/offers/makkah-abraj-al-bait-haram-view.jpg',
    discountPercentage: 30,
    location: 'مكة المكرمة',
    rating: 4.9,
  },
  {
    id: 4,
    title: 'مشروع البحر الأحمر - عرض حصري',
    description: 'منتجع فاخر من فئة الخمس نجوم في وجهة البحر الأحمر',
    originalPrice: 1500,
    discountedPrice: 1200,
    image: '/offers/red-sea-private-beach.jpg',
    discountPercentage: 20,
    location: 'البحر الأحمر',
    rating: 5.0,
  },
  {
    id: 5,
    title: 'منتجع الحجر التاريخي - تجربة ثقافية',
    description: 'منتجع فريد في الصحراء مع أنشطة ثقافية',
    originalPrice: 680,
    discountedPrice: 476,
    image: '/offers/alula-anantara-petra-style.jpg',
    discountPercentage: 30,
    location: 'العلا',
    rating: 4.6,
  },
  {
    id: 6,
    title: 'فنادق الدمام التجارية - أسعار الشركات',
    description: 'أفضل فنادق الأعمال مع مرافق المؤتمرات',
    originalPrice: 550,
    discountedPrice: 413,
    image: '/offers/dammam-four-seasons-business.jpg',
    discountPercentage: 25,
    location: 'الدمام',
    rating: 4.5,
  },
];

// Featured Saudi Arabian accommodations in Arabic
const featuredAccommodations = [
  {
    id: 1,
    name: 'ريتز كارلتون الرياض',
    location: 'الرياض',
    rating: 4.8,
    price: 1200,
    amenities: ['واي فاي', 'مكيف', 'مسبح', 'سبا'],
    image: '/accommodations/riyadh-ritz-carlton-kingdom-center-view.jpg',
    description: 'فندق فاخر من فئة 5 نجوم في حي السفارات بالرياض مع إطلالات بانورامية',
    facilities: ['مسبح', 'سبا وصحة', 'مطاعم متعددة', 'مركز لياقة'],
    rules: ['ممنوع التدخين في الغرف', 'الحد الأدنى للعمر: 18', 'ساعات الهدوء 10 م - 7 ص'],
  },
  {
    id: 2,
    name: 'فندق فيرمونت جدة',
    location: 'جدة',
    rating: 4.7,
    price: 950,
    amenities: ['واي فاي', 'مكيف', 'وصول للشاطئ', 'مسبح'],
    image: '/accommodations/jeddah-fairmont-sea-view.jpg',
    description: 'فندق فاخر على مياه البحر الأحمر مع وصول خاص للشاطئ وإطلالات مذهلة',
    facilities: ['شاطئ خاص', 'مطاعم متعددة', 'سبا', 'مرافق المؤتمرات'],
    rules: ['ممنوع التدخين في الأماكن العامة', 'ملابس السباحة مطلوبة عند المسبح', 'تسجيل الدخول: 3 م'],
  },
  {
    id: 3,
    name: 'ماريوت مكة',
    location: 'مكة المكرمة',
    rating: 4.9,
    price: 850,
    amenities: ['واي فاي', 'مكيف', 'غرفة صلاة', 'دعم الحج'],
    image: '/accommodations/makkah-marriott-haram-view.jpg',
    description: 'فندق مميز بالقرب من الحرم مع وصول مباشر لمواقع الحج',
    facilities: ['غرف صلاة', 'دعم الحج/العمرة', 'مطاعم', 'واي فاي مجاني'],
    rules: ['الملابس المحتشمة مطلوبة', 'احترام الحج/الإحرام', 'ممنوع الكحول'],
  },
  {
    id: 4,
    name: 'تطوير البحر الأحمر',
    location: 'البحر الأحمر',
    rating: 5.0,
    price: 3500,
    amenities: ['واي فاي', 'مكيف', 'شاطئ خاص', ' Butler شخصي'],
    image: '/accommodations/red-sea-ultra-luxury-resort.jpg',
    description: 'وجهة فاخرة من فئة الخمس نجوم مع جزر خاصة وتجارب حصرية',
    facilities: ['شواطئ خاصة', 'رياضات مائية', 'سبا', 'مطاعم فاخرة'],
    rules: ['احترام الحفاظ على البيئة مطلوب', 'الحد الأدنى للعمر: 16', 'الممارسات الصديقة للبيئة'],
  },
  {
    id: 5,
    name: 'أنانتارا العلا',
    location: 'العلا',
    rating: 4.6,
    price: 1800,
    amenities: ['واي فاي', 'مكيف', 'جولات ثقافية', 'أنشطة الصحراء'],
    image: '/accommodations/alula-anantara-petra-skyline.jpg',
    description: 'منتجع صحراء فاخر مع وصول إلى مواقع اليونسكو للتراث العالمي',
    facilities: ['مغامرات الصحراء', 'جولات ثقافية', 'سبا', 'مطاعم فاخرة'],
    rules: ['احترام المواقع الثقافية', 'الحفاظ على البيئة', 'الالتزام ب	code السر'],
  },
  {
    id: 6,
    name: 'フォー سيزونز الظهران',
    name: 'فورسيزونز الدمام',
    location: 'الدمام',
    rating: 4.7,
    price: 1100,
    amenities: ['واي فاي', 'مكيف', 'مركز اعمال', 'سبا'],
    image: '/accommodations/dammam-four-seasons-cityscape.jpg',
    description: 'فندق للأعمال والترفيه مع مرافق ممتازة في المنطقة الشرقية',
    facilities: ['مركز اعمال', 'غرف المؤتمرات', 'سبا', 'مطاعم متعددة'],
    rules: ['ادب اعمال الساعات', 'ساعات الهدوء 10 م - 7 ص', 'ملابس رسمية للمطاعم'],
  },
];

// Self-check-in accommodations in Saudi Arabia in Arabic
const selfCheckInAccommodations = [
  {
    id: 1,
    name: 'شقة برج المملكة الحديثة',
    location: 'الرياض',
    rating: 4.5,
    price: 480,
    amenities: ['دخول ذاتي', 'واي فاي', 'مكيف', 'تليفزيون ذكي'],
    image: '/accommodations/riyadh-kingdom-center-apartments.jpg',
    description: 'شقة مفروشة حديثة في الرياض مع نظام دخول ذكي',
  },
  {
    id: 2,
    name: 'فيلا البحر الأحمر الخاصة',
    location: 'جدة',
    rating: 4.8,
    price: 1250,
    amenities: ['دخول ذاتي', 'واي فاي', 'مكيف', 'مسبح خاص'],
    image: '/accommodations/jeddah-red-sea-private-villas.jpg',
    description: 'فيلا فاخرة خاصة مع وصول للشاطئ ونظام دخول تلقائي',
  },
  {
    id: 3,
    name: 'جناح حي السفارات',
    location: 'الرياض',
    rating: 4.6,
    price: 650,
    amenities: ['دخول ذاتي', 'واي فاي', 'مكيف', 'خدمات الاستقبال'],
    image: '/accommodations/riyadh-diplomatic-quarter-luxury-suite.jpg',
    description: 'جناح تنفيذي مع نظام دخول غير مباشر للمسافرين التجاريين',
  },
];

// Monthly rentals in Saudi Arabia in Arabic
const monthlyRentals = [
  {
    id: 1,
    name: 'شقة حي السفارات المميزة',
    location: 'الرياض',
    rating: 4.7,
    monthlyPrice: 15000,
    image: '/rentals/riyadh-diplomatic-quarter-luxury-apartments.jpg',
    description: 'شقة فاخرة مفروشة بالكامل في حي السفارات',
  },
  {
    id: 2,
    name: 'فيلا شاطئ البحر الأحمر',
    location: 'جدة',
    rating: 4.9,
    monthlyPrice: 28000,
    image: '/rentals/jeddah-red-sea-beachfront-villas.jpg',
    description: 'فيلا فاخرة على الشاطئ مع إطلالات مذهلة للبحر الأحمر',
  },
  {
    id: 3,
    name: 'مجمع العائلة في المنطقة الشرقية',
    location: 'الظهران',
    rating: 4.5,
    monthlyPrice: 22000,
    image: '/rentals/dhahran-eastern-family-compounds.jpg',
    description: 'مجمع واسع للعائلة مع غرف متعددة ومرافق متكاملة',
  },
  {
    id: 4,
    name: 'بيت تراثي فاخر',
    location: 'العلا',
    rating: 4.6,
    monthlyPrice: 18000,
    image: '/rentals/alula-historical-district-luxury-home.jpg',
    description: 'بيت فاخر ذي أهمية ثقافية مع مرافق حديثة',
  },
];

// Function to render stars based on rating
const renderStars = (rating: number) => {
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
    />
  ));
};

export default function ArabicHomePage() {
  // For now, using static user data - in a real implementation, you'd fetch this
  const user = null; // or actual user data
  const userProfile = null; // or actual profile data

  // State for search form
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would route to search results
    console.log({ destination, checkIn, checkOut, roomType });
  };

  return (
    <div className="min-h-screen bg-[#1E2228]" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-[#1E2228]/80 backdrop-blur-md border-b border-[#494C4F]/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/ar" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#EBEAE6]" />
            <span className="font-serif text-2xl font-medium tracking-tight text-[#EBEAE6]">وهل هست</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-12 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium tracking-wide text-[#494C4F] transition-colors hover:text-[#EBEAE6]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons - Different based on auth status */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Language switcher */}
            <button
              onClick={() => {
                if (window.location.pathname.startsWith('/ar')) {
                  window.location.href = '/';
                } else {
                  window.location.href = '/ar';
                }
              }}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="تبديل اللغة"
            >
              <Globe className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* User icons - cart and profile */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-accent transition-colors" aria-label="السلة">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </button>

              {user ? (
                // User is logged in - show profile dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 border rounded-full px-1 py-1.5 text-sm hover:bg-accent transition-colors focus:outline-none"
                      aria-label="قائمة الملف الشخصي"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt={userProfile.full_name || 'الملف الشخصي'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {userProfile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/logout" className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        <span>تسجيل الخروج</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // User is not logged in - show auth buttons
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">تسجيل الدخول</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-lg bg-amber-800 hover:bg-amber-700 px-6">
                    <Link href="/signup">ابدأ الآن</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background">
              <nav className="mt-12 flex flex-col gap-6">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} className="font-serif text-2xl font-medium text-foreground">
                    {item.name}
                  </Link>
                ))}

                {/* Language switcher in mobile */}
                <button
                  onClick={() => {
                    if (window.location.pathname.startsWith('/ar')) {
                      window.location.href = '/';
                    } else {
                      window.location.href = '/ar';
                    }
                  }}
                  className="flex items-center gap-2 font-serif text-xl text-foreground"
                >
                  <Globe className="h-5 w-5" />
                  تبديل اللغة
                </button>

                <div className="mt-8 flex flex-col gap-4">
                  {user ? (
                    // User is logged in - show profile options
                    <>
                      <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/dashboard">لوحة التحكم</Link>
                      </Button>

                      {/* Profile Options in Mobile */}
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-amber-800/30">
                          <Link href="/profile">الملف الشخصي</Link>
                        </Button>
                        <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-red-700/30 text-red-600">
                          <Link href="/logout">تسجيل الخروج</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    // User is not logged in - show auth buttons
                    <>
                      <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/login">تسجيل الدخول</Link>
                      </Button>
                      <Button asChild className="rounded-lg bg-amber-800 hover:bg-amber-700">
                        <Link href="/signup">ابدأ الآن</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative flex min-h-screen items-center justify-center pt-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-10 w-64 h-64 bg-amber-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-[#494C4F]/50 text-[#EBEAE6] text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>نظام إدارة الفنادق الفاخرة</span>
            </div>

            <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight sm:text-6xl lg:text-7xl text-[#EBEAE6]">
              <span className="italic">ضيافة استثنائية</span> <span className="text-amber-400">تلتقي</span> <span className="italic">بأعلى مستويات الراحة</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#494C4F]">
              خدمة تأجير ممتلكات سكنية متميزة في المملكة العربية السعودية تقدم تجربة فريدة لضيوفك
            </p>

            {/* Search Form */}
            <div className="mt-12 max-w-4xl mx-auto bg-[#1E2228] p-6 rounded-2xl shadow-lg border border-[#494C4F]">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#494C4F]">الوجهة</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#494C4F]" />
                    <input
                      type="text"
                      placeholder="المدينة أو المنطقة"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#494C4F] rounded-lg bg-[#1E2228] text-[#EBEAE6] focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">تاريخ الوصول</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#494C4F]">تاريخ المغادرة</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#494C4F]" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#494C4F] rounded-lg bg-[#1E2228] text-[#EBEAE6] focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#494C4F]">نوع المكان</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2 border border-[#494C4F] rounded-lg bg-[#1E2228] text-[#EBEAE6] focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="" className="bg-[#1E2228] text-[#EBEAE6]">الكل</option>
                    <option value="apartment" className="bg-[#1E2228] text-[#EBEAE6]">شقة</option>
                    <option value="studio" className="bg-[#1E2228] text-[#EBEAE6]">استوديو</option>
                    <option value="room" className="bg-[#1E2228] text-[#EBEAE6]">غرفة</option>
                    <option value="villa" className="bg-[#1E2228] text-[#EBEAE6]">فيلا</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-700 text-white py-2">
                    <Search className="h-4 w-4 ml-2" />
                    بحث
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-[#494C4F]">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-400" />
                <span>5 نجوم</span>
              </div>
              <div className="h-2 w-px bg-[#494C4F]"></div>
              <div>م Trusted by 500+ Hotels</div>
              <div className="h-2 w-px bg-[#494C4F]"></div>
              <div>24/7 دعم</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 right-1/2 transform translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#494C4F]">اسحب للأسفل</span>
            <div className="h-12 w-px bg-[#494C4F]" />
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section id="cities" className="py-24 lg:py-32 bg-[#1E2228]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-[#EBEAE6] flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EBEAE6]" />
              <span className="italic text-[#EBEAE6]">المدن الشهيرة</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl text-[#EBEAE6]">الوجهات المفضلة</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#494C4F] italic">
              اكتشف أفضل أماكن الإقامة في مدن المملكة العربية السعودية
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularCities.map((city) => (
              <Link
                key={city.id}
                href={city.href}
                className="flex flex-col items-center text-center group"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-4">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback image if the primary image doesn't load
                      (e.target as HTMLImageElement).src = '/placeholder-city.jpg';
                    }}
                  />
                </div>
                <span className="font-medium text-[#EBEAE6]">{city.name}</span>
                <span className="text-xs text-[#494C4F] mt-1">{city.region}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Offers Section */}
      <section id="offers" className="py-24 lg:py-32 bg-[#1E2228]/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-[#EBEAE6] flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EBEAE6]" />
              <span className="italic text-[#EBEAE6]">العروض اليومية</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl text-[#EBEAE6]">صفقات مذهلة</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#494C4F] italic">
              اكتشف أفضل العروض المتوفرة اليوم
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {dailyOffers.map((offer) => (
              <div key={offer.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full mb-3">
                        <span>خصم {offer.discountPercentage}%</span>
                      </div>
                      <h3 className="font-serif text-xl font-medium">{offer.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>
                      <div className="flex items-center mt-3">
                        {renderStars(offer.rating)}
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{offer.location}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-destructive line-through">
                          {offer.originalPrice} ر.س
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {offer.discountedPrice} ر.س
                        </span>
                      </div>
                      <Button className="bg-amber-800 hover:bg-amber-700">احجز الآن</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Accommodations */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="italic">ال places المميزة</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl"> places مميزة</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              أفضل places التي ن recommends لك
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <PublicUnitsDisplayArServer />
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-amber-800/30">
              عرض جميع places
            </Button>
          </div>
        </div>
      </section>

      {/* Self Check-in Accommodations */}
      <section id="self-checkin" className="py-24 lg:py-32 bg-amber-50/30 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              <span className="italic">دخول و خروج ذاتي</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">دخول ذاتي وموقع مثالي</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              اختر من أماكن الإقامة التي تتيح لك الدخول والخروج في أي وقت يناسبك
            </p>
          </div>

          <SelfCheckInDisplayArServer />
        </div>
      </section>

      {/* Monthly Rentals */}
      <section id="monthly" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Building className="h-4 w-4" />
              <span className="italic">الإيجارات الشهرية</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl"> places للإيجار الشهري</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              ابحث عن places مفروشة للإيجار الشهري بأسعار مميزة
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {monthlyRentals.map((rental) => (
              <div
                key={rental.id}
                className="border border-border/40 p-6 transition-all duration-300 hover:border-amber-700/50 rounded-xl bg-background"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg relative">
                  <img
                    src={rental.image}
                    alt={rental.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl font-medium">{rental.name}</h3>
                    <span className="text-lg font-bold text-foreground">
                      {rental.monthlyPrice} <span className="text-sm text-muted-foreground">ر.س/الشهر</span>
                    </span>
                  </div>

                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
                    <span className="text-sm text-muted-foreground">{rental.location}</span>
                  </div>

                  <div className="flex items-center mt-2">
                    {renderStars(rental.rating)}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {rental.description}
                  </p>

                  <Button className="mt-6 w-full bg-amber-800 hover:bg-amber-700">
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-amber-800/30">
              عرض جميع الإيجارات الشهرية
            </Button>
          </div>
        </div>
      </section>

      {/* Detailed Accommodation Description (Sample) */}
      <section className="py-24 lg:py-32 bg-amber-50/30 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              <span className="italic"> تفاصيل المكان</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl"> تجربة إقامة لا تُنسى</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              اكتشف المميزات والمرافق والقوانين ل places التي تختارها
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Accommodation image and basic info */}
            <div>
              <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
                <img
                  src="/placeholder-room.jpg"
                  alt="Sample accommodation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Accommodation details */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-3xl font-medium text-foreground">فندق الربوة</h3>
                <div className="flex items-center mt-2">
                  <MapPin className="h-5 w-5 text-muted-foreground ml-2" />
                  <span className="text-muted-foreground">الرياض</span>
                </div>
                <div className="flex items-center mt-2">
                  {renderStars(5)}
                  <span className="ml-2 text-muted-foreground">(5.0)</span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-medium text-foreground">وصف المكان</h4>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  فندق فاخر يقع في قلب الرياض، يوفر أماكن إقامة أنيقة مع إطلالات بانورامية على المدينة.
                  تم تجهيز جميع الغرف بواي فاي مجاني ومرافق حديثة لضمان راحة النزلاء.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium text-foreground">المرافق</h4>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: <Wifi className="h-4 w-4" />, text: 'واي فاي مجاني' },
                    { icon: <Car className="h-4 w-4" />, text: 'موقف سيارات' },
                    { icon: <ChefHat className="h-4 w-4" />, text: 'مطعم فاخر' },
                    { icon: <Coffee className="h-4 w-4" />, text: 'محل قهوة' },
                    { icon: <Utensils className="h-4 w-4" />, text: 'مطبخ مجهز' },
                    { icon: <Mountain className="h-4 w-4" />, text: 'صالة ألعاب رياضية' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-medium text-foreground">قوانين الإقامة</h4>
                <ul className="mt-3 space-y-2">
                  {[
                    'ممنوع التدخين في جميع المرافق',
                    'ممنوع إقامة الحفلات',
                    'ال Quiet hours من 10 مساءً إلى 8 صباحًا',
                    'الحد الأدنى للعمر: 25 سنة',
                    'إيداع تأمين قابل للاسترداد'
                  ].map((rule, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <Check className="h-4 w-4 text-amber-600 ml-2" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-medium text-foreground">آراء الضيوف</h4>
                <div className="mt-4 space-y-4">
                  {[
                    { name: 'محمد بن سعود', rating: 5, comment: 'تجربة استثنائية في فندق ريتز كارلتون الرياض! كانت الخدمة لا تُضاهى والإطلالة على برج المملكة مذهلة.' },
                    { name: 'فاطمة الحربي', rating: 4, comment: 'إقامة رائعة في جدة. كان موقع فيرمونت مثالياً لاستكشاف المنطقة التاريخية وساحل البحر الأحمر.' },
                    { name: 'خالد المبارك', rating: 5, comment: 'تجربة حج مثالية في فندق ماريوت مكة. القرب من الحرم والخدمات المميزة جعلت رحلتنا لا تُنسى.' },
                  ].map((review, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mr-3">
                          <div className="font-medium">{review.name}</div>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-foreground">450 ر.س</span>
                    <span className="text-muted-foreground">/الليلة</span>
                  </div>
                  <Button className="bg-amber-800 hover:bg-amber-700 px-8">
                    احجز الآن
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-32 bg-amber-50/30 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="italic">اتصل بنا</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">نحن هنا للمساعدة</h2>
            <p className="mx-auto mt-6 text-lg text-muted-foreground italic">
              فريق الدعم لدينا متاح على مدار الساعة لمساعدتك. من التسجيل إلى التخصيص، نكون معك في كل خطوة.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="rounded-lg bg-amber-800 hover:bg-amber-700 px-8">
                <Phone className="h-4 w-4 ml-2" />
                اتصل بنا
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg border-2 border-amber-800/30">
                <Mail className="h-4 w-4 ml-2" />
                support@example.com
              </Button>
            </div>
          </div>
        </div>
      </section>

     {/* Footer */}
<footer className="relative overflow-hidden border-t border-border/20 bg-gradient-to-b from-background via-background to-background/95 py-20">
  {/* Decorative elements */}
  <div className="absolute -top-20 left-1/4 h-40 w-40 rounded-full bg-amber-600/5 blur-3xl" />
  <div className="absolute bottom-0 right-1/3 h-60 w-60 rounded-full bg-border/5 blur-3xl" />
  
  <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
    <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:items-start">
      {/* Brand Section */}
      <div className="flex flex-col items-center md:items-start space-y-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-600/20 blur-xl group-hover:bg-amber-600/30 transition-all duration-500 rounded-full" />
            <Sparkles className="relative h-8 w-8 text-amber-600 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
          </div>
          <span className="font-serif text-2xl font-medium tracking-tight bg-gradient-to-r from-foreground via-foreground to-amber-600 bg-clip-text text-transparent">
            وهل هست
          </span>
        </div>
        <p className="text-center md:text-left text-muted-foreground/80 italic font-light max-w-xs leading-relaxed">
          إدارة الفنادق الفاخرة، مُعاد تعريفها.
          <span className="block mt-2 text-xs text-muted-foreground/60">
            حيث يتقابل الفخامة مع الابتكار
          </span>
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
        <div className="flex flex-col items-center md:items-start space-y-6">
          <h3 className="font-serif text-sm font-medium text-foreground/90 tracking-wider">روابط سريعة</h3>
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link
              href="/about"
              className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
            >
              <span className="text-sm font-light">حولنا</span>
              <ChevronLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
            >
              <span className="text-sm font-light">الشروط</span>
              <ChevronLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
            >
              <span className="text-sm font-light">الخصوصية</span>
              <ChevronLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Contact Section */}
      <div className="flex flex-col items-center md:items-start space-y-6">
        <h3 className="font-serif text-sm font-medium text-foreground/90 tracking-wider">تواصل معنا</h3>
        <div className="flex flex-col items-center md:items-start space-y-3">
          <p className="text-sm text-muted-foreground/80 font-light">info@wahlhist.com</p>
          <p className="text-sm text-muted-foreground/80 font-light">+966 12 345 6789</p>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="mt-16 pt-8 border-t border-border/30 relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
    </div>

    {/* Bottom Section */}
    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Social Links */}
      <div className="flex items-center gap-6">
        <Link 
          href="#" 
          className="text-muted-foreground/70 hover:text-foreground transition-all duration-300 p-2 hover:bg-amber-600/10 rounded-full group"
        >
          <Globe className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        </Link>
        <Link 
          href="#" 
          className="text-muted-foreground/70 hover:text-foreground transition-all duration-300 px-3 py-2 hover:bg-amber-600/10 rounded-lg group"
        >
          <span className="text-sm font-light group-hover:tracking-wider transition-all duration-300">فيسبوك</span>
        </Link>
        <Link 
          href="#" 
          className="text-muted-foreground/70 hover:text-foreground transition-all duration-300 px-3 py-2 hover:bg-amber-600/10 rounded-lg group"
        >
          <span className="text-sm font-light group-hover:tracking-wider transition-all duration-300">تويتر</span>
        </Link>
        <Link 
          href="#" 
          className="text-muted-foreground/70 hover:text-foreground transition-all duration-300 px-3 py-2 hover:bg-amber-600/10 rounded-lg group"
        >
          <span className="text-sm font-light group-hover:tracking-wider transition-all duration-300">انستجرام</span>
        </Link>
      </div>

      {/* Copyright */}
      <div className="text-center md:text-right">
        <p className="text-sm text-muted-foreground/60 font-light italic tracking-wide">
          © 2025 وهل هست
          <span className="mx-2">•</span>
          <span className="text-muted-foreground/50">جميع الحقوق محفوظة</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground/40 font-light">
          Designed with elegance in mind
        </p>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}