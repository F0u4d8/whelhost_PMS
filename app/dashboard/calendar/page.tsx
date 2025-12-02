import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarView } from "@/components/dashboard/calendar-view"

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const [unitsResult, bookingsResult] = await Promise.all([
    supabase.from("units").select("*, room_type:room_types(name)").eq("hotel_id", hotel.id).order("name"),
    supabase.from("bookings").select("*, guest:guests(first_name, last_name)").eq("hotel_id", hotel.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage bookings on the calendar</p>
      </div>
      <CalendarView units={unitsResult.data || []} bookings={bookingsResult.data || []} />
    </div>
  )
}
