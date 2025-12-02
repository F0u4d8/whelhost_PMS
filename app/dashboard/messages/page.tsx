import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesView } from "@/components/dashboard/messages-view"

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email),
      booking:bookings(id, check_in, check_out, guest:guests(first_name, last_name))
    `)
    .eq("hotel_id", hotel.id)
    .order("created_at", { ascending: false })

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up"}
          </p>
        </div>
      </div>
      <MessagesView messages={messages || []} hotelId={hotel.id} userId={user.id} />
    </div>
  )
}
