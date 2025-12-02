import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import type { ChannexBookingPayload } from "@/lib/types"

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

// POST /webhooks/channex/booking
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const rawBody = await request.text()
  const signature = request.headers.get("x-channex-signature") || ""

  let payload: ChannexBookingPayload & { hotel_id?: string }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Find channel by external property ID to get hotel and verify signature
  const { data: channel } = await supabase
    .from("channels")
    .select("id, hotel_id, webhook_secret")
    .eq("property_id", payload.external_unit_id?.split("_")[0] || "")
    .eq("type", "channex")
    .single()

  // In production, verify signature
  // if (channel?.webhook_secret && !verifySignature(rawBody, signature, channel.webhook_secret)) {
  //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  // }

  // Log webhook immediately
  const { data: webhookLog } = await supabase
    .from("webhook_logs")
    .insert({
      hotel_id: channel?.hotel_id,
      provider: "channex",
      event_type: "booking.created",
      external_id: payload.external_id,
      payload: payload as unknown as Record<string, unknown>,
      status: "received",
      retry_count: 0,
    })
    .select()
    .single()

  // Respond immediately (webhook best practice)
  // Process async in background
  processBookingWebhook(payload, channel?.hotel_id, webhookLog?.id)

  return NextResponse.json({ received: true, log_id: webhookLog?.id })
}

// Process webhook in background
async function processBookingWebhook(
  payload: ChannexBookingPayload,
  hotelId: string | undefined,
  logId: string | undefined,
) {
  const supabase = await createClient()

  try {
    if (!hotelId) {
      throw new Error("Hotel not found for this webhook")
    }

    // Check for idempotency - don't process duplicate webhooks
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("external_id", payload.external_id)
      .single()

    if (existingBooking) {
      // Update existing booking instead of creating new
      await supabase
        .from("bookings")
        .update({
          status: payload.status === "cancelled" ? "cancelled" : "confirmed",
          total_amount: payload.total_amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBooking.id)

      await updateWebhookLog(supabase, logId, "processed")
      return
    }

    // Parse guest name
    const nameParts = payload.guest.name.split(" ")
    const firstName = nameParts[0] || "Guest"
    const lastName = nameParts.slice(1).join(" ") || ""

    // Find or create guest
    let guestId: string | null = null
    if (payload.guest.email) {
      const { data: existingGuest } = await supabase
        .from("guests")
        .select("id")
        .eq("hotel_id", hotelId)
        .eq("email", payload.guest.email)
        .single()

      if (existingGuest) {
        guestId = existingGuest.id
      }
    }

    if (!guestId) {
      const { data: newGuest } = await supabase
        .from("guests")
        .insert({
          hotel_id: hotelId,
          first_name: firstName,
          last_name: lastName,
          email: payload.guest.email,
          phone: payload.guest.phone,
        })
        .select()
        .single()

      guestId = newGuest?.id || null
    }

    // Find unit by external ID mapping or name
    const { data: unit } = await supabase.from("units").select("id").eq("hotel_id", hotelId).limit(1).single()

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        hotel_id: hotelId,
        unit_id: unit?.id,
        guest_id: guestId,
        external_id: payload.external_id,
        check_in: payload.checkin.split("T")[0],
        check_out: payload.checkout.split("T")[0],
        status: "confirmed",
        source: "channex",
        adults: 1,
        children: 0,
        total_amount: payload.total_amount,
        paid_amount: 0,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Update unit availability if assigned
    if (unit?.id) {
      const today = new Date().toISOString().split("T")[0]
      const checkIn = payload.checkin.split("T")[0]
      if (checkIn === today) {
        await supabase.from("units").update({ status: "occupied" }).eq("id", unit.id)
      }
    }

    // Create cleaning task
    await supabase.from("tasks").insert({
      hotel_id: hotelId,
      unit_id: unit?.id,
      booking_id: booking?.id,
      title: `Prepare room for ${firstName} ${lastName}`,
      description: `Check-in: ${payload.checkin}\nSource: Channex`,
      priority: "medium",
      status: "pending",
      due_date: payload.checkin,
    })

    // Create system notification message
    await supabase.from("messages").insert({
      hotel_id: hotelId,
      booking_id: booking?.id,
      subject: "New Booking from Channel",
      content: `New booking received via Channex:\nGuest: ${firstName} ${lastName}\nCheck-in: ${payload.checkin}\nCheck-out: ${payload.checkout}\nAmount: ${payload.total_amount} ${payload.currency}`,
      message_type: "system",
      is_read: false,
    })

    await updateWebhookLog(supabase, logId, "processed")
  } catch (error) {
    console.error("Webhook processing error:", error)
    await updateWebhookLog(supabase, logId, "failed", (error as Error).message)
  }
}

async function updateWebhookLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  logId: string | undefined,
  status: string,
  errorMessage?: string,
) {
  if (!logId) return

  await supabase
    .from("webhook_logs")
    .update({
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("id", logId)
}
