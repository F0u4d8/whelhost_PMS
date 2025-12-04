import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/bookings
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get("property_id")
  const status = searchParams.get("status")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Get user's hotels
  const { data: hotels } = await supabase.from("hotels").select("id").eq("owner_id", user.id)

  if (!hotels || hotels.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const hotelIds = hotels.map((h) => h.id)

  let query = supabase
    .from("bookings")
    .select(`
      *,
      unit:units(id, name),
      guest:guests(id, first_name, last_name, email, phone)
    `)
    .in("hotel_id", hotelIds)
    .order("check_in", { ascending: false })

  if (propertyId) {
    query = query.eq("hotel_id", propertyId)
  }
  if (status) {
    query = query.eq("status", status)
  }
  if (from) {
    query = query.gte("check_in", from)
  }
  if (to) {
    query = query.lte("check_out", to)
  }

  const { data: bookings, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: bookings })
}

// POST /api/v1/bookings - Create direct/manual booking
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    hotel_id, // Received from the form but will be validated
    unit_id,
    guest_id,
    guest, // For creating new guest inline
    check_in,
    check_out,
    adults,
    children,
    total_amount,
    notes,
    special_requests,
    source = "direct",
    status = "confirmed", // Allow status to be passed from form for edit functionality
  } = body

  // Verify hotel ownership
  const { data: hotel } = await supabase.from("hotels").select("id").eq("id", hotel_id).eq("owner_id", user.id).single()

  if (!hotel) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Check for availability conflicts
  if (unit_id) {
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("unit_id", unit_id)
      .not("status", "in", '("cancelled","checked_out")')
      .or(`check_in.lte.${check_out},check_out.gte.${check_in}`)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: "Unit not available for selected dates" }, { status: 400 })
    }
  }

  let finalGuestId = guest_id

  // Create guest if provided inline
  if (!guest_id && guest) {
    const { data: newGuest, error: guestError } = await supabase
      .from("guests")
      .insert({
        hotel_id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
      })
      .select()
      .single()

    if (guestError) {
      return NextResponse.json({ error: guestError.message }, { status: 500 })
    }
    finalGuestId = newGuest.id
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      hotel_id,
      unit_id,
      guest_id: finalGuestId,
      check_in,
      check_out,
      adults: adults || 1,
      children: children || 0,
      total_amount,
      notes,
      special_requests,
      source,
      status, // Use the status passed from the form
      paid_amount: 0,
    })
    .select(`
      *,
      unit:units(id, name),
      guest:guests(id, first_name, last_name, email, phone)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update unit status to occupied if check-in is today
  const today = new Date().toISOString().split("T")[0]
  if (unit_id && check_in === today && status === "confirmed") {
    await supabase.from("units").update({ status: "occupied" }).eq("id", unit_id)
  }

  // Create notification for the new booking
  await NotificationService.createBookingNotification(
    hotel_id,
    booking.id,
    "created",
    booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : undefined
  )

  return NextResponse.json({ data: booking }, { status: 201 })
}
