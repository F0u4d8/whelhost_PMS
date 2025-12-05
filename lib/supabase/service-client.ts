import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with service role access to bypass RLS
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration. Check your environment variables.");
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
      }
    }
  );
}

/**
 * Fetches all public hotels from the database, bypassing RLS policies
 */
export async function getPublicHotels() {
  try {
    const supabase = createServiceRoleClient();

    // Try to fetch hotels with the location column first
    let { data: hotels, error } = await supabase
      .from("hotels")
      .select("id, name, description, location, owner_id")
      .order("name");

    // If there's a column error (location doesn't exist), try without the location column
    if (error && (error.code === '42703' || error.message.includes('column hotels.location does not exist'))) {
      const { data: hotelsWithoutLocation, error: newError } = await supabase
        .from("hotels")
        .select("id, name, description, owner_id")
        .order("name");

      if (newError) {
        console.error("Error fetching public hotels without location:", newError);
        return { hotels: [], error: newError.message || newError || "Unknown error" };
      }

      // Add location as undefined to maintain structure
      hotels = hotelsWithoutLocation?.map(hotel => ({ ...hotel, location: undefined }));
      error = null;
    }

    if (error) {
      console.error("Error fetching public hotels:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { hotels: [], error: error.message || error || "Unknown error" };
    }

    return { hotels: hotels || [], error: null };
  } catch (error: any) {
    console.error("Unexpected error in getPublicHotels:", error);
    console.error("Error details:", error?.message || error);
    return { hotels: [], error: error?.message || error || "Unknown error" };
  }
}