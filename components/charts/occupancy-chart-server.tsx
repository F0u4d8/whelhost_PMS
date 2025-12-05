import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

interface OccupancyData {
  day: string;
  occupancy: number;
}

export async function OccupancyChartServer({ hotelId }: { hotelId: string }) {
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
    const defaultData: OccupancyData[] = [
      { day: "السبت", occupancy: 0 },
      { day: "الأحد", occupancy: 0 },
      { day: "الإثنين", occupancy: 0 },
      { day: "الثلاثاء", occupancy: 0 },
      { day: "الأربعاء", occupancy: 0 },
      { day: "الخميس", occupancy: 0 },
      { day: "الجمعة", occupancy: 0 },
    ];
    
    const OccupancyChart = (await import("./occupancy-chart")).OccupancyChart;
    return <OccupancyChart data={defaultData} />;
  }

  // Get total number of units to calculate occupancy percentage
  const { count: totalUnits } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', hotelId);

  if (!totalUnits || totalUnits === 0) {
    const defaultData: OccupancyData[] = [
      { day: "السبت", occupancy: 0 },
      { day: "الأحد", occupancy: 0 },
      { day: "الإثنين", occupancy: 0 },
      { day: "الثلاثاء", occupancy: 0 },
      { day: "الأربعاء", occupancy: 0 },
      { day: "الخميس", occupancy: 0 },
      { day: "الجمعة", occupancy: 0 },
    ];
    
    const OccupancyChart = (await import("./occupancy-chart")).OccupancyChart;
    return <OccupancyChart data={defaultData} />;
  }

  // Calculate occupancy for the last 7 days
  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  // Define Arabic day names
  const arabicDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  
  // Calculate occupancy for each day
  const occupancyData: OccupancyData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = last7Days[i];
    const dayName = arabicDays[i];
    
    // Get the number of occupied units on this date
    const { count: occupiedUnits } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotelId)
      .lte('check_in', date)  // Check-in date is before or on this date
      .gte('check_out', date) // Check-out date is after or on this date
      .in('status', ['confirmed', 'checked_in']); // Active bookings only
    
    // Calculate occupancy percentage
    const occupancy = totalUnits > 0 ? Math.round((occupiedUnits! / totalUnits) * 100) : 0;
    
    occupancyData.push({
      day: dayName,
      occupancy
    });
  }

  const OccupancyChart = (await import("./occupancy-chart")).OccupancyChart;
  return <OccupancyChart data={occupancyData} />;
}