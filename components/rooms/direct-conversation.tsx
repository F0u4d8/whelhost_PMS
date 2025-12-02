"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Profile } from "@/lib/types";

interface DirectConversationProps {
  roomId: string;
  hotelId: string;
  currentUserId: string | null;
  ownerProfile: Profile | null;
}

interface DirectMessage extends Message {
  sender: Profile | null;
  recipient: Profile | null;
}

export function DirectConversation({ roomId, hotelId, currentUserId, ownerProfile }: DirectConversationProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUserId) return;
      
      setLoading(true);
      const supabase = createClient();
      
      // Fetch messages between current user and owner
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, email, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(full_name, email, avatar_url)
        `)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId})`)
        .eq("hotel_id", hotelId)
        .eq("booking_id", null) // Exclude booking-related messages
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as DirectMessage[]);
      }
      
      setLoading(false);
    };

    loadMessages();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `hotel_id=eq.${hotelId},booking_id=is.null,and(or(sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as DirectMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, hotelId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !ownerProfile) return;
    
    setSending(true);
    
    try {
      const supabase = createClient();
      
      // Insert message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          hotel_id: hotelId,
          sender_id: currentUserId,
          recipient_id: ownerProfile.id,
          content: newMessage,
          message_type: "guest",
          is_read: false,
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, email, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setMessages((prev) => [...prev, data as DirectMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={ownerProfile?.avatar_url || ""} alt={ownerProfile?.full_name || "Owner"} />
          <AvatarFallback>
            {ownerProfile?.full_name?.charAt(0)?.toUpperCase() || "O"}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">
            {ownerProfile?.full_name || "Property Owner"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Direct message
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send your first message to start the conversation
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === currentUserId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim() || !currentUserId}
              className="h-auto self-end px-4 py-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}