import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/bookings/[id] - Simplified booking detail API for the booking detail page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // First, try to fetch booking with all related information
  let { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      unit:units!inner(id, name, floor),
      guest:guests!inner(id, first_name, last_name, email, phone),
      hotel:hotels!inner(id, name, owner_id, currency)
    `)
    .eq("id", id)
    .eq("hotel_id", user.id) // Ensure user can only access their own bookings
    .single();

  if (error || !booking) {
    // If the detailed fetch failed, try a basic fetch with minimal fields
    const { data: basicBooking, error: basicError } = await supabase
      .from("bookings")
      .select("id, created_at, check_in, check_out, adults, children, total_amount, paid_amount, status, source, special_requests, notes, hotel_id, unit_id, guest_id")
      .eq("id", id)
      .eq("hotel_id", user.id)
      .single();

    if (basicError || !basicBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Try to fetch related unit and guest data separately
    const [
      unitResponse,
      guestResponse,
      hotelResponse
    ] = await Promise.all([
      supabase.from("units").select("id, name, floor").eq("id", basicBooking.unit_id).single(),
      supabase.from("guests").select("id, first_name, last_name, email, phone").eq("id", basicBooking.guest_id).single(),
      supabase.from("hotels").select("id, name, currency").eq("id", basicBooking.hotel_id).single()
    ]);

    const unit = unitResponse.data || { id: basicBooking.unit_id, name: "Unit", floor: null };
    const guest = guestResponse.data || { id: basicBooking.guest_id, first_name: "Guest", last_name: "", email: "", phone: "" };
    const hotel = hotelResponse.data || { id: basicBooking.hotel_id, name: "Hotel", currency: "SAR" };

    // Fetch any related payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", basicBooking.id);

    // Format the response to include all necessary data
    const formattedBooking = {
      id: basicBooking.id,
      created_at: basicBooking.created_at,
      check_in: basicBooking.check_in,
      check_out: basicBooking.check_out,
      adults: basicBooking.adults || 1,
      children: basicBooking.children || 0,
      total_amount: basicBooking.total_amount || 0,
      paid_amount: basicBooking.paid_amount || 0,
      status: basicBooking.status,
      source: basicBooking.source,
      special_requests: basicBooking.special_requests,
      notes: basicBooking.notes,
      unit: {
        id: unit.id,
        name: unit.name,
        floor: unit.floor,
        room_type: {
          name: "Default Room",
          base_price: 0
        },
      },
      guest: {
        id: guest.id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
      },
      hotel: {
        id: hotel.id,
        name: hotel.name,
        currency: hotel.currency || "SAR",
      },
      payments: payments || [],
    };

    return NextResponse.json({ data: formattedBooking });
  }

  // If the detailed fetch succeeded, also fetch the room type and payments
  const { data: roomType } = await supabase
    .from("room_types")
    .select("name, base_price")
    .eq("id", booking.unit?.room_type_id)
    .single();

  // Fetch related payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", booking.id);

  // Format the response to include all necessary data
  const formattedBooking = {
    id: booking.id,
    created_at: booking.created_at,
    check_in: booking.check_in,
    check_out: booking.check_out,
    adults: booking.adults || 1,
    children: booking.children || 0,
    total_amount: booking.total_amount,
    paid_amount: booking.paid_amount,
    status: booking.status,
    source: booking.source,
    special_requests: booking.special_requests,
    notes: booking.notes,
    unit: {
      id: booking.unit?.id,
      name: booking.unit?.name,
      floor: booking.unit?.floor,
      room_type: {
        name: roomType?.name || "Default Room",
        base_price: roomType?.base_price || 0,
      },
    },
    guest: {
      id: booking.guest?.id,
      first_name: booking.guest?.first_name,
      last_name: booking.guest?.last_name,
      email: booking.guest?.email,
      phone: booking.guest?.phone,
    },
    hotel: {
      id: booking.hotel?.id,
      name: booking.hotel?.name,
      currency: booking.hotel?.currency || "SAR",
    },
    payments: payments || [],
  };

  return NextResponse.json({ data: formattedBooking });
}