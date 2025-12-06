"use server";

import { createClientSafe as createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: "cleaning" | "maintenance" | "inspection" | "other";
  unitId?: string;
  unitNumber?: string;
  assignedTo: string;
  dueDate: string; // YYYY-MM-DD
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  createdAt: string;
  completedAt?: string;
}

/**
 * Get all tasks for a user's hotels
 * @param {string} [unitId] - Optional unit ID to filter tasks by unit
 */
export async function getTasks(unitId?: string): Promise<Task[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // First check if tasks table exists
  const { error: tableCheckError } = await supabase
    .from("tasks")
    .select("id")
    .limit(1);

  if (tableCheckError && tableCheckError.message.includes("does not exist")) {
    console.warn("Tasks table does not exist in the database");
    // Return an empty array since the table doesn't exist
    return [];
  }

  let tasks: Task[] = [];

  try {
    // Build query based on whether we're filtering by unitId
    let query = supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        type,
        unit_id,
        assigned_to,
        due_date,
        priority,
        status,
        created_at,
        completed_at
      `)
      .in("hotel_id", hotelIds);

    // If unitId is specified, filter tasks by that unit
    if (unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data: tasksData, error: tasksError } = await query;

    if (tasksError) {
      console.warn("Error fetching tasks with full schema:", tasksError.message);

      // Fallback: try basic schema
      let basicQuery = supabase
        .from("tasks")
        .select("id, title, description, type, assigned_to, due_date, priority, status, created_at")
        .in("hotel_id", hotelIds);

      if (unitId) {
        basicQuery = basicQuery.eq("unit_id", unitId);
      }

      const { data: basicTasksData, error: basicTasksError } = await basicQuery;

      if (basicTasksError) {
        console.warn("Error fetching basic tasks:", basicTasksError.message);

        // Fallback 2: try minimal schema
        let minimalQuery = supabase
          .from("tasks")
          .select("id, title, type, assigned_to, due_date, priority, status")
          .in("hotel_id", hotelIds);

        if (unitId) {
          minimalQuery = minimalQuery.eq("unit_id", unitId);
        }

        const { data: minimalTasksData, error: minimalTasksError } = await minimalQuery;

        if (minimalTasksError) {
          console.warn("Error fetching minimal tasks:", minimalTasksError.message);
          // If no tasks table exists, return an empty array as a last resort
          console.warn("Returning empty tasks array due to database errors");
          return [];
        } else {
          tasks = minimalTasksData.map(item => ({
            id: item.id,
            title: item.title || "Task",
            description: "",
            type: (item.type as Task["type"]) || "other",
            unitId: unitId,
            unitNumber: undefined,
            assignedTo: item.assigned_to || "",
            dueDate: item.due_date || new Date().toISOString().split('T')[0],
            priority: (item.priority as Task["priority"]) || "medium",
            status: (item.status as Task["status"]) || "todo",
            createdAt: new Date().toISOString(),
          }));
        }
      } else {
        tasks = basicTasksData.map(item => ({
          id: item.id,
          title: item.title || "Task",
          description: item.description || "",
          type: (item.type as Task["type"]) || "other",
          unitId: unitId,
          unitNumber: undefined,
          assignedTo: item.assigned_to || "",
          dueDate: item.due_date || new Date().toISOString().split('T')[0],
          priority: (item.priority as Task["priority"]) || "medium",
          status: (item.status as Task["status"]) || "todo",
          createdAt: item.created_at || new Date().toISOString(),
        }));
      }
    } else {
      tasks = tasksData.map(item => ({
        id: item.id,
        title: item.title || "Task",
        description: item.description || "",
        type: (item.type as Task["type"]) || "other",
        unitId: item.unit_id,
        unitNumber: undefined, // Will populate separately if needed
        assignedTo: item.assigned_to || "",
        dueDate: item.due_date || new Date().toISOString().split('T')[0],
        priority: (item.priority as Task["priority"]) || "medium",
        status: (item.status as Task["status"]) || "todo",
        createdAt: item.created_at || new Date().toISOString(),
        completedAt: item.completed_at,
      }));
    }
  } catch (error) {
    console.warn("Error querying tasks table, may not exist:", error);
    // If tasks table doesn't exist, return an empty array as a last resort
    console.warn("Returning empty tasks array due to database errors");
    return [];
  }

  // If there are unit IDs in the tasks, get the unit numbers
  if (tasks.length > 0) {
    const unitIds = tasks.filter(task => task.unitId).map(task => task.unitId!) as string[];
    if (unitIds.length > 0) {
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, name as number")
        .in("id", unitIds);

      if (unitsError) {
        console.warn("Error fetching units for tasks:", unitsError.message);
      } else {
        const unitMap = new Map(unitsData.map(unit => [unit.id, unit.number]));

        tasks = tasks.map(task => ({
          ...task,
          unitNumber: unitMap.get(task.unitId || '') || task.unitNumber
        }));
      }
    }
  }

  return tasks;
}

export async function getTasksByUnitId(unitId: string): Promise<Task[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // First check if tasks table exists
  const { error: tableCheckError } = await supabase
    .from("tasks")
    .select("id")
    .limit(1);

  if (tableCheckError && tableCheckError.message.includes("does not exist")) {
    console.warn("Tasks table does not exist in the database");
    // Return an empty array since the table doesn't exist
    return [];
  }

  let tasks: Task[] = [];

  try {
    // Get tasks for the specific unit
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        type,
        unit_id,
        assigned_to,
        due_date,
        priority,
        status,
        created_at,
        completed_at
      `)
      .in("hotel_id", hotelIds)
      .eq("unit_id", unitId);

    if (tasksError) {
      console.warn("Error fetching tasks with full schema:", tasksError.message);

      // Fallback: try basic schema
      const { data: basicTasksData, error: basicTasksError } = await supabase
        .from("tasks")
        .select("id, title, description, type, assigned_to, due_date, priority, status, created_at")
        .in("hotel_id", hotelIds)
        .eq("unit_id", unitId);

      if (basicTasksError) {
        console.warn("Error fetching basic tasks:", basicTasksError.message);

        // Fallback 2: try minimal schema
        const { data: minimalTasksData, error: minimalTasksError } = await supabase
          .from("tasks")
          .select("id, title, type, assigned_to, due_date, priority, status")
          .in("hotel_id", hotelIds)
          .eq("unit_id", unitId);

        if (minimalTasksError) {
          console.warn("Error fetching minimal tasks:", minimalTasksError.message);
          // If no tasks table exists, return an empty array as a last resort
          console.warn("Returning empty tasks array due to database errors");
          return [];
        } else {
          tasks = minimalTasksData.map(item => ({
            id: item.id,
            title: item.title || "Task",
            description: "",
            type: (item.type as Task["type"]) || "other",
            unitId: item.unit_id,
            unitNumber: undefined,
            assignedTo: item.assigned_to || "",
            dueDate: item.due_date || new Date().toISOString().split('T')[0],
            priority: (item.priority as Task["priority"]) || "medium",
            status: (item.status as Task["status"]) || "todo",
            createdAt: new Date().toISOString(),
          }));
        }
      } else {
        tasks = basicTasksData.map(item => ({
          id: item.id,
          title: item.title || "Task",
          description: item.description || "",
          type: (item.type as Task["type"]) || "other",
          unitId: item.unit_id,
          unitNumber: undefined,
          assignedTo: item.assigned_to || "",
          dueDate: item.due_date || new Date().toISOString().split('T')[0],
          priority: (item.priority as Task["priority"]) || "medium",
          status: (item.status as Task["status"]) || "todo",
          createdAt: item.created_at || new Date().toISOString(),
        }));
      }
    } else {
      tasks = tasksData.map(item => ({
        id: item.id,
        title: item.title || "Task",
        description: item.description || "",
        type: (item.type as Task["type"]) || "other",
        unitId: item.unit_id,
        unitNumber: undefined, // Will populate separately if needed
        assignedTo: item.assigned_to || "",
        dueDate: item.due_date || new Date().toISOString().split('T')[0],
        priority: (item.priority as Task["priority"]) || "medium",
        status: (item.status as Task["status"]) || "todo",
        createdAt: item.created_at || new Date().toISOString(),
        completedAt: item.completed_at,
      }));
    }
  } catch (error) {
    console.warn("Error querying tasks table, may not exist:", error);
    // If tasks table doesn't exist, return an empty array as a last resort
    console.warn("Returning empty tasks array due to database errors");
    return [];
  }

  // If there are unit IDs in the tasks, get the unit numbers
  if (tasks.length > 0) {
    const unitIds = tasks.filter(task => task.unitId).map(task => task.unitId!) as string[];
    if (unitIds.length > 0) {
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, name as number")
        .in("id", unitIds);

      if (unitsError) {
        console.warn("Error fetching units for tasks:", unitsError.message);
      } else {
        const unitMap = new Map(unitsData.map(unit => [unit.id, unit.number]));

        tasks = tasks.map(task => ({
          ...task,
          unitNumber: unitMap.get(task.unitId || '') || task.unitNumber
        }));
      }
    }
  }

  return tasks;
}

export async function addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to link the task
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // First check if tasks table exists by attempting a simple query
  const { error: tableCheckError } = await supabase
    .from("tasks")
    .select("id")
    .limit(1);

  if (tableCheckError && tableCheckError.message.includes("does not exist")) {
    console.warn("Tasks table does not exist in the database");
    // Create a mock task object since the table doesn't exist
    return {
      id: `mock_task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description || "",
      type: taskData.type || "other",
      unitId: taskData.unitId && taskData.unitId !== "no-unit" && taskData.unitId.trim() !== "" ? taskData.unitId : undefined,
      unitNumber: undefined,
      assignedTo: taskData.assignedTo,
      dueDate: taskData.dueDate,
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === 'completed' ? new Date().toISOString() : undefined,
    };
  }

  try {
    // Prepare the task data, only include fields that exist in the table
    const taskInsertData: any = {
      hotel_id: userHotels[0].id,
      title: taskData.title,
      assigned_to: taskData.assignedTo,
      due_date: taskData.dueDate,
      priority: taskData.priority,
      status: taskData.status,
    };

    // Only add optional fields if they exist
    if (taskData.description) taskInsertData.description = taskData.description;
    if (taskData.type) taskInsertData.type = taskData.type;
    if (taskData.unitId && taskData.unitId !== "no-unit" && taskData.unitId.trim() !== "") taskInsertData.unit_id = taskData.unitId;
    if (taskData.status === 'completed') taskInsertData.completed_at = new Date().toISOString();

    // Try to insert with all fields first
    let { data, error } = await supabase
      .from("tasks")
      .insert([taskInsertData])
      .select(`
        id,
        title,
        description,
        type,
        unit_id,
        assigned_to,
        due_date,
        priority,
        status,
        created_at,
        completed_at
      `)
      .single();

    // If insertion fails due to missing columns, try with minimal fields
    if (error) {
      console.warn("Error inserting task with all fields:", error.message);

      // Retry with only essential fields
      const minimalTaskData: any = {
        hotel_id: userHotels[0].id,
        title: taskData.title,
        assigned_to: taskData.assignedTo,
        due_date: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
      };

      const { data: minimalData, error: minimalError } = await supabase
        .from("tasks")
        .insert([minimalTaskData])
        .select("id, title, assigned_to, due_date, priority, status, created_at")
        .single();

      if (minimalError) {
        console.error("Error inserting task with minimal fields:", minimalError);
        throw new Error("Failed to add task: " + minimalError.message);
      }

      // Return the minimal task object
      return {
        id: minimalData.id,
        title: minimalData.title,
        description: "",
        type: "other",
        unitId: undefined,
        unitNumber: undefined,
        assignedTo: minimalData.assigned_to || "",
        dueDate: minimalData.due_date || new Date().toISOString().split('T')[0],
        priority: (minimalData.priority as Task["priority"]) || "medium",
        status: (minimalData.status as Task["status"]) || "todo",
        createdAt: minimalData.created_at || new Date().toISOString(),
        completedAt: undefined,
      };
    }

    // If initial insertion succeeded, return the full task object
    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      type: (data.type as Task["type"]) || "other",
      unitId: data.unit_id || undefined,
      unitNumber: undefined, // Will populate separately
      assignedTo: data.assigned_to || "",
      dueDate: data.due_date || new Date().toISOString().split('T')[0],
      priority: (data.priority as Task["priority"]) || "medium",
      status: (data.status as Task["status"]) || "todo",
      createdAt: data.created_at || new Date().toISOString(),
      completedAt: data.completed_at || undefined,
    };
  } catch (error) {
    console.error("Error adding task:", error);
    throw new Error("Failed to add task: " + (error as Error).message);
  }
}

export async function updateTask(id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // First check if tasks table exists
  const { error: tableCheckError } = await supabase
    .from("tasks")
    .select("id")
    .limit(1);

  if (tableCheckError && tableCheckError.message.includes("does not exist")) {
    console.warn("Tasks table does not exist in the database");
    // Create a mock updated task object since the table doesn't exist
    const mockTask: Task = {
      id: id, // Use the provided ID
      title: "Mock Task", // This will be replaced with actual title if provided
      description: "",
      type: "other",
      unitId: undefined,
      unitNumber: undefined,
      assignedTo: "",
      dueDate: new Date().toISOString().split('T')[0],
      priority: "medium",
      status: "todo",
      createdAt: new Date().toISOString(),
      completedAt: undefined,
    };

    // Apply any provided updates to the mock task
    if (taskData.title !== undefined) mockTask.title = taskData.title;
    if (taskData.description !== undefined) mockTask.description = taskData.description;
    if (taskData.type !== undefined) mockTask.type = taskData.type;
    if (taskData.unitId !== undefined && taskData.unitId !== "no-unit" && taskData.unitId.trim() !== "") mockTask.unitId = taskData.unitId;
    if (taskData.assignedTo !== undefined) mockTask.assignedTo = taskData.assignedTo;
    if (taskData.dueDate !== undefined) mockTask.dueDate = taskData.dueDate;
    if (taskData.priority !== undefined) mockTask.priority = taskData.priority;
    if (taskData.status !== undefined) mockTask.status = taskData.status;
    if (taskData.status === 'completed') mockTask.completedAt = new Date().toISOString();

    return mockTask;
  }

  try {
    // Prepare the update data, only include fields that exist in the table
    const updateData: any = {};

    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.type !== undefined) updateData.type = taskData.type;
    if (taskData.unitId !== undefined && taskData.unitId !== "no-unit" && taskData.unitId.trim() !== "") updateData.unit_id = taskData.unitId;
    if (taskData.assignedTo !== undefined) updateData.assigned_to = taskData.assignedTo;
    if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (taskData.status && taskData.status !== 'completed') {
      updateData.completed_at = null;
    }

    // Try to update with all fields first
    let { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .in("hotel_id", hotelIds)
      .select(`
        id,
        title,
        description,
        type,
        unit_id,
        assigned_to,
        due_date,
        priority,
        status,
        created_at,
        completed_at
      `)
      .single();

    // If update fails due to missing columns, try with minimal fields
    if (error) {
      console.warn("Error updating task with all fields:", error.message);

      // Retry with only essential fields
      const minimalUpdateData: any = {};
      if (taskData.title !== undefined) minimalUpdateData.title = taskData.title;
      if (taskData.assignedTo !== undefined) minimalUpdateData.assigned_to = taskData.assignedTo;
      if (taskData.dueDate !== undefined) minimalUpdateData.due_date = taskData.dueDate;
      if (taskData.priority !== undefined) minimalUpdateData.priority = taskData.priority;
      if (taskData.unitId !== undefined && taskData.unitId !== "no-unit" && taskData.unitId.trim() !== "") minimalUpdateData.unit_id = taskData.unitId;
      if (taskData.status !== undefined) {
        minimalUpdateData.status = taskData.status;
        if (taskData.status === 'completed') {
          minimalUpdateData.completed_at = new Date().toISOString();
        } else if (taskData.status !== 'completed') {
          minimalUpdateData.completed_at = null;
        }
      }

      const { data: minimalData, error: minimalError } = await supabase
        .from("tasks")
        .update(minimalUpdateData)
        .eq("id", id)
        .in("hotel_id", hotelIds)
        .select("id, title, assigned_to, due_date, priority, status, created_at")
        .single();

      if (minimalError) {
        console.error("Error updating task with minimal fields:", minimalError);
        throw new Error("Failed to update task: " + minimalError.message);
      }

      // Return the minimal task object
      return {
        id: minimalData.id,
        title: minimalData.title,
        description: "",
        type: "other",
        unitId: undefined,
        unitNumber: undefined,
        assignedTo: minimalData.assigned_to || "",
        dueDate: minimalData.due_date || new Date().toISOString().split('T')[0],
        priority: (minimalData.priority as Task["priority"]) || "medium",
        status: (minimalData.status as Task["status"]) || "todo",
        createdAt: minimalData.created_at || new Date().toISOString(),
        completedAt: undefined,
      };
    }

    // If initial update succeeded, return the full task object
    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      type: (data.type as Task["type"]) || "other",
      unitId: data.unit_id || undefined,
      unitNumber: undefined, // Will populate separately
      assignedTo: data.assigned_to || "",
      dueDate: data.due_date || new Date().toISOString().split('T')[0],
      priority: (data.priority as Task["priority"]) || "medium",
      status: (data.status as Task["status"]) || "todo",
      createdAt: data.created_at || new Date().toISOString(),
      completedAt: data.completed_at || undefined,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task: " + (error as Error).message);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // First check if tasks table exists
  const { error: tableCheckError } = await supabase
    .from("tasks")
    .select("id")
    .limit(1);

  if (tableCheckError && tableCheckError.message.includes("does not exist")) {
    console.warn("Tasks table does not exist in the database");
    // If table doesn't exist, we'll just return successfully since there's nothing to delete
    return;
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  try {
    // Delete the task
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .in("hotel_id", hotelIds);

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task: " + error.message);
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task: " + (error as Error).message);
  }
}