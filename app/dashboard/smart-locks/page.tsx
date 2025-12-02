import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Wifi, WifiOff, Battery, BatteryLow, MoreVertical, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SmartLocksContent } from "./smart-locks-content"

export default async function SmartLocksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: smartLocks } = await supabase
    .from("smart_locks")
    .select(`
      *,
      unit:units(name)
    `)
    .eq("hotel_id", hotel.id)
    .order("name")

  const { data: units } = await supabase.from("units").select("id, name").eq("hotel_id", hotel.id)

  const onlineLocks = smartLocks?.filter((l) => l.status === "online").length || 0
  const offlineLocks = smartLocks?.filter((l) => l.status !== "online").length || 0

  return (
    <SmartLocksContent hotel={hotel} smartLocks={smartLocks} units={units} onlineLocks={onlineLocks} offlineLocks={offlineLocks} />
  )
}
