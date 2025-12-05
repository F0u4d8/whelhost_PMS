import { cn } from "@/lib/utils"
import { CreditCard, LogIn, LogOut, CalendarPlus } from "lucide-react"

interface Activity {
  id: string
  type: "payment" | "check-in" | "check-out" | "booking"
  title: string
  description: string
  time: string
}

const activityIcons = {
  payment: CreditCard,
  "check-in": LogIn,
  "check-out": LogOut,
  booking: CalendarPlus,
}

const activityColors = {
  payment: "bg-success/20 text-success",
  "check-in": "bg-primary/20 text-primary",
  "check-out": "bg-warning/20 text-warning",
  booking: "bg-chart-5/20 text-chart-5",
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type]
        return (
          <div key={activity.id} className="flex gap-4">
            <div className="relative">
              <div
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activityColors[activity.type])}
              >
                <Icon className="w-5 h-5" />
              </div>
              {index < activities.length - 1 && <div className="absolute top-12 right-1/2 w-px h-8 bg-border" />}
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
