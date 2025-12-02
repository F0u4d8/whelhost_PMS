import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// POST /api/v1/reports/generate
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { report_type, property_id, from_date, to_date } = body

  // Get user's hotel
  let hotelQuery = supabase.from("hotels").select("id, name, currency").eq("owner_id", user.id)

  if (property_id) {
    hotelQuery = hotelQuery.eq("id", property_id)
  }

  const { data: hotels } = await hotelQuery

  if (!hotels || hotels.length === 0) {
    return NextResponse.json({ error: "No properties found" }, { status: 404 })
  }

  const hotelIds = hotels.map((h) => h.id)
  const currency = hotels[0].currency

  // Fetch data based on report type
  const fromDate = from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const toDate = to_date || new Date().toISOString().split("T")[0]

  // Get bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, status, source, total_amount, unit_id")
    .in("hotel_id", hotelIds)
    .gte("check_in", fromDate)
    .lte("check_out", toDate)

  // Get units count
  const { data: units } = await supabase.from("units").select("id").in("hotel_id", hotelIds)

  const totalUnits = units?.length || 1
  const totalBookings = bookings?.length || 0
  const completedBookings = bookings?.filter((b) => b.status === "checked_out" || b.status === "checked_in") || []

  // Calculate metrics
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)

  // Calculate room nights
  const roomNights = completedBookings.reduce((sum, b) => {
    const checkIn = new Date(b.check_in)
    const checkOut = new Date(b.check_out)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return sum + nights
  }, 0)

  // Calculate date range in days
  const dateRangeDays =
    Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24)) || 1

  const availableRoomNights = totalUnits * dateRangeDays
  const occupancyRate = availableRoomNights > 0 ? Math.round((roomNights / availableRoomNights) * 100) : 0

  const adr = roomNights > 0 ? Math.round(totalRevenue / roomNights) : 0
  const revpar = Math.round(totalRevenue / availableRoomNights || 0)

  // Source breakdown
  const sourceBreakdown =
    bookings?.reduce(
      (acc, b) => {
        acc[b.source] = (acc[b.source] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Daily revenue
  const dailyRevenue = completedBookings.reduce(
    (acc, b) => {
      const date = b.check_in.split("T")[0]
      acc[date] = (acc[date] || 0) + (b.total_amount || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  return NextResponse.json({
    data: {
      report_type,
      period: { from: fromDate, to: toDate },
      metrics: {
        total_revenue: totalRevenue,
        currency,
        total_bookings: totalBookings,
        room_nights: roomNights,
        occupancy_rate: occupancyRate,
        adr, // Average Daily Rate
        revpar, // Revenue Per Available Room
      },
      breakdown: {
        by_source: sourceBreakdown,
        daily_revenue: dailyRevenue,
      },
    },
  })
}
