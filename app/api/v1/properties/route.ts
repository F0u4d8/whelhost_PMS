import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/properties - List all properties for user
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: hotels })
}

// POST /api/v1/properties - Create a new property
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, address, city, country, phone, email, timezone, currency, check_in_time, check_out_time } =
    body

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data: hotel, error } = await supabase
    .from("hotels")
    .insert({
      owner_id: user.id,
      name,
      description,
      address,
      city,
      country,
      phone,
      email,
      timezone: timezone || "UTC",
      currency: currency || "SAR",
      check_in_time: check_in_time || "15:00",
      check_out_time: check_out_time || "11:00",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: hotel }, { status: 201 })
}
