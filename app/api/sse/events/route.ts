import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

// GET /api/sse/events - Server-Sent Events for real-time updates
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get user's hotel IDs for filtering events
  const { data: hotels } = await supabase.from("hotels").select("id").eq("owner_id", user.id)

  const hotelIds = hotels?.map((h) => h.id) || []

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", hotelIds })}\n\n`))

      // Set up Supabase realtime subscription
      const channel = supabase
        .channel("pms-events")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookings",
            filter: hotelIds.length > 0 ? `hotel_id=in.(${hotelIds.join(",")})` : undefined,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "booking.created",
                  data: payload.new,
                })}\n\n`,
              ),
            )
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookings",
            filter: hotelIds.length > 0 ? `hotel_id=in.(${hotelIds.join(",")})` : undefined,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "booking.updated",
                  data: payload.new,
                })}\n\n`,
              ),
            )
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: hotelIds.length > 0 ? `hotel_id=in.(${hotelIds.join(",")})` : undefined,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "message.received",
                  data: payload.new,
                })}\n\n`,
              ),
            )
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: hotelIds.length > 0 ? `hotel_id=in.(${hotelIds.join(",")})` : undefined,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: `task.${payload.eventType.toLowerCase()}`,
                  data: payload.new,
                })}\n\n`,
              ),
            )
          },
        )
        .subscribe()

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          clearInterval(pingInterval)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval)
        supabase.removeChannel(channel)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
