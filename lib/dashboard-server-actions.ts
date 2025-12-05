"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  unit: string;
  guest: string;
  total: number;
  status: "paid" | "pending" | "upcoming" | "completed" | "cancelled" | "active";
  createdAt: string;
}

export interface UnitStatus {
  id: string;
  number: string;
  name: string;
  status: "occupied" | "vacant" | "out-of-service" | "departure-today" | "arrival-today";
}

export interface DashboardData {
  reservations: Reservation[];
  units: UnitStatus[];
  kpis: {
    totalReservations: number;
    occupiedUnits: number;
    vacantUnits: number;
    revenue: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return {
      reservations: [],
      units: [],
      kpis: {
        totalReservations: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        revenue: 0,
      },
    };
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Get reservations for the user's hotels
  let reservations: Reservation[] = [];

  try {
    const { data: reservationsData, error: reservationsError } = await supabase
      .from("bookings")
      .select(`
        id,
        check_in,
        check_out,
        total_amount,
        status,
        created_at
      `)
      .in("hotel_id", hotelIds);

    if (reservationsError) {
      console.warn("Error fetching reservations:", reservationsError.message);
      // If reservations table doesn't exist or has issues, return empty array
      reservations = [];
    } else {
      // Process reservation data
      reservations = reservationsData.map(item => ({
        id: item.id,
        checkIn: item.check_in,
        checkOut: item.check_out,
        unit: "Unit", // Need to join with units table to get unit info
        guest: "Guest", // Need to join with guests table to get guest info
        total: item.total_amount || 0,
        status: mapReservationStatus(item.status),
        createdAt: item.created_at || new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error("Error in reservations fetch:", error);
    reservations = [];
  }

  // Get units for the user's hotels
  let units: UnitStatus[] = [];

  try {
    const { data: unitsData, error: unitsError } = await supabase
      .from("units")
      .select(`
        id,
        number,
        name,
        status
      `)
      .in("hotel_id", hotelIds);

    if (unitsError) {
      console.warn("Error fetching units:", unitsError.message);
      // If units table doesn't exist or has issues, return empty array
      units = [];
    } else {
      // Process units data
      units = unitsData.map(item => ({
        id: item.id,
        number: item.number || "N/A",
        name: item.name || "Unit",
        status: mapUnitStatus(item.status) || "vacant",
      }));
    }
  } catch (error) {
    console.error("Error in units fetch:", error);
    units = [];
  }

  // Calculate KPIs
  const totalReservations = reservations.length;
  const occupiedUnits = units.filter(unit => unit.status === "occupied").length;
  const vacantUnits = units.filter(unit => unit.status === "vacant").length;
  const revenue = reservations.reduce((sum, reservation) => sum + reservation.total, 0);

  return {
    reservations,
    units,
    kpis: {
      totalReservations,
      occupiedUnits,
      vacantUnits,
      revenue,
    },
  };
}

function mapReservationStatus(status: string): Reservation['status'] {
  switch (status) {
    case 'confirmed':
    case 'checked_in':
    case 'active':
      return 'active';
    case 'completed':
    case 'checked_out':
      return 'completed';
    case 'cancelled':
    case 'no_show':
      return 'cancelled';
    case 'paid':
      return 'paid';
    case 'hold':
    case 'pending':
      return 'pending';
    default:
      return 'upcoming';
  }
}

function mapUnitStatus(status: string): UnitStatus['status'] | undefined {
  switch (status) {
    case 'occupied':
    case 'maintenance':
    case 'out_of_service':
      return 'occupied';
    case 'available':
    case 'vacant':
      return 'vacant';
    case 'departure_today':
      return 'departure-today';
    case 'arrival_today':
      return 'arrival-today';
    default:
      return 'vacant';
  }
}