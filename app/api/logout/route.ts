import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Could not sign out" }, { status: 500 });
  }

  // Return success response to redirect client-side
  return NextResponse.json({ success: true });
}