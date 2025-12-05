"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Search, Send, Phone, Mail, Calendar, CheckCircle, Clock, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/main-layout"
import { Conversation, Message } from "@/lib/messaging-server-actions"
import { getMessages as getMessagesAction, sendMessage as sendMessageAction, markConversationAsRead as markConversationAsReadAction } from "@/lib/messaging-server-actions"
import { toast } from "sonner"

interface MessagingClientProps {
  initialConversations: Conversation[];
}

export default function MessagingClient({ initialConversations }: MessagingClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversations[0]?.id || null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredConversations = conversations.filter(
    (c) => c.guestName.includes(search) || c.lastMessage.includes(search),
  )

  const selectedConvo = conversations.find((c) => c.id === selectedConversation);

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const loadedMessages = await getMessagesAction(conversationId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("حدث خطأ أثناء تحميل الرسائل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setSelectedConversation(id);
    await loadMessages(id);
    await markConversationAsReadAction(id);
    
    // Update the conversation in the state to reflect that messages are now read
    setConversations(convos => convos.map(convo => 
      convo.id === id ? { ...convo, unreadCount: 0 } : convo
    ));
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !selectedConvo) return;

    try {
      setIsLoading(true);

      // Send the message to the backend
      const sentMessage = await sendMessageAction(newMessage, selectedConvo.guestId);

      // Update the local state
      setMessages(prev => [...prev, sentMessage]);
      
      // Update the conversation's last message
      setConversations(prev => prev.map(convo => 
        convo.id === selectedConversation 
          ? { ...convo, lastMessage: newMessage, lastMessageTime: new Date().toISOString() } 
          : convo
      ));

      setNewMessage("");
      toast.success("تم إرسال الرسالة");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsLoading(false);
    }
  }

  const channelIcons: Record<string, { icon: typeof MessageSquare; color: string; label: string }> = {
    direct: { icon: MessageSquare, color: "text-primary", label: "مباشر" },
    booking: { icon: Calendar, color: "text-blue-500", label: "Booking" },
    airbnb: { icon: Calendar, color: "text-rose-500", label: "Airbnb" },
    whatsapp: { icon: Phone, color: "text-green-500", label: "واتساب" },
    email: { icon: Mail, color: "text-orange-500", label: "بريد" },
  }

  const statusIcons: Record<string, { icon: typeof Circle; color: string }> = {
    open: { icon: Circle, color: "text-primary fill-primary" },
    pending: { icon: Clock, color: "text-warning" },
    resolved: { icon: CheckCircle, color: "text-success" },
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Conversations List */}
        <Card className="w-80 flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">صندوق الرسائل</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pr-10" 
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-2 space-y-1">
              {filteredConversations.map((convo) => {
                const channel = channelIcons[convo.channel]
                const status = statusIcons[convo.status]
                const ChannelIcon = channel.icon
                const StatusIcon = status.icon

                return (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo.id)}
                    className={cn(
                      "w-full p-3 rounded-xl text-right transition-colors",
                      selectedConversation === convo.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-foreground">{convo.guestName.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{convo.guestName}</span>
                          <div className="flex items-center gap-1">
                            {convo.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {convo.unreadCount}
                              </Badge>
                            )}
                            <StatusIcon className={cn("w-3 h-3", status.color)} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{convo.lastMessage}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <ChannelIcon className={cn("w-3 h-3", channel.color)} />
                            <span className="text-xs text-muted-foreground">{channel.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(convo.lastMessageTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">{selectedConvo.guestName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConvo.guestName}</h3>
                    {selectedConvo.reservationId && (
                      <p className="text-sm text-muted-foreground">حجز: {selectedConvo.reservationId}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    selectedConvo.status === "open"
                      ? "default"
                      : selectedConvo.status === "pending"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {selectedConvo.status === "open" ? "مفتوح" : selectedConvo.status === "pending" ? "معلق" : "محلول"}
                </Badge>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {isLoading && !messages.length && (
                    <div className="text-center text-muted-foreground">جارٍ تحميل الرسائل...</div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.sender === "staff" ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          msg.sender === "staff"
                            ? "bg-secondary text-foreground rounded-br-sm"
                            : "bg-primary text-primary-foreground rounded-bl-sm",
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.sender === "staff" ? "text-muted-foreground" : "text-primary-foreground/70",
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!isLoading && messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      لا توجد رسائل في هذه المحادثة
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب رسالتك..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[44px] max-h-32 resize-none"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    className="h-11 w-11" 
                    disabled={isLoading || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>اختر محادثة للبدء</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  )
}