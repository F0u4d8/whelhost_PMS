import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LogoutPage() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  }

  // Redirect to home page after logout
  redirect("/");
}