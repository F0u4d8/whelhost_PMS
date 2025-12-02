import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

// POST /api/v1/bookings/[id]/check-in
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
    .select(`
      *,
      hotel:hotels!inner(id, owner_id),
      unit:units(id)
    `)
    .eq("id", id)
    .single()

  if (!booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Booking must be confirmed to check in" }, { status: 400 })
  }

  // Update booking status
  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
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

  // Update unit status to occupied
  if (booking.unit_id) {
    await supabase.from("units").update({ status: "occupied" }).eq("id", booking.unit_id)
  }

  // Create notification for the check-in
  await NotificationService.createBookingNotification(
    booking.hotel_id,
    booking.id,
    "checked_in",
    updatedBooking.guest ? `${updatedBooking.guest.first_name} ${updatedBooking.guest.last_name}` : undefined
  )

  // Create a task for room cleaning after checkout (for future)
  await supabase.from("tasks").insert({
    hotel_id: booking.hotel_id,
    unit_id: booking.unit_id,
    booking_id: booking.id,
    title: `Prepare room for checkout - ${updatedBooking.guest?.first_name || "Guest"}`,
    description: `Room cleaning scheduled for checkout on ${booking.check_out}`,
    priority: "medium",
    status: "pending",
    due_date: booking.check_out,
    created_by: user.id,
  })

  return NextResponse.json({ data: updatedBooking })
}
