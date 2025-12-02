import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get hotel for the user
  const { data: hotel } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!hotel) {
    return Response.json({ error: "No hotel found for user" }, { status: 404 });
  }

  // Get notifications for the hotel
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("hotel_id", hotel.id)
    .order("created_at", { ascending: false })
    .limit(20); // Limit to last 20 notifications

  if (error) {
    console.error("Error fetching notifications:", error);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }

  // Count unread notifications
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact" })
    .eq("hotel_id", hotel.id)
    .eq("is_read", false);

  return Response.json({ notifications, unreadCount: unreadCount || 0 });
}