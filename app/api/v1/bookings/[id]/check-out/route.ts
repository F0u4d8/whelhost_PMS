import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

// POST /api/v1/bookings/[id]/check-out
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

  if (booking.status !== "checked_in") {
    return NextResponse.json({ error: "Guest must be checked in to check out" }, { status: 400 })
  }

  // Update booking status
  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update({
      status: "checked_out",
      checked_out_at: new Date().toISOString(),
      checked_out_by: user.id,
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

  // Update unit status to available
  if (booking.unit_id) {
    await supabase.from("units").update({ status: "available" }).eq("id", booking.unit_id)
  }

  // Create notification for the check-out
  await NotificationService.createBookingNotification(
    booking.hotel_id,
    booking.id,
    "checked_out",
    updatedBooking.guest ? `${updatedBooking.guest.first_name} ${updatedBooking.guest.last_name}` : undefined
  )

  // Revoke any active access codes for this booking
  await supabase.from("access_codes").update({ is_active: false }).eq("booking_id", id)

  // Create cleaning task
  await supabase.from("tasks").insert({
    hotel_id: booking.hotel_id,
    unit_id: booking.unit_id,
    booking_id: booking.id,
    title: `Room cleaning after checkout`,
    description: `Clean and prepare room for next guest`,
    priority: "high",
    status: "pending",
    due_date: new Date().toISOString(),
    created_by: user.id,
  })

  return NextResponse.json({ data: updatedBooking })
}
