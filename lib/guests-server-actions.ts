"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Guest {
  id: string;
  name: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  reservations: number;
  createdAt: string;
}

export async function getGuests(): Promise<Guest[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Get guests for the user's hotels - try full schema first, then basic
  const { data: guestsData, error: guestsError } = await supabase
    .from("guests")
    .select(`
      id,
      first_name,
      last_name,
      nationality,
      id_type as idType,
      id_number as idNumber,
      phone,
      email,
      created_at as createdAt
    `)
    .in("hotel_id", hotelIds);

  let guests: Guest[] = [];
  if (guestsError) {
    console.warn("Error fetching guests with full schema:", guestsError.message);
    
    // Fallback: try basic schema
    const { data: basicGuestsData, error: basicGuestsError } = await supabase
      .from("guests")
      .select("id, first_name, last_name, nationality, phone, email, created_at")
      .in("hotel_id", hotelIds);

    if (basicGuestsError) {
      console.error("Error fetching basic guests:", basicGuestsError);
      // If everything fails, return an empty array as a last resort
      console.warn("Returning empty guests array due to database errors");
      return [];
    } else {
      guests = basicGuestsData.map(item => ({
        id: item.id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || "Unnamed Guest",
        nationality: item.nationality || "Unknown",
        idType: "ID",
        idNumber: "",
        phone: item.phone || "",
        email: item.email || "",
        reservations: 0, // Will need to count from bookings table
        createdAt: item.created_at || new Date().toISOString(),
      }));
    }
  } else {
    guests = guestsData.map(item => ({
      id: item.id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || "Unnamed Guest",
      nationality: item.nationality || "Unknown",
      idType: item.idType || "ID",
      idNumber: item.idNumber || "",
      phone: item.phone || "",
      email: item.email || "",
      reservations: 0, // Will need to count from bookings table
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  }

  // Now we'll add reservation counts for each guest
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    const { count, error } = await supabase
      .from("bookings")
      .select('*', { count: 'exact', head: true })
      .eq("guest_id", guest.id);

    if (!error) {
      guests[i].reservations = count || 0;
    }
  }

  return guests;
}

export async function addGuest(guestData: Omit<Guest, 'id' | 'reservations' | 'createdAt'>): Promise<Guest> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to link the guest
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // Split the name into first and last name
  const nameParts = guestData.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // Insert the guest into the database
  const { data, error } = await supabase
    .from("guests")
    .insert([{
      hotel_id: userHotels[0].id,
      first_name: firstName,
      last_name: lastName,
      nationality: guestData.nationality,
      id_type: guestData.idType,
      id_number: guestData.idNumber,
      phone: guestData.phone,
      email: guestData.email,
    }])
    .select("id, first_name, last_name, nationality, id_type, id_number, phone, email, created_at")
    .single();

  if (error) {
    console.error("Error adding guest:", error);
    throw new Error("Failed to add guest: " + error.message);
  }

  // Return the created guest
  return {
    id: data.id,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Unnamed Guest",
    nationality: data.nationality || "Unknown",
    idType: data.id_type || "ID",
    idNumber: data.id_number || "",
    phone: data.phone || "",
    email: data.email || "",
    reservations: 0, // New guest has no reservations yet
    createdAt: data.created_at || new Date().toISOString(),
  };
}

export async function updateGuest(id: string, guestData: Omit<Guest, 'id' | 'reservations' | 'createdAt'>): Promise<Guest> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Split the name into first and last name
  const nameParts = guestData.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // Update the guest in the database
  const { data, error } = await supabase
    .from("guests")
    .update({
      first_name: firstName,
      last_name: lastName,
      nationality: guestData.nationality,
      id_type: guestData.idType,
      id_number: guestData.idNumber,
      phone: guestData.phone,
      email: guestData.email,
    })
    .eq("id", id)
    .eq("hotel_id", userHotels[0].id) // Ensure the guest belongs to a hotel the user owns
    .select("id, first_name, last_name, nationality, id_type, id_number, phone, email, created_at")
    .single();

  if (error) {
    console.error("Error updating guest:", error);
    throw new Error("Failed to update guest: " + error.message);
  }

  // Return the updated guest
  return {
    id: data.id,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Unnamed Guest",
    nationality: data.nationality || "Unknown",
    idType: data.id_type || "ID",
    idNumber: data.id_number || "",
    phone: data.phone || "",
    email: data.email || "",
    reservations: 0, // Reservation count will be updated separately
    createdAt: data.created_at || new Date().toISOString(),
  };
}

export async function deleteGuest(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Delete the guest
  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id)
    .in("hotel_id", hotelIds);

  if (error) {
    console.error("Error deleting guest:", error);
    throw new Error("Failed to delete guest: " + error.message);
  }
}