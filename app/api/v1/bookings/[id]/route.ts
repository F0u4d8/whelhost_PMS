import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/bookings/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      unit:units(id, name, floor, room_type:room_types(name, base_price)),
      guest:guests(*),
      hotel:hotels!inner(id, name, owner_id, currency)
    `)
    .eq("id", id)
    .single()

  if (error || !booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  return NextResponse.json({ data: booking })
}

// PUT /api/v1/bookings/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Verify ownership by fetching the existing booking
  const { data: existingBooking, error: existingBookingError } = await supabase
    .from("bookings")
    .select("id, hotel_id, unit_id, check_in, check_out, status")
    .eq("id", id)
    .single()

  if (existingBookingError || !existingBooking || !existingBooking.hotel_id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify user has access to this hotel
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("id", existingBooking.hotel_id)
    .eq("owner_id", user.id)
    .single()

  if (hotelError || !hotel) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Extract and validate specific fields that can be updated (ignore hotel_id from request for security)
  const {
    unit_id,
    guest_id,
    check_in,
    check_out,
    adults,
    children,
    total_amount,
    notes,
    special_requests,
    source,
    status
  } = body

  // Prepare update data (do not allow changing hotel_id to prevent unauthorized access)
  const updateData: any = {
    unit_id: unit_id !== undefined ? unit_id : existingBooking.unit_id,
    guest_id: guest_id !== undefined ? guest_id : existingBooking.guest_id,
    check_in: check_in !== undefined ? check_in : existingBooking.check_in,
    check_out: check_out !== undefined ? check_out : existingBooking.check_out,
    adults: adults !== undefined ? adults : existingBooking.adults,
    children: children !== undefined ? children : existingBooking.children,
    total_amount: total_amount !== undefined ? total_amount : existingBooking.total_amount,
    notes: notes !== undefined ? notes : existingBooking.notes,
    special_requests: special_requests !== undefined ? special_requests : existingBooking.special_requests,
    source: source !== undefined ? source : existingBooking.source,
    status: status !== undefined ? status : existingBooking.status,
    updated_at: new Date().toISOString(),
  }

  // Check for availability conflicts if unit_id is changing or dates are modified
  if (updateData.unit_id && (existingBooking.unit_id !== updateData.unit_id || existingBooking.check_in !== updateData.check_in || existingBooking.check_out !== updateData.check_out)) {
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("unit_id", updateData.unit_id)
      .neq("id", id) // Exclude current booking
      .not("status", "in", '("cancelled","checked_out")')
      .or(`check_in.lte.${updateData.check_out},check_out.gte.${updateData.check_in}`)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: "Unit not available for selected dates" }, { status: 400 })
    }
  }

  const { data: booking, error: updateError } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      unit:units(id, name),
      guest:guests(id, first_name, last_name, email, phone)
    `)
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update unit status based on check-in date and booking status
  if (updateData.unit_id) {
    const today = new Date().toISOString().split("T")[0]
    const checkInDate = updateData.check_in.split("T")[0]

    if (checkInDate === today && updateData.status === "confirmed") {
      await supabase.from("units").update({ status: "occupied" }).eq("id", updateData.unit_id)
    } else if (updateData.status === "cancelled") {
      // Free up the unit if booking is cancelled and unit was occupied
      await supabase.from("units").update({ status: "available" }).eq("id", updateData.unit_id)
    }
  }

  return NextResponse.json({ data: booking })
}
