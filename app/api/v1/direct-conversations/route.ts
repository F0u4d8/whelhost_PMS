import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/v1/direct-conversations
// Get all direct conversations for the current user (owner perspective)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all hotels owned by the user
  const { data: hotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !hotels || hotels.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const hotelIds = hotels.map(h => h.id);

  // Get all direct messages for all owned hotels
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, email, avatar_url)
    `)
    .in("hotel_id", hotelIds)
    .is("booking_id", null) // Only direct messages, not booking-related
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`) // Messages where user is either sender or recipient
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("Error fetching direct conversations:", messagesError);
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  // Group messages by the other participant (sender or recipient)
  const conversations = new Map();
  messages?.forEach(msg => {
    // Determine the other participant (not the current user)
    const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
    if (!otherId) return; // Skip if no other participant
    
    if (!conversations.has(otherId)) {
      // Find the profile of the other participant to get their info
      const otherProfile = msg.sender_id === user.id ? msg.recipient : msg.sender;
      conversations.set(otherId, {
        id: otherId,
        participant: otherProfile,
        latest_message: msg.content,
        latest_message_at: msg.created_at,
        unread_count: 0,
        messages: [],
        hotel_id: msg.hotel_id,
      });
    }
    
    const conv = conversations.get(otherId);
    conv.messages.push(msg);
    
    // Count unread messages sent to current user
    if (!msg.is_read && msg.recipient_id === user.id) {
      conv.unread_count++;
    }
  });

  const result = Array.from(conversations.values()).sort(
    (a, b) => new Date(b.latest_message_at).getTime() - new Date(a.latest_message_at).getTime()
  );

  return NextResponse.json({ data: result });
}