import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { ReservationSourcesChartClient } from "./reservation-sources-chart";

interface ReservationSourceData {
  source: string;
  reservations: number;
}

export async function ReservationSourcesChart({ hotelId }: { hotelId: string }) {
  const supabase = await createClient();
  const user = await requireAuth();
  
  // Verify that the user has access to this hotel
  const { data: userHotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id')
    .eq('id', hotelId)
    .eq('owner_id', user.id)
    .single();

  if (hotelError || !userHotel) {
    // Return a chart with empty data if no access
    return (
      <ReservationSourcesChartClient data={[]} />
    );
  }

  // Fetch reservation source data
  const { data: sourcesData } = await supabase
    .from('bookings')
    .select('source')
    .eq('hotel_id', hotelId);

  // Group by source and count occurrences
  const sourceCounts: Record<string, number> = {};
  sourcesData?.forEach(booking => {
    const source = booking.source || 'أخرى';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  // Convert to array format for chart
  const chartData: ReservationSourceData[] = Object.entries(sourceCounts).map(([source, count]) => ({
    source: source === 'direct' ? 'مباشر' : source,
    reservations: count
  }));

  return (
    <ReservationSourcesChartClient data={chartData} />
  );
}