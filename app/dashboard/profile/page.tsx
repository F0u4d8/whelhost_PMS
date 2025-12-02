import { redirect } from "next/navigation";

export default async function DashboardProfilePage() {
  // Redirect to the main profile page to avoid duplicate content
  redirect("/profile");
}