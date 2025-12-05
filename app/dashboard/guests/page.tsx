import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GuestsPageClient from './guests-client'

export default async function GuestsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <GuestsPageClient />
}
