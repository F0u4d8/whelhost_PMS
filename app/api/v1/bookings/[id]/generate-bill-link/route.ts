import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// POST /api/v1/bookings/[id]/generate-bill-link
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get booking with hotel info
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      hotel:hotels!inner(id, owner_id),
      guest:guests(first_name, last_name, email)
    `)
    .eq("id", id)
    .single();

  if (!booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Generate a unique access token for the guest to access their bill
  const guestAccessToken = nanoid(16); // Generate a short unique token

  // Save the token associated with the booking (or update existing)
  const { data: existingToken, error: fetchError } = await supabase
    .from("guest_access_tokens")
    .select("*")
    .eq("booking_id", id)
    .single();

  let result;
  if (existingToken) {
    // Update existing token
    const { data, error } = await supabase
      .from("guest_access_tokens")
      .update({
        token: guestAccessToken,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", id)
      .select()
      .single();
      
    result = data;
  } else {
    // Create new token
    const { data, error } = await supabase
      .from("guest_access_tokens")
      .insert({
        booking_id: id,
        token: guestAccessToken,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
        created_by: user.id,
      })
      .select()
      .single();
      
    result = data;
  }

  if (!result) {
    return NextResponse.json({ error: "Error generating access token" }, { status: 500 });
  }

  // Generate the bill access URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const billAccessUrl = `${baseUrl}/guest/bill?token=${guestAccessToken}`;
  
  // Optionally send email to guest with the bill link
  // For now, we'll just return the link
  return NextResponse.json({
    bill_access_url: billAccessUrl,
    message: "Bill access link generated successfully",
  });
}