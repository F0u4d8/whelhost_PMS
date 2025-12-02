"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Plus, Mail, MailOpen, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message, Profile, Booking, Guest } from "@/lib/types"

interface MessagesViewProps {
  messages: (Message & {
    sender?: Pick<Profile, "full_name" | "email"> | null
    booking?:
      | (Pick<Booking, "id" | "check_in" | "check_out"> & { guest?: Pick<Guest, "first_name" | "last_name"> | null })
      | null
  })[]
  hotelId: string
  userId: string
}

export function MessagesView({ messages, hotelId, userId }: MessagesViewProps) {
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<(typeof messages)[0] | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
  })

  const handleSelectMessage = async (message: (typeof messages)[0]) => {
    setSelectedMessage(message)

    if (!message.is_read) {
      const supabase = createClient()
      await supabase.from("messages").update({ is_read: true }).eq("id", message.id)
      router.refresh()
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) return
    setLoading(true)

    const supabase = createClient()
    await supabase.from("messages").insert({
      hotel_id: hotelId,
      sender_id: userId,
      subject: newMessage.subject || null,
      content: newMessage.content,
      message_type: "internal",
    })

    setLoading(false)
    setComposeOpen(false)
    setNewMessage({ subject: "", content: "" })
    router.refresh()
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return d.toLocaleDateString("en-US", { weekday: "short" })
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Message List */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Inbox</CardTitle>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Send a message to your team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
                <Textarea
                  placeholder="Write your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={5}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm text-muted-foreground">Your inbox is empty</p>
              </div>
            ) : (
              messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={cn(
                    "w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors",
                    selectedMessage?.id === message.id && "bg-muted",
                    !message.is_read && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {message.is_read ? (
                      <MailOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", !message.is_read && "font-semibold")}>
                          {message.sender?.full_name || message.sender?.email || "System"}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "truncate text-sm",
                          !message.is_read ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {message.subject || "No subject"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground mt-1">{message.content}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Detail */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedMessage.subject || "No subject"}</h2>
                  <p className="text-sm text-muted-foreground">
                    From: {selectedMessage.sender?.full_name || selectedMessage.sender?.email || "System"}
                  </p>
                </div>
                <Badge variant="outline">{selectedMessage.message_type}</Badge>
              </div>
              <Separator />
              {selectedMessage.booking && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Related Booking</p>
                  <p className="text-muted-foreground">
                    {selectedMessage.booking.guest?.first_name} {selectedMessage.booking.guest?.last_name} -{" "}
                    {new Date(selectedMessage.booking.check_in).toLocaleDateString()} to{" "}
                    {new Date(selectedMessage.booking.check_out).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(selectedMessage.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Select a message</p>
              <p className="text-sm text-muted-foreground">Choose a message from the list to view its content</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
