import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MainLayout } from "@/components/main-layout";
import { KPICard } from "@/components/kpi-card"
import { ProgressBar } from "@/components/progress-bar"
import { ActivityTimeline } from "@/components/activity-timeline"
import { OccupancyChartServer } from "@/components/charts/occupancy-chart-server"
import { UnitStatusChartServer } from "@/components/charts/unit-status-chart-server"
import { ReservationSourcesChart } from "@/components/charts/reservation-sources-chart-server"
import { UnitStatusList } from "@/components/unit-status-list"
import { Building2, CalendarPlus, CalendarCheck, Users, Banknote } from "lucide-react";

interface Activity {
  id: string;
  type: 'payment' | 'check-in' | 'booking' | 'check-out';
  title: string;
  description: string;
  time: string;
}

interface Unit {
  id: string;
  number: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'maintenance';
  guest?: string;
}

interface KPIData {
  totalUnits: number;
  newBookings: number;
  activeBookings: number;
  currentGuests: number;
  todayRevenue: number;
}

interface DashboardData {
  kpiData: KPIData;
  activities: Activity[];
  units: Unit[];
  checkoutReady: {
    count: number;
    max: number;
  };
  checkinReady: {
    count: number;
    max: number;
  };
}

async function getDashboardData(hotelId: string): Promise<DashboardData> {
  const supabase = await createClient();

  // Fetch KPI data
  const [
    { count: totalUnits },
    { count: newBookings },
    { count: activeBookings },
    { count: currentGuests },
    { data: revenueData }
  ] = await Promise.all([
    // Total units
    supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId),

    // New bookings in the last 7 days
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['pending', 'confirmed']),

    // Active bookings (where check_in <= today and check_out >= today)
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .gte('check_out', new Date().toISOString().split('T')[0])
      .lte('check_in', new Date().toISOString().split('T')[0])
      .in('status', ['confirmed', 'checked_in']),

    // Current guests (checked in but not checked out yet)
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .eq('status', 'checked_in'),

    // Today's revenue
    supabase
      .from('bookings')
      .select('total_amount')
      .eq('hotel_id', hotelId)
      .eq('status', 'checked_out')
      .eq('check_out', new Date().toISOString().split('T')[0])
  ]);

  // Calculate today's revenue
  const todayRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

  // Fetch recent activities
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      check_in,
      check_out,
      status,
      source,
      created_at,
      guests(first_name, last_name)
    `)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      method,
      created_at,
      booking_id,
      bookings(units(name))
    `)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Combine and format activities
  const activities: Activity[] = [];

  // Process recent bookings
  recentBookings?.forEach(booking => {
    const guestName = booking.guests?.first_name && booking.guests?.last_name
      ? `${booking.guests.first_name} ${booking.guests.last_name}`
      : 'ضيف';

    activities.push({
      id: `booking-${booking.id}`,
      type: 'booking',
      title: 'حجز جديد',
      description: `حجز من ${booking.source || 'مباشر'} - ${guestName}`,
      time: new Date(booking.created_at).toLocaleDateString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }),
    });
  });

  // Process recent payments
  recentPayments?.forEach(payment => {
    const unitName = payment.bookings?.units?.name || 'وحدة';
    activities.push({
      id: `payment-${payment.id}`,
      type: 'payment',
      title: 'دفعة جديدة',
      description: `استلام ${payment.amount.toLocaleString('ar-SA')} ر.س - ${unitName}`,
      time: new Date(payment.created_at).toLocaleDateString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }),
    });
  });

  // Sort activities by most recent
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  // Take only the last 5 activities
  const latestActivities = activities.slice(0, 5);

  // Fetch units
  const { data: unitsData } = await supabase
    .from('units')
    .select('id, name, status')
    .eq('hotel_id', hotelId)
    .limit(12);

  const units: Unit[] = unitsData?.map(unit => ({
    id: unit.id,
    number: unit.name,
    status: unit.status as 'occupied' | 'vacant' | 'reserved' | 'maintenance',
  })) || [];

  // Calculate checkout and checkin ready counts
  const today = new Date().toISOString().split('T')[0];
  const { count: checkoutReadyCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', hotelId)
    .eq('check_out', today)
    .eq('status', 'checked_in');

  const { count: checkinReadyCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', hotelId)
    .eq('check_in', today)
    .eq('status', 'confirmed');

  const kpiData: KPIData = {
    totalUnits: totalUnits || 0,
    newBookings: newBookings || 0,
    activeBookings: activeBookings || 0,
    currentGuests: currentGuests || 0,
    todayRevenue: todayRevenue || 0,
  };

  return {
    kpiData,
    activities: latestActivities,
    units,
    checkoutReady: { count: checkoutReadyCount || 0, max: totalUnits || 100 },
    checkinReady: { count: checkinReadyCount || 0, max: totalUnits || 100 }
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get hotel ID for the logged-in user
  const { data: userHotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (hotelError || !userHotel) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline">لا توجد فنادق مرتبطة بحسابك أو حدث خطأ أثناء تحميل البيانات</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  let dashboardData: DashboardData | null = null;
  let error = null;

  try {
    dashboardData = await getDashboardData(userHotel.id);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error || !dashboardData) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline">حدث خطأ أثناء تحميل بيانات لوحة التحكم: {error}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { kpiData, activities, units, checkoutReady, checkinReady } = dashboardData;

  return (
    <MainLayout>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <KPICard
            title="إجمالي الوحدات"
            value={kpiData.totalUnits}
            icon={Building2}
            variant="primary"
          />
          <KPICard
            title="حجوزات جديدة"
            value={kpiData.newBookings}
            subtitle="هذا الأسبوع"
            icon={CalendarPlus}
            trend={{ value: 0, isPositive: true }} // Placeholder trend - would require more complex logic
            variant="success"
          />
          <KPICard
            title="حجوزات نشطة"
            value={kpiData.activeBookings}
            icon={CalendarCheck}
            variant="default"
          />
          <KPICard
            title="الضيوف الحاليين"
            value={kpiData.currentGuests}
            icon={Users}
            variant="default"
          />
          <KPICard
            title="إيرادات اليوم"
            value={kpiData.todayRevenue.toLocaleString('ar-SA')}
            subtitle="ر.س"
            icon={Banknote}
            trend={{ value: 0, isPositive: true }} // Placeholder trend
            variant="success"
          />
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">جاهز للمغادرة</h3>
            <ProgressBar
              label="الوحدات الجاهزة للمغادرة اليوم"
              value={checkoutReady.count}
              max={checkoutReady.max}
              variant="warning"
            />
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">جاهز للوصول</h3>
            <ProgressBar
              label="الوحدات الجاهزة للوصول اليوم"
              value={checkinReady.count}
              max={checkinReady.max}
              variant="success"
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Occupancy */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">نسبة الإشغال الأسبوعية</h3>
            <OccupancyChartServer hotelId={userHotel.id} />
          </div>

          {/* Activity Timeline */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">آخر النشاطات</h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Unit Status Pie Chart */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">توزيع حالة الوحدات</h3>
            <UnitStatusChartServer hotelId={userHotel.id} />
          </div>

          {/* Reservation Sources */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">مصادر الحجوزات</h3>
            <ReservationSourcesChart hotelId={userHotel.id} />
          </div>
        </div>

        {/* Unit Status Grid */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">حالة الوحدات</h3>
          <UnitStatusList units={units} />
        </div>
      </MainLayout>
  )
}
