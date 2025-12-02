"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus } from "lucide-react"
import type { RoomType } from "@/lib/types"

interface RoomTypeDialogProps {
  hotelId: string
  currency: string
  roomType?: RoomType
  trigger?: React.ReactNode
}

export function RoomTypeDialog({ hotelId, currency, roomType, trigger }: RoomTypeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: roomType?.name || "",
    description: roomType?.description || "",
    base_price: roomType?.base_price?.toString() || "",
    max_occupancy: roomType?.max_occupancy?.toString() || "2",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const data = {
      hotel_id: hotelId,
      name: formData.name,
      description: formData.description || null,
      base_price: Number.parseFloat(formData.base_price),
      max_occupancy: Number.parseInt(formData.max_occupancy),
    }

    if (roomType) {
      await supabase.from("room_types").update(data).eq("id", roomType.id)
    } else {
      await supabase.from("room_types").insert(data)
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Room Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{roomType ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
          <DialogDescription>{roomType ? "Update room type details" : "Create a new room category"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Deluxe Room"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A spacious room with..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price ({currency}/night) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="250.00"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_occupancy">Max Occupancy</Label>
              <Input
                id="max_occupancy"
                type="number"
                min="1"
                value={formData.max_occupancy}
                onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : roomType ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
