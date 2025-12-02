import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/v1/direct-messages?hotelId={hotelId}
// Get direct messages between user and hotel owner
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const hotelId = url.searchParams.get("hotelId");

  if (!hotelId) {
    return NextResponse.json({ error: "Missing hotelId parameter" }, { status: 400 });
  }

  // Verify that the user has access to this hotel
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("id, owner_id")
    .eq("id", hotelId)
    .single();

  if (hotelError || !hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  // Get messages between current user and hotel owner
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(full_name, email, avatar_url)
    `)
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${user.id})`)
    .and(`and(recipient_id.eq.${hotel.owner_id},sender_id.eq.${user.id}),and(sender_id.eq.${hotel.owner_id},recipient_id.eq.${user.id})`)
    .eq("hotel_id", hotelId)
    .eq("booking_id", null) // Only direct messages, not booking-related
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages as read if they were sent to the current user
  if (messages && messages.length > 0) {
    const unreadMessageIds = messages
      .filter(msg => !msg.is_read && msg.recipient_id === user.id)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadMessageIds);
    }
  }

  return NextResponse.json({ data: messages || [] });
}

// POST /api/v1/direct-messages
// Send a direct message to hotel owner
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { hotelId, recipientId, message } = body;

  if (!hotelId || !recipientId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify that the recipient is the hotel owner
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("owner_id")
    .eq("id", hotelId)
    .single();

  if (hotelError || !hotel || hotel.owner_id !== recipientId) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  // Check if the user is the same as the recipient (shouldn't message themselves)
  if (user.id === recipientId) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Create the message
  const { data: newMessage, error } = await supabase
    .from("messages")
    .insert({
      hotel_id: hotelId,
      sender_id: user.id,
      recipient_id: recipientId,
      content: message,
      message_type: "guest",
      is_read: false,
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(full_name, email, avatar_url)
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: newMessage }, { status: 201 });
}