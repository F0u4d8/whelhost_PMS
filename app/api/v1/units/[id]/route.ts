import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/units/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: unit, error } = await supabase
    .from("units")
    .select(`
      *,
      room_type:room_types(id, name, base_price, max_occupancy),
      hotel:hotels!inner(id, owner_id)
    `)
    .eq("id", id)
    .single()

  if (error || !unit || unit.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  return NextResponse.json({ data: unit })
}

// PUT /api/v1/units/[id]
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

  // Get unit with hotel to verify ownership
  const { data: existingUnit } = await supabase
    .from("units")
    .select("hotel:hotels!inner(owner_id)")
    .eq("id", id)
    .single()

  if (!existingUnit || existingUnit.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  const { data: unit, error } = await supabase
    .from("units")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("hotel_id", existingUnit.hotel.id)
    .select(`
      *,
      room_type:room_types(id, name, base_price, max_occupancy)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: unit })
}

// DELETE /api/v1/units/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get unit with hotel to verify ownership
  const { data: existingUnit } = await supabase
    .from("units")
    .select("hotel:hotels!inner(owner_id)")
    .eq("id", id)
    .single()

  if (!existingUnit || existingUnit.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  const { error } = await supabase.from("units").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
