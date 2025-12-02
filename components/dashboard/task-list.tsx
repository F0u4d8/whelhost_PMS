"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreVertical, Pencil, Trash2, BedDouble, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, Profile, Unit } from "@/lib/types"
import { TaskDialog } from "./task-dialog"

interface TaskListProps {
  tasks: (Task & { assignee?: Pick<Profile, "full_name" | "email"> | null; unit?: Pick<Unit, "name"> | null })[]
  hotelId: string
  userId: string
  units: Pick<Unit, "id" | "name">[]
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
}

const statusColors = {
  pending: "bg-warning/10 text-warning",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
}

export function TaskList({ tasks, hotelId, userId, units }: TaskListProps) {
  const router = useRouter()

  const handleStatusChange = async (taskId: string, completed: boolean) => {
    const supabase = createClient()
    await supabase
      .from("tasks")
      .update({
        status: completed ? "completed" : "pending",
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
    router.refresh()
  }

  const handleDelete = async (taskId: string) => {
    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", taskId)
    router.refresh()
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const TaskItem = ({ task }: { task: (typeof tasks)[0] }) => (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={task.status === "completed"}
        onCheckedChange={(checked) => handleStatusChange(task.id, checked as boolean)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-medium", task.status === "completed" && "line-through text-muted-foreground")}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
              {task.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <TaskDialog
                  hotelId={hotelId}
                  userId={userId}
                  units={units}
                  task={task}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {task.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {task.unit && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {task.unit.name}
            </span>
          )}
          {task.assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee.full_name || task.assignee.email}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No pending tasks</p>
            ) : (
              pendingTasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </TabsContent>
          <TabsContent value="in_progress" className="mt-4 space-y-3">
            {inProgressTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No tasks in progress</p>
            ) : (
              inProgressTasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4 space-y-3">
            {completedTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No completed tasks</p>
            ) : (
              completedTasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
