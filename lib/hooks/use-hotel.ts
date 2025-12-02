"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Hotel } from "@/lib/types"
import { useUser } from "./use-user"

export function useHotel() {
  const { user } = useUser()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHotel(null)
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function getHotel() {
      const { data } = await supabase.from("hotels").select("*").eq("owner_id", user!.id).single()

      setHotel(data)
      setLoading(false)
    }

    getHotel()
  }, [user])

  return { hotel, loading, setHotel }
}
