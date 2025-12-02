'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Clock, Calendar, Users, DollarSign, AlertCircle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const router = useRouter();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <Users className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'booking':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'task':
        return 'bg-secondary/10 text-secondary-foreground border-secondary';
      case 'payment':
        return 'bg-purple/10 text-purple-600 border-purple/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleNotificationClick = () => {
    // Mark as read and navigate based on notification type
    onMarkAsRead(notification.id);
    
    // Example navigation based on notification type
    if (notification.data) {
      const { booking_id, task_id, invoice_id } = notification.data as any;
      
      if (booking_id) {
        router.push(`/dashboard/bookings/${booking_id}`);
      } else if (task_id) {
        router.push(`/dashboard/tasks`);
      } else if (invoice_id) {
        router.push(`/dashboard/invoices`);
      }
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
        !notification.is_read ? 'bg-accent' : ''
      }`}
      onClick={handleNotificationClick}
    >
      <div className={`mt-0.5 rounded-full p-1 ${getNotificationColor(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>
      {!notification.is_read && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    
    // Update notification as read in the database
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => prev - 1);
    }
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    
    // Get the current user's hotel ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: hotel } = await supabase
      .from("hotels")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!hotel) return;

    // Mark all notifications as read
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("hotel_id", hotel.id)
      .eq("is_read", false);

    if (!error) {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to fetch new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[60vh] overflow-y-auto p-0">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </p>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-1">
                  <NotificationItem 
                    notification={notification} 
                    onMarkAsRead={markAsRead} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}