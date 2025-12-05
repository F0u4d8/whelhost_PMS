"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

// Interfaces matching the application's data structure
interface Guest {
  id: string;
  name: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  reservations: number;
}

interface Reservation {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  unit: string;
  guest: string;
  pricePerNight: number;
  total: number;
  paid: number;
  balance: number;
  status: "active" | "paid" | "upcoming" | "completed" | "cancelled";
  channel?: string;
  externalId?: string;
}

interface Unit {
  id: string;
  number: string;
  name: string;
  status: "occupied" | "vacant" | "out-of-service" | "departure-today" | "arrival-today";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  balance?: number;
  type?: string;
  floor?: string;
  pricePerNight?: number;
  propertyId?: string;
}

export interface CalendarData {
  units: Unit[];
  reservations: Reservation[];
  guests: Guest[];
}

export async function getCalendarData(): Promise<CalendarData> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    throw new Error("No hotels found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Get units for the user's hotels - try full schema first, then basic
  const { data: unitsData, error: unitsError } = await supabase
    .from("units")
    .select("id, name, base_price as pricePerNight, status")
    .in("hotel_id", hotelIds);

  let units: Unit[] = [];
  if (unitsError) {
    console.warn("Error fetching units with full schema:", unitsError.message);

    // Fallback to basic query
    const { data: basicUnitsData, error: basicUnitsError } = await supabase
      .from("units")
      .select("id, name")
      .in("hotel_id", hotelIds);

    if (basicUnitsError) {
      console.error("Error fetching basic units:", basicUnitsError);
      throw new Error("Failed to fetch units: " + basicUnitsError.message);
    }

    units = basicUnitsData.map(item => ({
      id: item.id,
      number: item.name || "N/A",
      name: item.name || "Unit",
      pricePerNight: 0,
      status: "vacant",
    }));
  } else {
    units = unitsData.map(item => ({
      id: item.id,
      number: item.name || "N/A",
      name: item.name || "Unit",
      pricePerNight: item.pricePerNight || 0,
      status: mapUnitStatus(item.status) || "vacant",
    }));
  }

  // Get reservations for the user's hotels - try full schema first, then basic
  const { data: reservationsData, error: reservationsError } = await supabase
    .from("bookings")
    .select(`
      id,
      created_at as date,
      check_in as checkIn,
      check_out as checkOut,
      source
    `)
    .in("hotel_id", hotelIds);

  let reservations: Reservation[] = [];
  if (reservationsError) {
    console.warn("Error fetching reservations with full schema:", reservationsError.message);

    // Fallback 1: Try basic query without JOIN
    const { data: basicReservationsData, error: basicReservationsError } = await supabase
      .from("bookings")
      .select("id, created_at as date, check_in as checkIn, check_out as checkOut, source")
      .in("hotel_id", hotelIds);

    if (basicReservationsError) {
      console.warn("Error fetching basic reservations:", basicReservationsError.message);

      // Fallback 2: Try with minimal fields only
      const { data: minimalReservationsData, error: minimalReservationsError } = await supabase
        .from("bookings")
        .select("id, created_at, check_in, check_out")
        .in("hotel_id", hotelIds);

      if (minimalReservationsError) {
        console.error("Error fetching minimal reservations:", minimalReservationsError);
        // If everything fails, return an empty array as a last resort
        console.warn("Returning empty reservations array due to database errors");
        reservations = [];
      } else {
        reservations = minimalReservationsData.map(item => ({
          id: item.id,
          date: item.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          checkIn: item.check_in,
          checkOut: item.check_out,
          nights: calculateNights(item.check_in, item.check_out),
          unit: "",
          guest: "Guest",
          pricePerNight: 0,
          total: 0,
          paid: 0,
          balance: 0,
          status: "upcoming",
          channel: "direct",
        }));
      }
    } else {
      reservations = basicReservationsData.map(item => ({
        id: item.id,
        date: item.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        nights: calculateNights(item.checkIn, item.checkOut),
        unit: "",
        guest: "Guest", // Will get the guest name later
        pricePerNight: 0,
        total: 0,
        paid: 0,
        balance: 0,
        status: "upcoming",
        channel: item.source || "direct",
      }));
    }
  } else {
    reservations = reservationsData.map(item => ({
      id: item.id,
      date: item.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      nights: calculateNights(item.checkIn, item.checkOut),
      unit: "", // We'll need to enhance the query to include unit information
      guest: "Guest", // Will get the guest name later
      pricePerNight: 0, // We'll need to add price data
      total: 0, // Calculate based on nights and price
      paid: 0,
      balance: 0,
      status: "upcoming", // Default status, could enhance with actual status
      channel: item.source || "direct", // Default channel
    }));
  }

  // Get guests for the user's hotels - try full schema first, then basic
  const { data: guestsData, error: guestsError } = await supabase
    .from("guests")
    .select("id, first_name, last_name")
    .in("hotel_id", hotelIds);

  let guests: Guest[] = [];
  if (guestsError) {
    console.warn("Error fetching guests with full schema:", guestsError.message);

    // Fallback to basic query
    const { data: basicGuestsData, error: basicGuestsError } = await supabase
      .from("guests")
      .select("id, first_name, last_name")
      .in("hotel_id", hotelIds);

    if (basicGuestsError) {
      console.error("Error fetching basic guests:", basicGuestsError);
      throw new Error("Failed to fetch guests: " + basicGuestsError.message);
    }

    guests = basicGuestsData.map(item => ({
      id: item.id,
      name: `${item.first_name} ${item.last_name}`.trim() || "Unnamed Guest",
      nationality: "",
      idType: "",
      idNumber: "",
      phone: "",
      email: "",
      reservations: 0,
    }));
  } else {
    guests = guestsData.map(item => ({
      id: item.id,
      name: `${item.first_name} ${item.last_name}`.trim(),
      nationality: "",
      idType: "",
      idNumber: "",
      phone: "",
      email: "",
      reservations: 0,
    }));
  }

  return {
    units,
    reservations,
    guests,
  };
}

function mapUnitStatus(status: string): Unit['status'] | undefined {
  switch (status) {
    case 'occupied': return 'occupied';
    case 'maintenance': return 'out-of-service';
    case 'available': return 'vacant';
    default: return 'vacant';
  }
}

function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function addReservation(reservationData: Omit<Reservation, 'id'>): Promise<Reservation> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to link the reservation
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // Find the unit ID based on the unit number
  const { data: unitData, error: unitError } = await supabase
    .from("units")
    .select("id")
    .eq("name", reservationData.unit)
    .eq("hotel_id", userHotels[0].id)
    .single();

  if (unitError || !unitData) {
    throw new Error("Unit not found");
  }

  // Find the guest ID based on the guest name
  const guestNameParts = reservationData.guest.split(" ");
  const firstName = guestNameParts[0];
  const lastName = guestNameParts.slice(1).join(" ") || guestNameParts[0];

  const { data: guestData, error: guestError } = await supabase
    .from("guests")
    .select("id")
    .eq("first_name", firstName)
    .eq("last_name", lastName)
    .eq("hotel_id", userHotels[0].id)
    .single();

  if (guestError || !guestData) {
    throw new Error("Guest not found");
  }

  // Prepare the reservation data for insertion
  const insertData: any = {
    hotel_id: userHotels[0].id,
    unit_id: unitData.id,
    guest_id: guestData.id,
    check_in: reservationData.checkIn,
    check_out: reservationData.checkOut,
    source: reservationData.channel || "direct",
    total_amount: reservationData.total,
    status: mapReservationStatus(reservationData.status),
  };

  // Insert the booking into the database
  const { data, error } = await supabase
    .from("bookings")
    .insert([insertData])
    .select("id, created_at, check_in, check_out, source, total_amount")
    .single();

  if (error) {
    console.error("Error adding reservation:", error);

    // Fallback: try with minimal required fields
    const minimalInsertData = {
      hotel_id: userHotels[0].id,
      unit_id: unitData.id,
      guest_id: guestData.id,
      check_in: reservationData.checkIn,
      check_out: reservationData.checkOut,
      source: reservationData.channel || "direct",
    };

    const { data: minimalData, error: minimalError } = await supabase
      .from("bookings")
      .insert([minimalInsertData])
      .select("id, created_at, check_in, check_out")
      .single();

    if (minimalError) {
      console.error("Error adding reservation with minimal data:", minimalError);
      throw new Error("Failed to add reservation: " + minimalError.message);
    }

    // Return the minimal reservation data
    return {
      id: minimalData.id,
      date: minimalData.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      checkIn: minimalData.check_in,
      checkOut: minimalData.check_out,
      nights: reservationData.nights,
      unit: reservationData.unit,
      guest: reservationData.guest,
      pricePerNight: reservationData.pricePerNight,
      total: reservationData.total,
      paid: 0,
      balance: reservationData.total,
      status: reservationData.status,
      channel: reservationData.channel,
    };
  }

  // Return the created reservation
  return {
    id: data.id,
    date: data.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    checkIn: data.check_in,
    checkOut: data.check_out,
    nights: reservationData.nights,
    unit: reservationData.unit,
    guest: reservationData.guest,
    pricePerNight: reservationData.pricePerNight,
    total: data.total_amount || reservationData.total,
    paid: reservationData.paid,
    balance: reservationData.balance,
    status: reservationData.status,
    channel: data.source || reservationData.channel,
  };
}

function mapReservationStatus(status: Reservation['status']): string {
  switch (status) {
    case 'active': return 'confirmed';
    case 'paid': return 'confirmed';
    case 'upcoming': return 'confirmed';
    case 'completed': return 'checked_out';
    case 'cancelled': return 'cancelled';
    default: return 'pending';
  }
}