import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/calendar
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
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0]
  const to = searchParams.get("to") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  // Get user's hotels
  let hotelQuery = supabase.from("hotels").select("id").eq("owner_id", user.id)

  if (propertyId) {
    hotelQuery = hotelQuery.eq("id", propertyId)
  }

  const { data: hotels } = await hotelQuery

  if (!hotels || hotels.length === 0) {
    return NextResponse.json({ data: { units: [], bookings: [] } })
  }

  const hotelIds = hotels.map((h) => h.id)

  // Get units
  const { data: units } = await supabase
    .from("units")
    .select(`
      id, name, status, floor,
      room_type:room_types(name, base_price)
    `)
    .in("hotel_id", hotelIds)
    .order("name")

  // Get bookings in date range
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, unit_id, check_in, check_out, status, source,
      guest:guests(first_name, last_name)
    `)
    .in("hotel_id", hotelIds)
    .not("status", "eq", "cancelled")
    .or(`check_in.lte.${to},check_out.gte.${from}`)

  return NextResponse.json({
    data: {
      units: units || [],
      bookings: bookings || [],
      dateRange: { from, to },
    },
  })
}

// POST /api/v1/calendar/block - Block dates for a unit
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { unit_id, from_date, to_date, reason } = body

  // Verify unit ownership
  const { data: unit } = await supabase
    .from("units")
    .select("hotel:hotels!inner(id, owner_id)")
    .eq("id", unit_id)
    .single()

  if (!unit || unit.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  // Create a blocked booking
  const { data: blocking, error } = await supabase
    .from("bookings")
    .insert({
      hotel_id: unit.hotel.id,
      unit_id,
      check_in: from_date,
      check_out: to_date,
      status: "confirmed",
      source: "direct",
      adults: 0,
      children: 0,
      notes: reason || "Blocked",
      paid_amount: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: blocking })
}
