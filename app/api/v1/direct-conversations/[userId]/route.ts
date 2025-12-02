import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/v1/direct-conversations/[userId]
// Get messages between current user (owner) and a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: otherUserId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify that the current user owns a hotel (to ensure they're an owner)
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .single();

  if (hotelError || !hotel) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Get messages between current user and the specified user
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, email, avatar_url)
    `)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .eq("hotel_id", hotel.id)
    .is("booking_id", null) // Only direct messages
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching conversation:", error);
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