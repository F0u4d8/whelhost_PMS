"use server";

import { createClient } from "@/lib/supabase/server";
import { Unit } from "@/lib/store";
import { cookies } from "next/headers";

// Interface for public units that will be displayed on the website
export interface PublicUnit {
  id: string;
  name: string;
  number: string;
  type: string;
  pricePerNight: number;
  status: "occupied" | "vacant" | "out-of-service" | "departure-today" | "arrival-today";
  floor: string;
  imageUrls: string[];
  description?: string;
  amenities?: string[];
  facilities?: string[];
  rules?: string[];
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  rating: number;
}

// Function to get all publicly available units for display on the website
export async function getPublicUnits(): Promise<PublicUnit[]> {
  const supabase = await createClient();

  // Get all units along with their hotel information
  const { data: unitsData, error: unitsError } = await supabase
    .from("units")
    .select(`
      id,
      name,
      status,
      base_price as pricePerNight,
      floor,
      image_urls,
      type,
      hotel_id,
      hotels (
        id,
        name,
        city,
        country,
        description,
        rating
      )
    `)
    .neq("status", "maintenance") // Exclude units in maintenance
    .order("created_at", { ascending: false });

  if (unitsError) {
    console.error("Error fetching public units:", unitsError);
    return []; // Return empty array if there's an error
  }

  if (!unitsData || unitsData.length === 0) {
    console.warn("No public units found");
    return [];
  }

  // Transform the data to match PublicUnit interface
  return unitsData.map((item: any) => {
    // Parse the stored name to extract number and name
    const storedName = item.name || "";
    const [numberPart, ...nameParts] = storedName.split(" - ");

    return {
      id: item.id,
      name: nameParts.join(" - ") || "Unit",
      number: numberPart || "N/A",
      type: item.type || "room", // Use the type from the database
      pricePerNight: item.pricePerNight || 0,
      status: mapDbStatus(item.status),
      floor: item.floor?.toString() || "1",
      imageUrls: item.image_urls || [],
      hotelId: item.hotel_id,
      hotelName: item.hotels.name || "Unknown Hotel",
      hotelLocation: `${item.hotels.city || ""}, ${item.hotels.country || ""}`.trim(),
      rating: item.hotels.rating || 0, // Use the rating from the hotel
    };
  });
}

// Function to get units for a specific hotel
export async function getHotelUnits(hotelId: string): Promise<PublicUnit[]> {
  const supabase = await createClient();

  // Get units for a specific hotel along with hotel information
  const { data: unitsData, error: unitsError } = await supabase
    .from("units")
    .select(`
      id,
      name,
      status,
      base_price as pricePerNight,
      floor,
      image_urls,
      type,
      hotel_id,
      hotels (
        id,
        name,
        city,
        country,
        description,
        rating
      )
    `)
    .eq("hotel_id", hotelId)
    .neq("status", "maintenance") // Exclude units in maintenance
    .order("created_at", { ascending: false });

  if (unitsError) {
    console.error("Error fetching hotel units:", unitsError);
    return []; // Return empty array if there's an error
  }

  if (!unitsData || unitsData.length === 0) {
    console.warn("No units found for hotel:", hotelId);
    return [];
  }

  // Transform the data to match PublicUnit interface
  return unitsData.map((item: any) => {
    // Parse the stored name to extract number and name
    const storedName = item.name || "";
    const [numberPart, ...nameParts] = storedName.split(" - ");

    return {
      id: item.id,
      name: nameParts.join(" - ") || "Unit",
      number: numberPart || "N/A",
      type: item.type || "room", // Use the type from the database
      pricePerNight: item.pricePerNight || 0,
      status: mapDbStatus(item.status),
      floor: item.floor?.toString() || "1",
      imageUrls: item.image_urls || [],
      hotelId: item.hotel_id,
      hotelName: item.hotels.name || "Unknown Hotel",
      hotelLocation: `${item.hotels.city || ""}, ${item.hotels.country || ""}`.trim(),
      rating: item.hotels.rating || 0, // Use the rating from the hotel
    };
  });
}

// Function to get a specific unit by ID
export async function getPublicUnitById(unitId: string): Promise<PublicUnit | null> {
  const supabase = await createClient();

  // Get a specific unit along with its hotel information
  const { data: unitData, error: unitError } = await supabase
    .from("units")
    .select(`
      id,
      name,
      status,
      base_price as pricePerNight,
      floor,
      image_urls,
      type,
      hotel_id,
      hotels (
        id,
        name,
        city,
        country,
        description,
        rating
      )
    `)
    .eq("id", unitId)
    .single();

  if (unitError) {
    console.error("Error fetching public unit:", unitError);
    return null; // Return null if there's an error or no unit found
  }

  if (!unitData) {
    console.warn("No unit found with ID:", unitId);
    return null;
  }

  // Parse the stored name to extract number and name
  const storedName = unitData.name || "";
  const [numberPart, ...nameParts] = storedName.split(" - ");

  return {
    id: unitData.id,
    name: nameParts.join(" - ") || "Unit",
    number: numberPart || "N/A",
    type: unitData.type || "room", // Use the type from the database
    pricePerNight: unitData.pricePerNight || 0,
    status: mapDbStatus(unitData.status),
    floor: unitData.floor?.toString() || "1",
    imageUrls: unitData.image_urls || [],
    hotelId: unitData.hotel_id,
    hotelName: unitData.hotels.name || "Unknown Hotel",
    hotelLocation: `${unitData.hotels.city || ""}, ${unitData.hotels.country || ""}`.trim(),
    rating: unitData.hotels.rating || 0, // Use the rating from the hotel
  };
}

// Helper function to map database status to our application status
function mapDbStatus(dbStatus: string): PublicUnit['status'] {
  switch (dbStatus.toLowerCase()) {
    case 'occupied': return 'occupied';
    case 'maintenance': return 'out-of-service';
    case 'available': return 'vacant';
    case 'booked': return 'occupied'; // If booked is used instead of occupied
    case 'reserved': return 'occupied'; // If reserved is used
    case 'checkout': return 'departure-today'; // If checkout day
    case 'checkin': return 'arrival-today'; // If checkin day
    default: return 'vacant';
  }
}

// Function to add a unit to a hotel (this would typically be called from the PMS)
export async function addPublicUnit(unitData: {
  hotelId: string;
  name: string;
  number?: string;
  type?: string;
  pricePerNight: number;
  status?: string;
  floor?: string;
  imageUrls?: string[];
}): Promise<PublicUnit | null> {
  const supabase = await createClient();

  // Prepare the name field combining number and name
  const nameField = unitData.number ? `${unitData.number} - ${unitData.name}` : unitData.name;

  // Insert the new unit
  const { data, error } = await supabase
    .from("units")
    .insert([{
      hotel_id: unitData.hotelId,
      name: nameField,
      base_price: unitData.pricePerNight,
      status: unitData.status || 'available',
      floor: parseInt(unitData.floor || '1'),
      image_urls: unitData.imageUrls || [],
    }])
    .select(`
      id,
      name,
      status,
      base_price as pricePerNight,
      floor,
      image_urls,
      type,
      hotel_id,
      hotels (
        id,
        name,
        city,
        country,
        description,
        rating
      )
    `)
    .single();

  if (error) {
    console.error("Error adding public unit:", error);
    return null;
  }

  if (!data) {
    console.warn("No data returned after adding unit");
    return null;
  }

  // Parse the stored name to extract number and name
  const storedName = data.name || "";
  const [numberPart, ...nameParts] = storedName.split(" - ");

  return {
    id: data.id,
    name: nameParts.join(" - ") || "Unit",
    number: numberPart || "N/A",
    type: data.type || unitData.type || "room",
    pricePerNight: data.pricePerNight || 0,
    status: mapDbStatus(data.status),
    floor: data.floor?.toString() || "1",
    imageUrls: data.image_urls || [],
    hotelId: data.hotel_id,
    hotelName: data.hotels.name || "Unknown Hotel",
    hotelLocation: `${data.hotels.city || ""}, ${data.hotels.country || ""}`.trim(),
    rating: data.hotels.rating || 0, // Use the rating from the hotel
  };
}