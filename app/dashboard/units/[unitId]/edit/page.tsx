import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UnitForm } from "@/components/dashboard/unit-form"
import type { Unit } from "@/lib/types"

interface Props {
  params: {
    unitId: string
  }
}

export default async function EditUnitPage({ params }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  // Get the unit data
  const { data: unit } = await supabase
    .from("units")
    .select("*")
    .eq("id", params.unitId)
    .eq("hotel_id", hotel.id)
    .single() as { data: Unit | null }

  if (!unit) {
    redirect("/dashboard/units")
  }

  // Get available room types for the hotel
  const { data: roomTypes } = await supabase.from("room_types").select("*").eq("hotel_id", hotel.id)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Unit</h1>
        <p className="text-muted-foreground">Update information for {unit.name}</p>
      </div>
      <UnitForm hotelId={hotel.id} roomTypes={roomTypes || []} unit={unit} />
    </div>
  )
}