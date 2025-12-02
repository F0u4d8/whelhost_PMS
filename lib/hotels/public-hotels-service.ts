import { createServiceRoleClient } from "@/lib/supabase/service-client";

// Re-export functions from the main service client file
export {
  createServiceRoleClient,
  getPublicHotels
} from "@/lib/supabase/service-client";

/**
 * Fetches public room types for a specific hotel
 */
export async function getPublicRoomTypes(hotelId: string) {
  try {
    const supabase = createServiceRoleClient();

    const { data: roomTypes, error } = await supabase
      .from("room_types")
      .select("id, name, base_price, max_occupancy, hotel_id")
      .eq("hotel_id", hotelId);

    if (error) {
      console.error("Error fetching public room types:", error);
      return { roomTypes: [], error: error.message || "Unknown error" };
    }

    return { roomTypes: roomTypes || [], error: null };
  } catch (error: any) {
    console.error("Unexpected error in getPublicRoomTypes:", error);
    return { roomTypes: [], error: error.message || "Unknown error" };
  }
}

/**
 * Fetches public units for a specific hotel
 */
export async function getPublicUnits(hotelId: string) {
  try {
    const supabase = createServiceRoleClient();

    const { data: units, error } = await supabase
      .from("units")
      .select("id, name, status, room_type_id, hotel_id")
      .eq("hotel_id", hotelId)
      .not("status", "eq", "maintenance");

    if (error) {
      console.error("Error fetching public units:", error);
      return { units: [], error: error.message || "Unknown error" };
    }

    return { units: units || [], error: null };
  } catch (error: any) {
    console.error("Unexpected error in getPublicUnits:", error);
    return { units: [], error: error.message || "Unknown error" };
  }
}

/**
 * Fetches all public units (all hotels)
 */
export async function getAllPublicUnits() {
  try {
    const supabase = createServiceRoleClient();

    const { data: units, error } = await supabase
      .from("units")
      .select("id, name, status, room_type_id, hotel_id")
      .not("status", "eq", "maintenance");

    if (error) {
      console.error("Error fetching all public units:", error);
      return { units: [], error: error.message || "Unknown error" };
    }

    return { units: units || [], error: null };
  } catch (error: any) {
    console.error("Unexpected error in getAllPublicUnits:", error);
    return { units: [], error: error.message || "Unknown error" };
  }
}

/**
 * Fetches all public room types (all hotels)
 */
export async function getAllPublicRoomTypes() {
  try {
    const supabase = createServiceRoleClient();

    const { data: roomTypes, error } = await supabase
      .from("room_types")
      .select("id, name, base_price, max_occupancy, hotel_id");

    if (error) {
      console.error("Error fetching all public room types:", error);
      return { roomTypes: [], error: error.message || "Unknown error" };
    }

    return { roomTypes: roomTypes || [], error: null };
  } catch (error: any) {
    console.error("Unexpected error in getAllPublicRoomTypes:", error);
    return { roomTypes: [], error: error.message || "Unknown error" };
  }
}