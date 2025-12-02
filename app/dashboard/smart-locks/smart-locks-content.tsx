'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Wifi, WifiOff, Battery, BatteryLow, MoreVertical, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SmartLockDialog } from "@/components/dashboard/smart-lock-dialog"
import type { SmartLock, Unit, Hotel } from "@/lib/types"

const statusConfig = {
  online: { color: "bg-success/10 text-success", icon: Wifi, label: "Online" },
  offline: { color: "bg-muted text-muted-foreground", icon: WifiOff, label: "Offline" },
  low_battery: { color: "bg-warning/10 text-warning", icon: BatteryLow, label: "Low Battery" },
  error: { color: "bg-destructive/10 text-destructive", icon: WifiOff, label: "Error" },
}

interface SmartLocksContentProps {
  hotel: {
    id: string;
  };
  smartLocks: (SmartLock & { unit: { name: string } | null })[] | null;
  units: Pick<Unit, "id" | "name">[] | null;
  onlineLocks: number;
  offlineLocks: number;
}

export function SmartLocksContent({ hotel, smartLocks, units, onlineLocks, offlineLocks }: SmartLocksContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Locks</h1>
          <p className="text-muted-foreground">Manage smart lock devices and access codes</p>
        </div>
        <SmartLockDialog hotelId={hotel.id} units={units || []} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-success/10 p-2">
              <Wifi className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onlineLocks}</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-muted p-2">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offlineLocks}</p>
              <p className="text-sm text-muted-foreground">Offline/Issues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Locks Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!smartLocks || smartLocks.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No smart locks</h3>
              <p className="mb-4 text-sm text-muted-foreground">Add smart locks to manage contactless access</p>
              <SmartLockDialog hotelId={hotel.id} units={units || []} />
            </CardContent>
          </Card>
        ) : (
          smartLocks.map((lock) => {
            const config = statusConfig[lock.status as keyof typeof statusConfig]
            const StatusIcon = config.icon
            return (
              <Card key={lock.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{lock.name}</CardTitle>
                      <CardDescription>{lock.unit?.name || "Unassigned"}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <SmartLockDialog
                        hotelId={hotel.id}
                        units={units || []}
                        smartLock={lock}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${config.color.split(" ")[1]}`} />
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    {lock.battery_level !== null && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Battery className="h-4 w-4" />
                        {lock.battery_level}%
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Device ID: {lock.device_id}</p>
                  {lock.last_activity && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last activity: {new Date(lock.last_activity).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}