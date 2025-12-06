"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export async function getNotifications(): Promise<Notification[]> {
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

  // Get notifications for the user's hotels
  let notifications: Notification[] = [];

  // First try with full schema
  const { data: notificationsData, error: notificationsError } = await supabase
    .from("notifications")
    .select(`
      id,
      title,
      message,
      type,
      is_read,
      created_at
    `)
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false });

  if (notificationsError) {
    console.warn("Error fetching notifications with full schema:", notificationsError.message);

    // Fallback: If no notifications table exists, we'll simulate notifications based on recent activity
    try {
      // Check if notifications table exists
      const { error: tableCheckError } = await supabase
        .from("notifications")
        .select("id")
        .limit(1);

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.warn("Notifications table does not exist, creating simulated notifications");

        // Create simulated notifications based on recent activity
        const simulatedNotifications: Notification[] = [];

        // Get recent messages
        const { data: recentMessages, error: messagesError } = await supabase
          .from("messages")
          .select("id, content, created_at, channel_id")
          .in("hotel_id", hotelIds)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
          .order("created_at", { ascending: false })
          .limit(5);

        if (!messagesError && recentMessages) {
          for (const message of recentMessages) {
            const { data: channelData } = await supabase
              .from("channels")
              .select("name")
              .eq("id", message.channel_id)
              .single();

            simulatedNotifications.push({
              id: `msg_${message.id}`,
              title: "رسالة جديدة",
              message: `لقد تلقيت رسالة جديدة من ${channelData?.name || "قناة غير معروفة"}`,
              type: "info",
              read: false,
              createdAt: message.created_at,
              actionUrl: `/dashboard/inbox`
            });
          }
        }

        // Get recent bookings
        const { data: recentBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("id, created_at, check_in, guest_id")
          .in("hotel_id", hotelIds)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
          .order("created_at", { ascending: false })
          .limit(5);

        if (!bookingsError && recentBookings) {
          for (const booking of recentBookings) {
            // Get guest name
            let guestName = "ضيف";
            if (booking.guest_id) {
              const { data: guestData } = await supabase
                .from("guests")
                .select("first_name, last_name")
                .eq("id", booking.guest_id)
                .single();

              if (guestData) {
                guestName = `${guestData.first_name} ${guestData.last_name}`.trim() || "ضيف";
              }
            }

            simulatedNotifications.push({
              id: `booking_${booking.id}`,
              title: "حجز جديد",
              message: `تم إنشاء حجز جديد من ${guestName} في ${new Date(booking.check_in).toLocaleDateString('ar-SA')}`,
              type: "success",
              read: false,
              createdAt: booking.created_at,
              actionUrl: `/dashboard/reservations`
            });
          }
        }

        return simulatedNotifications;
      } else {
        // If it's a different error, return an empty array
        console.error("Error accessing notifications table:", tableCheckError);
        return [];
      }
    } catch (error) {
      console.error("Error in notifications fallback:", error);
      return [];
    }
  } else {
    // Process the notifications data
    notifications = notificationsData.map(item => ({
      id: item.id,
      title: item.title || "إشعار",
      message: item.message || "لديك إشعار جديد",
      type: item.type || "info",
      read: item.is_read || false,
      createdAt: item.created_at || new Date().toISOString(),
      actionUrl: undefined,
    }));
  }

  return notifications;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  try {
    // Update the notification as read
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .in("hotel_id", hotelIds)
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        created_at
      `)
      .single();

    if (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read: " + error.message);
    }

    // Return the updated notification
    return {
      id: data.id,
      title: data.title || "إشعار",
      message: data.message || "لديك إشعار جديد",
      type: data.type || "info",
      read: data.is_read || true,
      createdAt: data.created_at || new Date().toISOString(),
      actionUrl: undefined,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read: " + (error as Error).message);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  try {
    // Update all notifications as read for the user's hotels
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("hotel_id", hotelIds);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark all notifications as read: " + error.message);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read: " + (error as Error).message);
  }
}

// Function to create a new notification (to be used internally by other server actions)
export async function createNotification(
  hotelId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  actionUrl?: string
): Promise<Notification> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Verify user has access to this hotel
  const { data: hotelData, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("id", hotelId)
    .eq("owner_id", user.id)
    .single();

  if (hotelError || !hotelData) {
    throw new Error("Unauthorized to create notification for this hotel");
  }

  try {
    // Insert the notification
    const { data, error } = await supabase
      .from("notifications")
      .insert([{
        hotel_id: hotelId,
        title,
        message,
        type,
        data: actionUrl ? { action_url: actionUrl } : {}
      }])
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        created_at
      `)
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification: " + error.message);
    }

    // Return the created notification
    return {
      id: data.id,
      title: data.title || "إشعار",
      message: data.message || "لديك إشعار جديد",
      type: data.type || "info",
      read: data.is_read || false,
      createdAt: data.created_at || new Date().toISOString(),
      actionUrl: actionUrl,
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification: " + (error as Error).message);
  }
}