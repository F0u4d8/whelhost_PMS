import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// POST /api/v1/integrations/channex/connect
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { hotel_id, api_key, property_id } = body

  // Verify hotel ownership
  const { data: hotel } = await supabase.from("hotels").select("id").eq("id", hotel_id).eq("owner_id", user.id).single()

  if (!hotel) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Generate webhook secret
  const webhookSecret = crypto.randomBytes(32).toString("hex")

  // Create or update channel integration
  const { data: channel, error } = await supabase
    .from("channels")
    .upsert(
      {
        hotel_id,
        name: "Channex",
        type: "channex",
        is_active: true,
        commission_rate: 0,
        api_key,
        property_id,
        webhook_secret: webhookSecret,
        settings: {
          connected_at: new Date().toISOString(),
          sync_rates: true,
          sync_availability: true,
          receive_bookings: true,
        },
      },
      {
        onConflict: "hotel_id,type",
      },
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // In production, register webhook with Channex API
  // const channexApi = new ChannexAPI(api_key)
  // await channexApi.registerWebhook({
  //   url: `${process.env.NEXT_PUBLIC_APP_URL}/webhooks/channex/booking`,
  //   events: ['booking.created', 'booking.modified', 'booking.cancelled'],
  //   secret: webhookSecret
  // })

  return NextResponse.json({
    data: channel,
    webhook_url: `/webhooks/channex/booking`,
    webhook_secret: webhookSecret,
    message: "Channex integration connected successfully",
  })
}
