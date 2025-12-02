import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// POST /api/v1/inbox/conversations/[id]/messages
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { message, send_via = "channel" } = body

  // Get booking to verify ownership and get guest info
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id, hotel_id, guest_id,
      hotel:hotels!inner(owner_id),
      guest:guests(user_id, email, phone)
    `)
    .eq("id", bookingId)
    .single()

  if (!booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Create message
  const { data: newMessage, error } = await supabase
    .from("messages")
    .insert({
      hotel_id: booking.hotel_id,
      booking_id: bookingId,
      sender_id: user.id,
      recipient_id: booking.guest?.user_id,
      content: message,
      message_type: send_via === "channel" ? "channel" : "internal",
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // In production, if send_via is "sms" or "email", trigger external service
  // if (send_via === "sms" && booking.guest?.phone) {
  //   await sendSMS(booking.guest.phone, message)
  // }
  // if (send_via === "email" && booking.guest?.email) {
  //   await sendEmail(booking.guest.email, "Message from Hotel", message)
  // }

  return NextResponse.json({ data: newMessage }, { status: 201 })
}
