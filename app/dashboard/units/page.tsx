import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UnitsPageClient from './units-client'

export default async function UnitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <UnitsPageClient />
}