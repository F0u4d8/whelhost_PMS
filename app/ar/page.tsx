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

// Navigation menu items in Arabic
const navigation = [
  { name: 'الرئيسية', href: '/' },
  { name: 'المدن الشهيرة', href: '#cities' },
  { name: 'العروض', href: '#offers' },
  { name: 'الإيجارات الشهرية', href: '#monthly' },
  { name: 'اتصل بنا', href: '#contact' },
];

// Popular cities data
const popularCities = [
  { name: 'الرياض', image: '/placeholder-city.jpg', href: '/search?city=riyadh' },
  { name: 'مكة', image: '/placeholder-city.jpg', href: '/search?city=mecca' },
  { name: 'جدة', image: '/placeholder-city.jpg', href: '/search?city=jeddah' },
  { name: 'أبها', image: '/placeholder-city.jpg', href: '/search?city=abha' },
  { name: 'العلا', image: '/placeholder-city.jpg', href: '/search?city=alula' },
  { name: 'حائل', image: '/placeholder-city.jpg', href: '/search?city=hail' },
  { name: 'جميع المدن', image: '/placeholder-city.jpg', href: '/search' },
];

// Daily offers data
const dailyOffers = [
  {
    id: 1,
    title: 'خصم 30% على الفنادق في جدة',
    description: 'فندق فخم بخصم كبير للحجز هذا الأسبوع',
    originalPrice: 850,
    discountedPrice: 595,
    image: '/placeholder-offer.jpg',
    discountPercentage: 30,
  },
  {
    id: 2,
    title: 'خصم 25% على الشقق في الرياض',
    description: 'استمتع بتجربة فاخرة بسعر مميز',
    originalPrice: 600,
    discountedPrice: 450,
    image: '/placeholder-offer.jpg',
    discountPercentage: 25,
  },
  {
    id: 3,
    title: 'عرض مميز في مكة',
    description: 'إقامة فاخرة مع وجبات مجانية',
    originalPrice: 750,
    discountedPrice: 525,
    image: '/placeholder-offer.jpg',
    discountPercentage: 30,
  },
];

// Featured accommodations
const featuredAccommodations = [
  {
    id: 1,
    name: 'فندق الربوة',
    location: 'الرياض',
    rating: 5,
    price: 450,
    amenities: ['واي فاي', 'مكيف', 'مطبخ', 'موقف سيارة'],
    image: '/placeholder-room.jpg',
    description: 'فندق فاخر يقع في قلب الرياض مع إطلالات خلابة',
    facilities: ['مسبح', 'سبا', 'مطعم', 'صالة ألعاب رياضية'],
    rules: ['ممنوع التدخين', 'ممنوع الحفلات', 'الحد الأدنى للعمر: 25 سنة'],
  },
  {
    id: 2,
    name: 'شقة العزيزية',
    location: 'جدة',
    rating: 4,
    price: 320,
    amenities: ['واي فاي', 'مكيف', 'مطبخ', 'حمام سباحة'],
    image: '/placeholder-room.jpg',
    description: 'شقة فاخرة مفروشة بالكامل في حي العزيزية',
    facilities: ['مسبح مشترك', 'موقف سيارات', 'محلات قريبة'],
    rules: ['ال Quiet hours 10 PM - 8 AM', 'ممنوع الحيوانات'],
  },
  {
    id: 3,
    name: 'استوديو النخيل',
    location: 'مكة',
    rating: 4,
    price: 280,
    amenities: ['واي فاي', 'مكيف', 'مطبخ', 'غسالة'],
    image: '/placeholder-room.jpg',
    description: 'استوديو حديث على بعد دقائق من الحرم',
    facilities: [' proximity to holy sites', 'موقف للسيارات'],
    rules: ['ال servitude to holy sites', 'Quiet hours enforced'],
  },
];

// Self-check-in accommodations
const selfCheckInAccommodations = [
  {
    id: 1,
    name: 'شقة مودرن بدخول ذاتي',
    location: 'الرياض',
    rating: 5,
    price: 380,
    amenities: ['دخول ذاتي', 'واي فاي', 'مكيف', 'مطبخ'],
    image: '/placeholder-room.jpg',
    description: 'شقة حديثة مع نظام دخول ذاتي مريح',
  },
  {
    id: 2,
    name: 'فيلا الراحة بدخول ذاتي',
    location: 'جدة',
    rating: 5,
    price: 650,
    amenities: ['دخول ذاتي', 'واي فاي', 'مكيف', 'حديقة'],
    image: '/placeholder-room.jpg',
    description: 'فيلا فاخرة مع حديقة ونظام دخول ذاتي',
  },
];

// Monthly rentals
const monthlyRentals = [
  {
    id: 1,
    name: 'شقة مفروشة (إيجار شهري)',
    location: 'الرياض',
    rating: 4,
    monthlyPrice: 8500,
    image: '/placeholder-room.jpg',
    description: 'شقة مفروشة بالكامل مناسبة للعائلات',
  },
  {
    id: 2,
    name: 'شقة عائلية (إيجار شهري)',
    location: 'جدة',
    rating: 5,
    monthlyPrice: 12000,
    image: '/placeholder-room.jpg',
    description: 'شقة عائلية كبيرة بمرافق متكاملة',
  },
  {
    id: 3,
    name: 'فيلا فاخرة (إيجار شهري)',
    location: 'الخبر',
    rating: 5,
    monthlyPrice: 18000,
    image: '/placeholder-room.jpg',
    description: 'فيلا فاخرة مع حديقة ومسبح خاص',
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
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/ar" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-serif text-2xl font-medium tracking-tight">وهل هست</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-12 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons - Different based on auth status */}
          <div className="hidden items-center gap-4 md:flex">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-amber-100/80 text-amber-800 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>نظام إدارة الفنادق الفاخرة</span>
            </div>

            <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <span className="italic">ضيافة استثنائية</span> <span className="text-amber-700">تلتقي</span> <span className="italic">بأعلى مستويات الراحة</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              خدمة تأجير ممتلكات سكنية متميزة في المملكة العربية السعودية تقدم تجربة فريدة لضيوفك
            </p>

            {/* Search Form */}
            <div className="mt-12 max-w-4xl mx-auto bg-card p-6 rounded-2xl shadow-lg">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">الوجهة</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="المدينة أو المنطقة"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background"
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
                  <label className="text-sm font-medium text-muted-foreground">تاريخ المغادرة</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">نوع المكان</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  >
                    <option value="">الكل</option>
                    <option value="apartment">شقة</option>
                    <option value="studio">استوديو</option>
                    <option value="room">غرفة</option>
                    <option value="villa">فيلا</option>
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

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-600" />
                <span>5 نجوم</span>
              </div>
              <div className="h-2 w-px bg-border"></div>
              <div>م Trusted by 500+ Hotels</div>
              <div className="h-2 w-px bg-border"></div>
              <div>24/7 دعم</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 right-1/2 transform translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">اسحب للأسفل</span>
            <div className="h-12 w-px bg-border" />
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section id="cities" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="italic">المدن الشهيرة</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">الوجهات المفضلة</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              اكتشف أفضل أماكن الإقامة في مدن المملكة العربية السعودية
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {popularCities.map((city, index) => (
              <Link
                key={index}
                href={city.href}
                className="flex flex-col items-center text-center group"
              >
                {index < 6 ? (
                  <>
                    <div className="aspect-square w-full rounded-xl overflow-hidden mb-4">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="font-medium text-foreground">{city.name}</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center group border border-border rounded-xl p-6 hover:border-amber-700 transition-colors h-full">
                    <div className="bg-muted rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{city.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Offers Section */}
      <section id="offers" className="py-24 lg:py-32 bg-amber-50/30 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="italic">العروض اليومية</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">صفقات مذهلة</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
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
            {featuredAccommodations.map((accommodation) => (
              <div
                key={accommodation.id}
                className="border border-border/40 p-6 transition-all duration-300 hover:border-amber-700/50 rounded-xl bg-background"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg relative">
                  <img
                    src={accommodation.image}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl font-medium">{accommodation.name}</h3>
                    <span className="text-lg font-bold text-foreground">
                      {accommodation.price} <span className="text-sm text-muted-foreground">ر.س/الليلة</span>
                    </span>
                  </div>

                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
                    <span className="text-sm text-muted-foreground">{accommodation.location}</span>
                  </div>

                  <div className="flex items-center mt-2">
                    {renderStars(accommodation.rating)}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {accommodation.amenities.map((amenity, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-700 ml-2" />
                        {amenity}
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6 w-full bg-amber-800 hover:bg-amber-700">
                    عرض التفاصيل
                  </Button>
                </div>

                {/* Detailed description section */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {accommodation.description}
                  </p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-foreground">المميزات</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {accommodation.facilities.map((facility, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-muted rounded">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

          <div className="grid gap-8 md:grid-cols-2">
            {selfCheckInAccommodations.map((accommodation) => (
              <div
                key={accommodation.id}
                className="border border-border/40 p-6 transition-all duration-300 hover:border-amber-700/50 rounded-xl bg-background"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5">
                    <div className="aspect-square w-full rounded-xl overflow-hidden">
                      <img
                        src={accommodation.image}
                        alt={accommodation.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:mr-6 md:w-3/5">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-xl font-medium">{accommodation.name}</h3>
                      <span className="text-lg font-bold text-foreground">
                        {accommodation.price} <span className="text-sm text-muted-foreground">ر.س/الليلة</span>
                      </span>
                    </div>

                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
                      <span className="text-sm text-muted-foreground">{accommodation.location}</span>
                    </div>

                    <div className="flex items-center mt-2">
                      {renderStars(accommodation.rating)}
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {accommodation.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {accommodation.amenities.map((amenity, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-700 ml-2" />
                          {amenity}
                        </div>
                      ))}
                    </div>

                    <Button className="mt-6 w-full bg-amber-800 hover:bg-amber-700">
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    { name: 'أحمد محمد', rating: 5, comment: 'تجربة رائعة! الغرف نظيفة والخدمة ممتازة.' },
                    { name: 'فاطمة علي', rating: 4, comment: 'الموقع ممتاز، فقط كان الصوت مرتفعًا قليلاً في المساء.' },
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
      <footer className="border-t border-border/40 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-600" />
                <span className="font-serif text-xl font-medium">وهل هست</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground italic">إدارة الفنادق الفاخرة، مُعاد تعريفها.</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-8">
              <Link
                href="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                حولنا
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                الشروط
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                الخصوصية
              </Link>
            </nav>
          </div>

          <div className="mt-12 border-t border-border/40 pt-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex gap-6 mb-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Globe className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="text-sm">فيسبوك</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="text-sm">تويتر</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="text-sm">انستجرام</span>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground italic">2025 و هل هست . جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}