import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/v1/guest/bill?token=xxx
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Access token is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Verify the token and get the associated booking
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("guest_access_tokens")
      .select(`
        *,
        booking:bookings!inner(
          *,
          unit:units(id, name, floor, room_type:room_types(name, base_price)),
          guest:guests(*),
          hotel:hotels(id, name, currency, check_in_time, check_out_time)
        )
      `)
      .eq("token", token)
      .eq("booking.status", "checked_out") // Only allow access to completed bookings
      .filter("expires_at", "gt", new Date().toISOString())
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired access token" }, { status: 404 });
    }

    const booking = tokenRecord.booking;

    // Get payments associated with this booking
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return NextResponse.json({ error: "Error fetching payment details" }, { status: 500 });
    }

    return NextResponse.json({
      booking,
      payments: payments || []
    });
  } catch (error) {
    console.error("Error in guest bill API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}