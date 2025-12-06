import { createClient } from "@/lib/supabase/server";
import { requirePremium } from "@/lib/premium";
import ReportsServer from "./ReportsServer";

interface ReportData {
  revenueData: { day: string; revenue: number; expenses: number }[];
  channelData: { name: string; value: number; color: string }[];
  occupancyData: { month: string; rate: number }[];
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalReservations: number;
    occupancyRate: number;
    avgRevenuePerReservation: number;
    totalGuests: number;
  };
}

async function getReportData(hotelId: string): Promise<ReportData> {
  const supabase = await createClient();

  // Fetch all required data for reports
  const [
    // Units data
    { data: unitsData, error: unitsError },
    // Reservations data
    { data: bookingsData, error: bookingsError },
    // Guests data
    { data: guestsData, error: guestsError },
    // Revenue data (payments)
    { data: paymentsData, error: paymentsError },
    // Bookings for occupancy calculation
    { data: allBookings, error: allBookingsError }
  ] = await Promise.all([
    // Units data
    supabase
      .from('units')
      .select('id')
      .eq('hotel_id', hotelId)
      .then(result => result)
      .catch(error => {
        console.error('Error fetching units:', error);
        return { data: [], error };
      }),

    // Bookings data for stats
    supabase
      .from('bookings')
      .select('id, total_amount, source, check_in, check_out, status')
      .eq('hotel_id', hotelId)
      .then(result => result)
      .catch(error => {
        console.error('Error fetching bookings:', error);
        return { data: [], error };
      }),

    // Guests data
    supabase
      .from('guests')
      .select('id')
      .eq('hotel_id', hotelId)
      .then(result => result)
      .catch(error => {
        console.error('Error fetching guests:', error);
        return { data: [], error };
      }),

    // Payments data (for revenue)
    supabase
      .from('payments')
      .select('amount, created_at, status')
      .eq('hotel_id', hotelId)
      .eq('status', 'completed')
      .then(result => result)
      .catch(error => {
        console.error('Error fetching payments:', error);
        return { data: [], error };
      }),

    // All bookings for occupancy calculations
    supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('hotel_id', hotelId)
      .then(result => result)
      .catch(error => {
        console.error('Error fetching all bookings:', error);
        return { data: [], error };
      })
  ]);

  if (unitsError || bookingsError || guestsError || paymentsError || allBookingsError) {
    throw new Error('Error fetching data for reports');
  }

  // Calculate stats
  const totalUnits = unitsData?.length || 0;
  const totalReservations = bookingsData?.length || 0;
  const totalGuests = guestsData?.length || 0;

  // Calculate revenue from completed payments
  const totalRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  // For expenses, we'll calculate based on a percentage of revenue as an example
  // In a real system, you'd fetch actual expense data
  const totalExpenses = Math.round(totalRevenue * 0.25); // 25% of revenue as example expenses
  const netIncome = totalRevenue - totalExpenses;
  const avgRevenuePerReservation = totalReservations > 0 ? Math.round(totalRevenue / totalReservations) : 0;

  // Calculate occupancy rate - count bookings that are currently active
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const activeBookings = allBookings?.filter(booking => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    return checkIn <= today && checkOut >= today && booking.status !== 'cancelled';
  }).length || 0;

  const occupancyRate = totalUnits > 0 ? Math.round((activeBookings / totalUnits) * 100) : 0;

  // Generate revenue data for the last 7 days
  const revenueData = [];
  const arabicDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = arabicDays[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];

    // Calculate revenue for this day
    const dayRevenue = paymentsData?.filter(payment =>
      payment.created_at.startsWith(dateStr)
    ).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Calculate expenses for this day (simulated)
    const dayExpenses = Math.round(dayRevenue * 0.25);

    revenueData.push({
      day: dayName,
      revenue: dayRevenue,
      expenses: dayExpenses
    });
  }

  // Calculate channel distribution from bookings
  const sourceCounts: Record<string, number> = {};
  bookingsData?.forEach(booking => {
    const source = booking.source || 'أخرى';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const channelData = Object.entries(sourceCounts).map(([source, count], index) => {
    // Assign colors based on known sources or default
    const colors = ["#14b8a6", "#3b82f6", "#f43f5e", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"];
    return {
      name: source === 'direct' ? 'مباشر' :
           source === 'booking_com' ? 'Booking.com' :
           source === 'airbnb' ? 'Airbnb' :
           source === 'expedia' ? 'Expedia' :
           source,
      value: count,
      color: colors[index % colors.length]
    };
  });

  // Calculate occupancy trend for the last 6 months
  const occupancyData = [];
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const monthName = months[monthDate.getMonth()];
    const year = monthDate.getFullYear();

    // Calculate days in this month
    const daysInMonth = new Date(year, monthDate.getMonth() + 1, 0).getDate();

    // Count occupied days for this month
    let occupiedDays = 0;
    const daysChecked = new Set();

    allBookings?.forEach(booking => {
      // Ensure booking dates are valid
      if (!booking.check_in || !booking.check_out) return;

      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      // Check if booking falls in the current month
      if (checkIn.getMonth() === monthDate.getMonth() && checkIn.getFullYear() === year) {
        // Calculate occupied days in this specific month
        const startDay = Math.max(checkIn.getDate(), 1);
        const endDay = checkOut.getMonth() === monthDate.getMonth()
          ? checkOut.getDate()
          : daysInMonth;

        // Add the number of days in this month for this booking
        for (let d = startDay; d <= endDay; d++) {
          if (!daysChecked.has(`${year}-${monthDate.getMonth()}-${d}`)) {
            occupiedDays++;
            daysChecked.add(`${year}-${monthDate.getMonth()}-${d}`);
          }
        }
      } else if (checkOut.getMonth() === monthDate.getMonth() && checkOut.getFullYear() === year) {
        // If booking ends in this month but starts in previous
        for (let d = 1; d <= checkOut.getDate(); d++) {
          if (!daysChecked.has(`${year}-${monthDate.getMonth()}-${d}`)) {
            occupiedDays++;
            daysChecked.add(`${year}-${monthDate.getMonth()}-${d}`);
          }
        }
      } else if (checkIn.getMonth() < monthDate.getMonth() && checkOut.getMonth() > monthDate.getMonth() &&
                 checkIn.getFullYear() <= year && checkOut.getFullYear() >= year) {
        // If booking spans the entire month
        for (let d = 1; d <= daysInMonth; d++) {
          if (!daysChecked.has(`${year}-${monthDate.getMonth()}-${d}`)) {
            occupiedDays++;
            daysChecked.add(`${year}-${monthDate.getMonth()}-${d}`);
          }
        }
      }
    });

    // Calculate average monthly occupancy based on units and days
    const expectedOccupancy = totalUnits > 0 ? Math.round((occupiedDays / (daysInMonth * totalUnits)) * 100) : 0;

    occupancyData.push({
      month: monthName,
      rate: expectedOccupancy
    });
  }

  return {
    revenueData,
    channelData,
    occupancyData,
    stats: {
      totalRevenue,
      totalExpenses,
      netIncome,
      totalReservations,
      occupancyRate,
      avgRevenuePerReservation,
      totalGuests
    }
  };
}

export default async function ReportsContent() {
  const { user } = await requirePremium();
  const supabase = await createClient();

  // Get hotel ID for the logged-in user
  const { data: userHotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (hotelError || !userHotel) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">لا توجد فنادق مرتبطة بحسابك أو حدث خطأ أثناء تحميل البيانات</span>
        </div>
      </div>
    );
  }

  let reportData: ReportData | null = null;
  let error = null;

  try {
    reportData = await getReportData(userHotel.id);
  } catch (err) {
    console.error("Error fetching report data:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error || !reportData) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">حدث خطأ أثناء تحميل بيانات التقارير: {error}</span>
        </div>
      </div>
    );
  }

  return <ReportsServer reportData={reportData} />;
}