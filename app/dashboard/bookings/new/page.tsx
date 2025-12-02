import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BookingForm } from "@/components/dashboard/booking-form"

export default async function NewBookingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id, currency").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const [unitsResult, guestsResult] = await Promise.all([
    supabase.from("units").select("*, room_type:room_types(name, base_price)").eq("hotel_id", hotel.id),
    supabase.from("guests").select("*").eq("hotel_id", hotel.id).order("first_name"),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Booking</h1>
        <p className="text-muted-foreground">Create a new reservation</p>
      </div>
      <BookingForm
        hotelId={hotel.id}
        currency={hotel.currency}
        units={unitsResult.data || []}
        guests={guestsResult.data || []}
      />
    </div>
  )
}
