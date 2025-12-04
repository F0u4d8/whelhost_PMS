import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

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

  // Generate access token for guest to view their bill
  const guestAccessToken = nanoid(16); // Generate a short unique token

  await supabase
    .from("guest_access_tokens")
    .insert({
      booking_id: id,
      token: guestAccessToken,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
      created_by: user.id,
    })

  // Send message to guest with bill access link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const billAccessUrl = `${baseUrl}/guest/bill?token=${guestAccessToken}`;

  // Optionally send email to guest with the bill link
  await supabase.from("messages").insert({
    hotel_id: booking.hotel_id,
    booking_id: id,
    recipient_id: updatedBooking.guest?.id, // Assuming guest has a user_id
    subject: "Your Checkout Bill & Receipt",
    content: `Thank you for staying with us! Your checkout is complete. You can access and print your bill at: ${billAccessUrl}\n\nThis link allows you to print or download your receipt for your records.`,
    message_type: "system",
    is_read: false,
  })

  return NextResponse.json({
    data: updatedBooking,
    bill_access_url: billAccessUrl
  })
}
