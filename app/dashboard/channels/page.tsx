import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Building, Briefcase } from "lucide-react"
import { ChannelDialog } from "@/components/dashboard/channel-dialog"

const channelIcons = {
  ota: Globe,
  direct: Building,
  corporate: Briefcase,
  other: Globe,
}

export default async function ChannelsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: channels } = await supabase.from("channels").select("*").eq("hotel_id", hotel.id).order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channels</h1>
          <p className="text-muted-foreground">Manage your booking channels and integrations</p>
        </div>
        <ChannelDialog hotelId={hotel.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!channels || channels.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No channels configured</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add your first booking channel to track reservations by source
              </p>
              <ChannelDialog hotelId={hotel.id} />
            </CardContent>
          </Card>
        ) : (
          channels.map((channel) => {
            const Icon = channelIcons[channel.type as keyof typeof channelIcons]
            return (
              <Card key={channel.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                      <CardDescription className="capitalize">{channel.type}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={channel.is_active ? "default" : "secondary"}>
                    {channel.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commission Rate</span>
                    <span className="font-medium">{channel.commission_rate}%</span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ChannelDialog
                      hotelId={hotel.id}
                      channel={channel}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
