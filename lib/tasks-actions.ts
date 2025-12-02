'use server'

import { createClient } from "@/lib/supabase/server";
import { NotificationService } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

interface CreateTaskData {
  hotel_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  unit_id?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
  booking_id?: string | null;
}

interface UpdateTaskData {
  title?: string;
  description?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  unit_id?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
}

export async function createTask(data: CreateTaskData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user has access to the hotel
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("id", data.hotel_id)
    .eq("owner_id", user.id)
    .single();

  if (hotelError || !hotel) {
    throw new Error("Hotel not found or unauthorized");
  }

  // Create the task
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      hotel_id: data.hotel_id,
      created_by: data.created_by,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      status: data.status,
      unit_id: data.unit_id || null,
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || null,
      booking_id: data.booking_id || null,
    })
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(full_name, email),
      unit:units(name)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create notification for the new task
  await NotificationService.createTaskNotification(
    data.hotel_id,
    task.id,
    `New ${data.priority} priority task: ${data.title}`,
    `A new task "${data.title}" has been assigned.`,
    data.priority
  );

  // Revalidate the tasks page to show the new task
  revalidatePath('/dashboard/tasks');

  return task;
}

export async function updateTask(taskId: string, data: UpdateTaskData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the existing task to access hotel_id
  const { data: existingTask } = await supabase
    .from("tasks")
    .select("hotel_id, title")
    .eq("id", taskId)
    .single();

  if (!existingTask) {
    throw new Error("Task not found");
  }

  // Update the task
  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      unit_id: data.unit_id,
      due_date: data.due_date,
      assigned_to: data.assigned_to,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(full_name, email),
      unit:units(name)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create notification for the task update if status changed
  if (data.status && data.status !== existingTask?.status) {
    const statusMessages: Record<string, string> = {
      pending: "marked as pending",
      'in_progress': "marked as in progress",
      completed: "marked as completed",
      cancelled: "marked as cancelled"
    };
    
    await NotificationService.createTaskNotification(
      existingTask.hotel_id,
      taskId,
      `Task "${updatedTask.title}" status updated`,
      `Task "${updatedTask.title}" has been ${statusMessages[data.status]}.`,
      data.priority || updatedTask.priority
    );
  }

  // Revalidate the tasks page to show the updated task
  revalidatePath('/dashboard/tasks');

  return updatedTask;
}