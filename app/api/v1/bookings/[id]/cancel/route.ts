import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

// POST /api/v1/bookings/[id]/cancel
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get booking with hotel info
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, hotel:hotels!inner(owner_id)")
    .eq("id", id)
    .single()

  if (!booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status === "checked_out" || booking.status === "cancelled") {
    return NextResponse.json({ error: "Cannot cancel this booking" }, { status: 400 })
  }

  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      unit:units(id, name),
      guest:guests(id, first_name, last_name, email, phone)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If unit was occupied, set back to available
  if (booking.unit_id && booking.status === "checked_in") {
    await supabase.from("units").update({ status: "available" }).eq("id", booking.unit_id)
  }

  // Create notification for the cancellation
  await NotificationService.createBookingNotification(
    booking.hotel_id,
    booking.id,
    "cancelled",
    updatedBooking.guest ? `${updatedBooking.guest.first_name} ${updatedBooking.guest.last_name}` : undefined
  )

  return NextResponse.json({ data: updatedBooking })
}
