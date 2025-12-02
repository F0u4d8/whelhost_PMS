import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/payments
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("booking_id")

  // Get user's hotels
  const { data: hotels } = await supabase.from("hotels").select("id").eq("owner_id", user.id)

  if (!hotels || hotels.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const hotelIds = hotels.map((h) => h.id)

  let query = supabase
    .from("payments")
    .select(`
      *,
      booking:bookings(id, guest:guests(first_name, last_name)),
      invoice:invoices(invoice_number)
    `)
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false })

  if (bookingId) {
    query = query.eq("booking_id", bookingId)
  }

  const { data: payments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: payments })
}
