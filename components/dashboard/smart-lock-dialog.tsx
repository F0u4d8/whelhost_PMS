"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { SmartLock, Unit } from "@/lib/types"

interface SmartLockDialogProps {
  hotelId: string
  units: Pick<Unit, "id" | "name">[]
  smartLock?: SmartLock
  trigger?: React.ReactNode
}

export function SmartLockDialog({ hotelId, units, smartLock, trigger }: SmartLockDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: smartLock?.name || "",
    device_id: smartLock?.device_id || "",
    unit_id: smartLock?.unit_id || "",
    status: smartLock?.status || "online",
    battery_level: smartLock?.battery_level?.toString() || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const data = {
      hotel_id: hotelId,
      name: formData.name,
      device_id: formData.device_id,
      unit_id: formData.unit_id || null,
      status: formData.status,
      battery_level: formData.battery_level ? Number.parseInt(formData.battery_level) : null,
    }

    if (smartLock) {
      await supabase.from("smart_locks").update(data).eq("id", smartLock.id)
    } else {
      await supabase.from("smart_locks").insert(data)
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
            Add Smart Lock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{smartLock ? "Edit Smart Lock" : "Add Smart Lock"}</DialogTitle>
          <DialogDescription>
            {smartLock ? "Update device configuration" : "Register a new smart lock device"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name *</Label>
            <Input
              id="name"
              placeholder="Room 101 Lock"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device_id">Device ID *</Label>
            <Input
              id="device_id"
              placeholder="LOCK-001-ABC"
              value={formData.device_id}
              onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Assign to Unit</Label>
            <Select value={formData.unit_id} onValueChange={(value) => setFormData({ ...formData, unit_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="low_battery">Low Battery</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="battery">Battery Level (%)</Label>
              <Input
                id="battery"
                type="number"
                min="0"
                max="100"
                value={formData.battery_level}
                onChange={(e) => setFormData({ ...formData, battery_level: e.target.value })}
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
              ) : smartLock ? (
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
