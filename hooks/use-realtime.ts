"use client"

import { useEffect, useState, useCallback } from "react"

interface RealtimeEvent {
  type: string
  data: Record<string, unknown>
}

export function useRealtime(onEvent?: (event: RealtimeEvent) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)

  useEffect(() => {
    const eventSource = new EventSource("/api/sse/events")

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent
        setLastEvent(data)
        onEvent?.(data)
      } catch (error) {
        console.error("Failed to parse SSE event:", error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      // EventSource will auto-reconnect
    }

    return () => {
      eventSource.close()
    }
  }, [onEvent])

  return { isConnected, lastEvent }
}

// Hook to refresh data when relevant events occur
export function useRealtimeRefresh(refreshFn: () => void, eventTypes: string[]) {
  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      if (eventTypes.includes(event.type)) {
        refreshFn()
      }
    },
    [refreshFn, eventTypes],
  )

  return useRealtime(handleEvent)
}
