"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { Task, updateTask as updateTaskAction, deleteTask as deleteTaskAction } from "@/lib/tasks-server-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UnitTasksDisplayProps {
  unitId: string;
  unitNumber: string;
  onTaskUpdate?: () => void; // Callback to refresh tasks after changes
}

export function UnitTasksDisplay({ unitId, unitNumber, onTaskUpdate }: UnitTasksDisplayProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks for this specific unit
  useEffect(() => {
    const fetchUnitTasks = async () => {
      try {
        setLoading(true);
        // Get tasks specifically for this unit ID
        const unitTasks = await import("@/lib/tasks-server-actions").then(mod => mod.getTasksByUnitId(unitId));
        setTasks(unitTasks);
      } catch (err) {
        console.error("Error fetching unit tasks:", err);
        setError("حدث خطأ أثناء تحميل المهام");
        toast.error("حدث خطأ أثناء تحميل المهام");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitTasks();
  }, [unitId]);

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      const updatedTask = await updateTaskAction(taskId, updates);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      toast.success("تم تحديث المهمة بنجاح");
      if (onTaskUpdate) onTaskUpdate(); // Refresh parent if needed
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذه المهمة؟")) return;

    try {
      await deleteTaskAction(id);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success("تم حذف المهمة بنجاح");
      if (onTaskUpdate) onTaskUpdate(); // Refresh parent if needed
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await handleUpdateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const priorityConfig = {
    low: { label: "منخفضة", color: "bg-secondary text-secondary-foreground" },
    medium: { label: "متوسطة", color: "bg-warning/20 text-warning" },
    high: { label: "عالية", color: "bg-destructive/20 text-destructive" },
  };

  const typeLabels = {
    cleaning: "تنظيف",
    maintenance: "صيانة",
    inspection: "فحص",
    other: "أخرى",
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            المهام المرتبطة
            <span className="text-sm text-muted-foreground">({tasks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            المهام المرتبطة
            <span className="text-sm text-muted-foreground">({tasks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          المهام المرتبطة بوحدة {unitNumber}
          <span className="text-sm text-muted-foreground">({tasks.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            لا توجد مهام مرتبطة بهذه الوحدة
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "p-3 rounded-lg border flex items-start justify-between",
                  task.status === 'completed' ? 'border-success/50 bg-success/10' : 
                  task.status === 'in-progress' ? 'border-primary/50 bg-primary/10' : 
                  'border-border bg-background'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge className={cn("text-xs ml-2", priorityConfig[task.priority].color)}>
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[task.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-2">{task.description}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">المكلف:</span> {task.assignedTo}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMarkComplete(task.id)}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // This would open the add task modal with the unit pre-filled
              // For now, we'll just show a toast
              toast.info("سيتم فتح نموذج إضافة مهمة جديدة");
            }}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة مهمة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}