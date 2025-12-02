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

    const { data: hotels, error } = await supabase
      .from("hotels")
      .select("id, name, description, location, owner_id")
      .order("name");

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