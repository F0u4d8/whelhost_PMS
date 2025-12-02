import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/v1/inbox/conversations
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's hotels
  const { data: hotels } = await supabase.from("hotels").select("id").eq("owner_id", user.id)

  if (!hotels || hotels.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const hotelIds = hotels.map((h) => h.id)

  // Get messages grouped by booking (conversations)
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      booking:bookings(id, guest:guests(first_name, last_name))
    `)
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by booking_id to create conversations
  const conversations = new Map()
  messages?.forEach((msg) => {
    const key = msg.booking_id || `direct_${msg.recipient_id || msg.sender_id}`
    if (!conversations.has(key)) {
      conversations.set(key, {
        id: key,
        booking_id: msg.booking_id,
        guest_name: msg.booking?.guest ? `${msg.booking.guest.first_name} ${msg.booking.guest.last_name}` : "Unknown",
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: 0,
        messages: [],
      })
    }
    const conv = conversations.get(key)
    conv.messages.push(msg)
    if (!msg.is_read && msg.recipient_id === user.id) {
      conv.unread_count++
    }
  })

  return NextResponse.json({ data: Array.from(conversations.values()) })
}
