import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/properties/[id]/units
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify hotel ownership
  const { data: hotel } = await supabase.from("hotels").select("id").eq("id", id).eq("owner_id", user.id).single()

  if (!hotel) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  const { data: units, error } = await supabase
    .from("units")
    .select(`
      *,
      room_type:room_types(id, name, base_price, max_occupancy)
    `)
    .eq("hotel_id", id)
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: units })
}

// POST /api/v1/properties/[id]/units
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify hotel ownership
  const { data: hotel } = await supabase.from("hotels").select("id").eq("id", id).eq("owner_id", user.id).single()

  if (!hotel) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  const body = await request.json()
  const { name, room_type_id, floor, status, notes } = body

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data: unit, error } = await supabase
    .from("units")
    .insert({
      hotel_id: id,
      name,
      room_type_id,
      floor,
      status: status || "available",
      notes,
    })
    .select(`
      *,
      room_type:room_types(id, name, base_price, max_occupancy)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: unit }, { status: 201 })
}
