import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateAccessCode } from "@/lib/locks-adapter"

// POST /api/v1/bookings/[id]/generate-access
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { type = "pin", valid_from, valid_to } = body

  // Get booking with unit and smart lock info
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      hotel:hotels!inner(id, owner_id),
      unit:units(id, name, smart_lock_id),
      guest:guests(first_name, last_name, email, phone)
    `)
    .eq("id", id)
    .single()

  if (!booking || booking.hotel?.owner_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (!booking.unit?.smart_lock_id) {
    return NextResponse.json({ error: "No smart lock configured for this unit" }, { status: 400 })
  }

  // Get smart lock details
  const { data: lock } = await supabase.from("smart_locks").select("*").eq("id", booking.unit.smart_lock_id).single()

  if (!lock) {
    return NextResponse.json({ error: "Smart lock not found" }, { status: 404 })
  }

  // Generate access code using adapter
  const accessResult = await generateAccessCode({
    provider: lock.provider || type,
    deviceId: lock.device_id,
    validFrom: valid_from || booking.check_in,
    validTo: valid_to || booking.check_out,
    guestName: `${booking.guest?.first_name} ${booking.guest?.last_name}`,
    credentials: lock.credentials,
  })

  // Store access code
  const { data: accessCode, error } = await supabase
    .from("access_codes")
    .insert({
      smart_lock_id: lock.id,
      booking_id: id,
      code: accessResult.code,
      valid_from: valid_from || booking.check_in,
      valid_until: valid_to || booking.check_out,
      is_active: true,
      issued_to: `${booking.guest?.first_name} ${booking.guest?.last_name}`,
      provider_response: accessResult.providerResponse,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send message to guest with access code
  await supabase.from("messages").insert({
    hotel_id: booking.hotel_id,
    booking_id: id,
    recipient_id: booking.guest?.user_id,
    subject: "Your Room Access Code",
    content: `Your access code for ${booking.unit?.name} is: ${accessResult.code}\n\nValid from: ${valid_from || booking.check_in}\nValid until: ${valid_to || booking.check_out}`,
    message_type: "system",
    is_read: false,
  })

  return NextResponse.json({
    data: accessCode,
    code: accessResult.code,
    message: "Access code generated and sent to guest",
  })
}
