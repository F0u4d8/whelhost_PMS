"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification, getNotifications, markNotificationAsRead } from "@/lib/notifications-server-actions";
import { toast } from "sonner";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const notificationData = await getNotifications();
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("حدث خطأ أثناء تحميل الإشعارات");
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        // Update the notification status locally
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("حدث خطأ أثناء قراءة الإشعار");
      }
    }

    // Navigate to the action URL if exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
          disabled={isLoading}
        >
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[0.6rem]"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="sr-only">الإشعارات</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-2">
          <h3 className="font-semibold text-foreground text-center">الإشعارات</h3>
          
          {notifications.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    !notification.read 
                      ? "bg-accent hover:bg-accent/80" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}