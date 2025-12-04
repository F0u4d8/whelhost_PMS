import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { BookingForm } from "@/components/dashboard/booking-form"
import type { Unit, Guest, Booking } from "@/lib/types"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id, currency").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  // Get booking details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      *,
      unit:units(name),
      guest:guests(first_name, last_name, email, phone)
    `)
    .eq("id", id)
    .eq("hotel_id", hotel.id)
    .single() as { data: (Booking & { unit?: { name: string }, guest?: { first_name: string, last_name: string, email: string, phone: string } }) | null, error: any }

  if (bookingError || !booking) {
    notFound()
  }

  // Get available units for the hotel
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("*, room_type:room_types(name, base_price)")
    .eq("hotel_id", hotel.id)
    .neq("status", "maintenance") // Exclude units under maintenance

  if (unitsError) {
    console.error("Error fetching units:", unitsError)
    redirect("/dashboard/units")
  }

  // Get all guests for the hotel
  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("*")
    .eq("hotel_id", hotel.id)

  if (guestsError) {
    console.error("Error fetching guests:", guestsError)
    redirect("/dashboard/guests")
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Booking</h1>
        <p className="text-muted-foreground">
          Update booking for {booking.guest?.first_name} {booking.guest?.last_name}
        </p>
      </div>
      <BookingForm
        hotelId={hotel.id}
        currency={hotel.currency}
        units={units || []}
        guests={guests || []}
        booking={booking}
      />
    </div>
  )
}