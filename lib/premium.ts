import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requirePremium() {
  const user = await requireAuth();

  const supabase = await createClient();

  // Check if user has premium access
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  let isPremium = false;
  if (!profileError && profile) {
    const isPremiumExpired = profile.premium_expires_at ? new Date(profile.premium_expires_at) < new Date() : true;
    isPremium = profile.is_premium && !isPremiumExpired;
  }

  if (!isPremium) {
    redirect("/packages");
  }

  return { user, isPremium };
}