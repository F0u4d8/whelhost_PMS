import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { InvoiceForm } from "@/components/dashboard/invoice-form"

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id, currency").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const [guestsResult, bookingsResult] = await Promise.all([
    supabase.from("guests").select("*").eq("hotel_id", hotel.id).order("first_name"),
    supabase
      .from("bookings")
      .select("*, guest:guests(first_name, last_name)")
      .eq("hotel_id", hotel.id)
      .neq("status", "cancelled"),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">Generate a new invoice for a guest or booking</p>
      </div>
      <InvoiceForm
        hotelId={hotel.id}
        currency={hotel.currency}
        guests={guestsResult.data || []}
        bookings={bookingsResult.data || []}
      />
    </div>
  )
}
