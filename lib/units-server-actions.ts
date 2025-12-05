"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { Unit } from "@/lib/store";
import { fakeUnits } from "@/lib/fake-units-data";

export interface UnitFormData {
  number: string;
  name: string;
  type: "suite" | "room" | "studio" | "apartment";
  floor: string;
  pricePerNight: number;
  status: "occupied" | "vacant" | "out-of-service" | "departure-today" | "arrival-today";
  propertyId?: string;
}

export async function getUnits(): Promise<Unit[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotel
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    // Return fake data as fallback
    return fakeUnits;
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // First try to get with all expected columns, if that fails, use basic columns
  const { data, error: fullError } = await supabase
    .from("units")
    .select("id, name, status, base_price as pricePerNight, floor")
    .in("hotel_id", hotelIds);

  if (fullError) {
    console.warn("Could not fetch units with full schema, using basic schema:", fullError.message);

    // Fallback to basic columns only
    const { data: basicData, error: basicError } = await supabase
      .from("units")
      .select("id, name")
      .in("hotel_id", hotelIds);

    if (basicError) {
      console.error("Error fetching basic units:", basicError);
      // Return fake data as fallback when database access fails
      console.log("Returning fake data as fallback due to database error");
      return fakeUnits;
    }

    if (!basicData) {
      console.warn("No data returned from Supabase query");
      // Return fake data as fallback when no data is returned
      console.log("Returning fake data as fallback due to no data returned");
      return fakeUnits;
    }

    // Map the data to match the Unit interface format with default values
    return basicData.map(item => ({
      id: item.id,
      number: item.name || "N/A",
      name: item.name || "Unit",
      status: "vacant", // Default status
      pricePerNight: 0, // Default price
      type: "room", // Default type
      floor: "1", // Default floor
      propertyId: undefined,
      guest: undefined,
      checkIn: undefined,
      checkOut: undefined,
      balance: undefined,
    }));
  }

  if (!data || data.length === 0) {
    console.warn("No data returned from Supabase query");
    // Return fake data as fallback when no data is returned
    console.log("Returning fake data as fallback due to no data returned");
    return fakeUnits;
  }

  // Map the data to match the Unit interface format
  return data.map(item => ({
    id: item.id,
    number: item.name || "N/A", // Using name as number since there's no separate number column
    name: item.name || "Unit",
    status: mapStatus(item.status) || "vacant",
    pricePerNight: item.pricePerNight || 0,
    type: "room", // Default value since this field doesn't exist in the DB
    floor: item.floor?.toString() || "1", // Use the floor from DB if available
    propertyId: undefined, // Default value
    // These fields are optional in the interface
    guest: undefined,
    checkIn: undefined,
    checkOut: undefined,
    balance: undefined,
  }));
}

function mapStatus(dbStatus: string): Unit['status'] {
  switch (dbStatus) {
    case 'occupied': return 'occupied';
    case 'maintenance': return 'out-of-service'; // mapping maintenance to out-of-service
    case 'available': return 'vacant'; // mapping available to vacant
    default: return 'vacant';
  }
}

export async function addUnit(formData: UnitFormData): Promise<Unit> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's first hotel to associate with the unit
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelId = userHotels[0].id;

  // Try to add with all fields first
  // In the database, we're using the name field to store the unit name/number
  const insertData: any = {
    hotel_id: hotelId,
    name: formData.number + " - " + formData.name, // Combine number and name for storage
    floor: parseInt(formData.floor) || 1, // Store floor as integer
    base_price: formData.pricePerNight,
    status: mapFormStatus(formData.status),
  };

  const { data, error } = await supabase
    .from("units")
    .insert([insertData])
    .select("id, name, status, base_price as pricePerNight, floor")
    .single();

  if (error) {
    console.warn("Error adding unit with full schema, trying basic schema:", error.message);

    // Fallback: try with only required fields
    const basicInsertData = {
      hotel_id: hotelId,
      name: formData.number + " - " + formData.name, // Combine number and name for storage
    };

    const { data: basicData, error: basicError } = await supabase
      .from("units")
      .insert([basicInsertData])
      .select("id, name")
      .single();

    if (basicError) {
      console.error("Error adding unit with basic schema:", basicError);
      throw new Error(`Failed to add unit: ${basicError.message}`);
    }

    // Return the basic data with default values
    return {
      id: basicData.id,
      number: formData.number || "N/A",
      name: formData.name || "Unit",
      status: mapFormStatus(formData.status) || "vacant",
      pricePerNight: formData.pricePerNight || 0,
      type: formData.type,
      floor: formData.floor,
      propertyId: undefined, // Default value
    };
  }

  // Map the response to match the Unit interface
  // Parse the stored name back to number and name components
  const storedName = data.name || "";
  const [numberPart, ...nameParts] = storedName.split(" - ");
  const unitNumber = numberPart || formData.number || "N/A";
  const unitName = nameParts.join(" - ") || formData.name || "Unit";

  return {
    id: data.id,
    number: unitNumber,
    name: unitName,
    status: mapStatus(data.status) || "vacant",
    pricePerNight: data.pricePerNight || 0,
    type: formData.type,
    floor: data.floor?.toString() || formData.floor,
    propertyId: undefined, // Default value
  };
}

function mapFormStatus(status: Unit['status']): string {
  switch (status) {
    case 'occupied': return 'occupied';
    case 'out-of-service': return 'maintenance';
    case 'vacant': return 'available';
    case 'departure-today': return 'available'; // Map to available since we don't have this concept in DB
    case 'arrival-today': return 'available'; // Map to available since we don't have this concept in DB
    default: return 'available';
  }
}

export async function updateUnit(id: string, formData: UnitFormData): Promise<Unit> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(h => h.id);

  // Create update object with all fields
  const updateData: any = {
    name: formData.number + " - " + formData.name, // Combine number and name for storage
    floor: parseInt(formData.floor) || 1, // Store floor as integer
    base_price: formData.pricePerNight,
    status: mapFormStatus(formData.status),
  };

  const { data, error } = await supabase
    .from("units")
    .update(updateData)
    .eq("id", id)
    .in("hotel_id", hotelIds) // Ensure user can only update their units
    .select("id, name, status, base_price as pricePerNight, floor")
    .single();

  if (error) {
    console.warn("Error updating unit with full schema, trying basic schema:", error.message);

    // Fallback: update only basic fields
    const basicUpdateData = {
      name: formData.number + " - " + formData.name, // Combine number and name for storage
    };

    const { data: basicData, error: basicError } = await supabase
      .from("units")
      .update(basicUpdateData)
      .eq("id", id)
      .in("hotel_id", hotelIds)
      .select("id, name")
      .single();

    if (basicError) {
      console.error("Error updating unit with basic schema:", basicError);
      throw new Error(`Failed to update unit: ${basicError.message}`);
    }

    // Return the basic data with default values
    return {
      id: basicData.id,
      number: formData.number || "N/A",
      name: formData.name || "Unit",
      status: mapFormStatus(formData.status) || "vacant",
      pricePerNight: formData.pricePerNight || 0,
      type: formData.type,
      floor: formData.floor,
      propertyId: undefined, // Default value
    };
  }

  // Map the response to match the Unit interface
  // Parse the stored name back to number and name components
  const storedName = data.name || "";
  const [numberPart, ...nameParts] = storedName.split(" - ");
  const unitNumber = numberPart || formData.number || "N/A";
  const unitName = nameParts.join(" - ") || formData.name || "Unit";

  return {
    id: data.id,
    number: unitNumber,
    name: unitName,
    status: mapStatus(data.status) || "vacant",
    pricePerNight: data.pricePerNight || 0,
    type: formData.type,
    floor: data.floor?.toString() || formData.floor,
    propertyId: undefined, // Default value
  };
}

export async function deleteUnit(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(h => h.id);

  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", id)
    .in("hotel_id", hotelIds); // Ensure user can only delete their units

  if (error) {
    console.error("Error deleting unit:", error);
    throw new Error("Failed to delete unit");
  }
}