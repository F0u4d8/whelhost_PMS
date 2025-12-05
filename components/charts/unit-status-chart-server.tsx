import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { UnitStatusChart } from "./unit-status-chart";

interface Unit {
  id: string;
  number: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'maintenance';
  guest?: string;
}

export async function UnitStatusChartServer({ hotelId }: { hotelId: string }) {
  try {
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
      // Return chart with empty data if no access
      const defaultUnits: Unit[] = [];
      return <UnitStatusChart units={defaultUnits} />;
    }

    // Fetch units for the hotel
    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('id, name, status')
      .eq('hotel_id', hotelId);

    if (unitsError) {
      console.error("Error fetching units for status chart:", unitsError);
      const defaultUnits: Unit[] = [];
      return <UnitStatusChart units={defaultUnits} />;
    }

    const units: Unit[] = unitsData?.map(unit => ({
      id: unit.id,
      number: unit.name,
      status: unit.status as 'occupied' | 'vacant' | 'reserved' | 'maintenance',
    })) || [];

    return <UnitStatusChart units={units} />;
  } catch (error) {
    console.error("Error in UnitStatusChartServer:", error);
    const defaultUnits: Unit[] = [];
    return <UnitStatusChart units={defaultUnits} />;
  }
}