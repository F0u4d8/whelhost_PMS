import { redirect } from "next/navigation";

export default function RoomsPage() {
  // Redirect rooms page to units page since they are the same functionality
  redirect("/dashboard/units");
}