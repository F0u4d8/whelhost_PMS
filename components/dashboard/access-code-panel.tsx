"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Copy, Check, Plus } from "lucide-react"
import type { AccessCode } from "@/lib/types"

interface AccessCodePanelProps {
  bookingId: string
  accessCodes: AccessCode[]
  checkIn: string
  checkOut: string
}

export function AccessCodePanel({ bookingId, accessCodes, checkIn, checkOut }: AccessCodePanelProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/generate-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pin",
          valid_from: checkIn,
          valid_to: checkOut,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to generate access code")
      }

      router.refresh()
    } catch (error) {
      console.error("Generate access error:", error)
      alert((error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeCode = accessCodes.find((c) => c.is_active)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Room Access
        </CardTitle>
        <CardDescription>Smart lock access codes for this booking</CardDescription>
      </CardHeader>
      <CardContent>
        {activeCode ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Access Code</p>
                  <p className="font-mono text-2xl font-bold tracking-wider">{activeCode.code}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(activeCode.code, activeCode.id)}>
                  {copiedId === activeCode.id ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Valid from: {new Date(activeCode.valid_from).toLocaleDateString()}</span>
                <span>Until: {new Date(activeCode.valid_until).toLocaleDateString()}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate New Code
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 rounded-full bg-muted p-4 mx-auto w-fit">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-4 text-muted-foreground">No access code generated yet</p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Access Code"}
            </Button>
          </div>
        )}

        {accessCodes.length > 1 && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-sm font-medium">Code History</p>
            <div className="space-y-2">
              {accessCodes
                .filter((c) => !c.is_active)
                .slice(0, 5)
                .map((code) => (
                  <div key={code.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{code.code}</span>
                    <Badge variant="secondary">Expired</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
