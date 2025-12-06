import { requirePremium } from "@/lib/premium";
import { getTasks } from "@/lib/tasks-server-actions";
import TasksPageClient from "./tasks-client";

export default async function TasksPage() {
  await requirePremium();
  const tasks = await getTasks();

  return <TasksPageClient initialTasks={tasks} />;
}
