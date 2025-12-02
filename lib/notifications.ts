import { createClient } from "@/lib/supabase/server";

// Types for notification data
interface NotificationData {
  booking_id?: string;
  task_id?: string;
  invoice_id?: string;
  guest_id?: string;
  unit_id?: string;
  [key: string]: any;
}

interface CreateNotificationParams {
  hotelId: string;
  userId?: string | null;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "booking" | "task" | "payment" | "system";
  data?: NotificationData | null;
}

/**
 * Create a new notification
 */
export async function createNotification({
  hotelId,
  userId = null,
  title,
  message,
  type,
  data = null
}: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .insert({
        hotel_id: hotelId,
        user_id: userId,
        title,
        message,
        type,
        data: data || null
      });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get notifications for a hotel
 */
export async function getNotifications(hotelId: string, limit = 20) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return { notifications: [], error: error.message };
    }

    return { notifications: data, error: null };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], error: (error as Error).message };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Mark all notifications for a hotel as read
 */
export async function markAllNotificationsAsRead(hotelId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("hotel_id", hotelId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get unread notification count for a hotel
 */
export async function getUnreadNotificationCount(hotelId: string) {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("hotel_id", hotelId)
      .eq("is_read", false);

    if (error) {
      console.error("Error counting unread notifications:", error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return { count: 0, error: (error as Error).message };
  }
}

// Predefined notification types
export const NotificationService = {
  /**
   * Create a booking notification (new booking, check-in, check-out, etc.)
   */
  createBookingNotification: async (hotelId: string, bookingId: string, action: string, guestName?: string) => {
    let title = "";
    let message = "";
    
    switch (action) {
      case "created":
        title = "New Booking Created";
        message = guestName ? `New booking for ${guestName} has been created.` : "A new booking has been created";
        break;
      case "confirmed":
        title = "Booking Confirmed";
        message = guestName ? `Booking for ${guestName} has been confirmed.` : "A booking has been confirmed";
        break;
      case "checked_in":
        title = "Guest Checked In";
        message = guestName ? `${guestName} has checked in.` : "A guest has checked in";
        break;
      case "checked_out":
        title = "Guest Checked Out";
        message = guestName ? `${guestName} has checked out.` : "A guest has checked out";
        break;
      case "cancelled":
        title = "Booking Cancelled";
        message = guestName ? `Booking for ${guestName} has been cancelled.` : "A booking has been cancelled";
        break;
      default:
        title = "Booking Update";
        message = `Booking status changed to "${action}".`;
    }
    
    return createNotification({
      hotelId,
      title,
      message,
      type: "booking",
      data: { booking_id: bookingId, guest_name: guestName }
    });
  },

  /**
   * Create a task notification
   */
  createTaskNotification: async (hotelId: string, taskId: string, title: string, message: string, priority: string) => {
    return createNotification({
      hotelId,
      title,
      message,
      type: priority === "urgent" ? "error" : "task",
      data: { task_id: taskId, priority }
    });
  },

  /**
   * Create a payment notification
   */
  createPaymentNotification: async (hotelId: string, invoiceId: string, amount: number, currency: string, status: string) => {
    let title = "";
    let message = "";
    
    switch (status) {
      case "completed":
        title = "Payment Received";
        message = `Payment of ${amount} ${currency} has been received.`;
        break;
      case "failed":
        title = "Payment Failed";
        message = `Payment of ${amount} ${currency} has failed.`;
        break;
      case "refunded":
        title = "Payment Refunded";
        message = `Payment of ${amount} ${currency} has been refunded.`;
        break;
      default:
        title = "Payment Update";
        message = `Payment status changed to "${status}".`;
    }
    
    return createNotification({
      hotelId,
      title,
      message,
      type: "payment",
      data: { invoice_id: invoiceId }
    });
  },

  /**
   * Create a system notification
   */
  createSystemNotification: async (hotelId: string, title: string, message: string) => {
    return createNotification({
      hotelId,
      title,
      message,
      type: "system"
    });
  }
};