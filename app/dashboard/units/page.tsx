import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, BedDouble, MoreVertical, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteUnitButton } from "@/components/dashboard/delete-unit-button"
import { UnitVisibilityToggle } from "@/components/dashboard/unit-visibility-toggle"

const statusColors = {
  available: "bg-success/10 text-success border-success/20",
  occupied: "bg-primary/10 text-primary border-primary/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  blocked: "bg-destructive/10 text-destructive border-destructive/20",
}

export default async function UnitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: units } = await supabase
    .from("units")
    .select(`
      *,
      room_type:room_types(name, base_price)
    `)
    .eq("hotel_id", hotel.id)
    .order("name")

  const { data: roomTypes } = await supabase.from("room_types").select("*").eq("hotel_id", hotel.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Units</h1>
          <p className="text-muted-foreground">Manage your hotel rooms and units</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/units/room-types">Manage Room Types</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/units/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {["available", "occupied", "maintenance", "blocked"].map((status) => {
          const count = units?.filter((u) => u.status === status).length || 0
          return (
            <Card key={status}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-full p-2 ${statusColors[status as keyof typeof statusColors]}`}>
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm capitalize text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Units</CardTitle>
          <CardDescription>{units?.length || 0} total units in your hotel</CardDescription>
        </CardHeader>
        <CardContent>
          {!units || units.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BedDouble className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No units yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">Add your first room or unit to get started</p>
              <Button asChild>
                <Link href="/dashboard/units/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.room_type?.name || "-"}</TableCell>
                    <TableCell>{unit.floor || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[unit.status as keyof typeof statusColors]}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UnitVisibilityToggle
                        unitId={unit.id}
                        currentVisibility={Boolean(unit.is_visible)}
                      />
                    </TableCell>
                    <TableCell>{unit.room_type?.base_price ? `${unit.room_type.base_price} SAR` : "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/units/${unit.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DeleteUnitButton unitId={unit.id} unitName={unit.name} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
