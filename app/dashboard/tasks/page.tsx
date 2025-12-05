import { getTasks } from "@/lib/tasks-server-actions";
import TasksPageClient from "./tasks-client";

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TasksPageClient initialTasks={tasks} />;
}
