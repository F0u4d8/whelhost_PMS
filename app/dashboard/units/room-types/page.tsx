import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RoomTypeDialog } from "@/components/dashboard/room-type-dialog"

export default async function RoomTypesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id, currency").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: roomTypes } = await supabase.from("room_types").select("*").eq("hotel_id", hotel.id).order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Types</h1>
          <p className="text-muted-foreground">Manage your room categories and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/units">Back to Units</Link>
          </Button>
          <RoomTypeDialog hotelId={hotel.id} currency={hotel.currency} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Room Types</CardTitle>
          <CardDescription>{roomTypes?.length || 0} room types configured</CardDescription>
        </CardHeader>
        <CardContent>
          {!roomTypes || roomTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold">No room types yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">Create room types to categorize your units</p>
              <RoomTypeDialog hotelId={hotel.id} currency={hotel.currency} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Max Occupancy</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{type.description || "-"}</TableCell>
                    <TableCell>
                      {type.base_price} {hotel.currency}
                    </TableCell>
                    <TableCell>{type.max_occupancy} guests</TableCell>
                    <TableCell>
                      <RoomTypeDialog
                        hotelId={hotel.id}
                        currency={hotel.currency}
                        roomType={type}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
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
