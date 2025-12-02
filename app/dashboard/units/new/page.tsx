import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UnitForm } from "@/components/dashboard/unit-form"

export default async function NewUnitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: roomTypes } = await supabase.from("room_types").select("*").eq("hotel_id", hotel.id)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Unit</h1>
        <p className="text-muted-foreground">Create a new room or unit in your hotel</p>
      </div>
      <UnitForm hotelId={hotel.id} roomTypes={roomTypes || []} />
    </div>
  )
}
