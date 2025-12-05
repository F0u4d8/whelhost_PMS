"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Message {
  id: string;
  conversationId: string;
  sender: "guest" | "staff";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  reservationId?: string;
  channel: "direct" | "booking" | "airbnb" | "whatsapp" | "email";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "open" | "resolved" | "pending";
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Get messages for the user's hotels to create conversations
  // We'll group messages by guest_id to form conversations
  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select(`
      id,
      hotel_id,
      sender_id,
      recipient_id,
      content,
      is_read,
      created_at,
      guest_id
    `)
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false });

  let conversations: Conversation[] = [];
  if (messagesError) {
    console.error("Error fetching messages for conversations:", messagesError);
    return [];
  } else {
    // Group messages by guest to form conversations
    const groupedMessages = new Map<string, {
      messages: any[],
      guestInfo: any
    }>();

    for (const message of messagesData) {
      const guestId = message.guest_id || message.sender_id || message.recipient_id;
      if (!guestId) continue;

      if (!groupedMessages.has(guestId)) {
        groupedMessages.set(guestId, { messages: [], guestInfo: null });
      }
      groupedMessages.get(guestId)!.messages.push(message);
    }

    // Get guest information for each conversation
    for (const [guestId, group] of groupedMessages.entries()) {
      // Get guest details
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("id, first_name, last_name")
        .eq("id", guestId)
        .single();

      // Find the latest message in the group
      const latestMessage = group.messages
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      // Count unread messages
      const unreadCount = group.messages.filter(msg => !msg.is_read).length;

      if (guestData) {
        const guestName = `${guestData.first_name || ''} ${guestData.last_name || ''}`.trim() || 'ضيف';

        conversations.push({
          id: guestId, // Using guestId as conversation ID
          guestId: guestId,
          guestName: guestName,
          reservationId: undefined, // Would need to link to specific booking
          channel: "direct", // Default, could be derived from message source
          lastMessage: latestMessage.content || '',
          lastMessageTime: latestMessage.created_at || new Date().toISOString(),
          unreadCount: unreadCount,
          status: "open", // Default status
        });
      }
    }
  }

  return conversations;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to ensure they have access
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  // Get messages for the specific conversation (guest)
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      is_read,
      sender_id
    `)
    .eq("hotel_id", userHotels[0].id) // Use first hotel for this user
    .eq("guest_id", conversationId) // Filter by the conversation ID (which is the guest ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  // Map the data
  return data.map(item => ({
    id: item.id,
    conversationId: conversationId, // Use the conversation ID passed in
    sender: item.sender_id === user.id ? "staff" : "guest", // Determine sender based on user ID
    content: item.content || "",
    timestamp: item.created_at?.replace("T", " ").substring(0, 16) || new Date().toISOString().replace("T", " ").substring(0, 16),
    read: item.is_read || false,
  }));
}

export async function sendMessage(content: string, guestId: string): Promise<Message> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get user's hotel ID since we need to associate the message with a hotel
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No authorized hotel found");
  }

  // Insert the new message
  const { data, error } = await supabase
    .from("messages")
    .insert([{
      hotel_id: userHotels[0].id,
      guest_id: guestId,  // Associate with the specific guest
      sender_id: user.id, // Staff member sending the message
      content: content,
      is_read: false, // New message is unread by default
    }])
    .select(`
      id,
      content,
      created_at,
      is_read,
      sender_id,
      hotel_id,
      guest_id
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }

  // Return the created message
  return {
    id: data.id,
    conversationId: data.guest_id, // Using guestId as conversationId
    sender: "staff", // Since the staff is sending this
    content: data.content || "",
    timestamp: data.created_at?.replace("T", " ").substring(0, 16) || new Date().toISOString().replace("T", " ").substring(0, 16),
    read: data.is_read || false,
  };
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get user's hotel ID to ensure proper authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No authorized hotel found");
  }

  // Update all messages between this user and the guest to be read
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("hotel_id", userHotels[0].id)
    .eq("guest_id", conversationId) // Mark messages for this specific guest as read
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
}