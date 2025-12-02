import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { TaskList } from "@/components/dashboard/task-list"
import { TaskDialog } from "@/components/dashboard/task-dialog"

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user.id).single()

  if (!hotel) redirect("/dashboard")

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(full_name, email),
      unit:units(name)
    `)
    .eq("hotel_id", hotel.id)
    .order("created_at", { ascending: false })

  const { data: units } = await supabase.from("units").select("id, name").eq("hotel_id", hotel.id)

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || []
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress") || []
  const completedTasks = tasks?.filter((t) => t.status === "completed") || []
  const urgentTasks = tasks?.filter((t) => t.priority === "urgent" && t.status !== "completed") || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track staff assignments</p>
        </div>
        <TaskDialog hotelId={hotel.id} userId={user.id} units={units || []} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-warning/10 p-2">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressTasks.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-success/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{urgentTasks.length}</p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <TaskList tasks={tasks || []} hotelId={hotel.id} userId={user.id} units={units || []} />
    </div>
  )
}
