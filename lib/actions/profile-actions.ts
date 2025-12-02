"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const nationality = formData.get("nationality") as string;
  const id_type = formData.get("id_type") as string;
  const id_number = formData.get("id_number") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      bio,
      nationality,
      id_type,
      id_number,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email || "",
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect");
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error updating password:", error);
    throw new Error("Failed to update password");
  }

  // Sign out and let the user know to sign in again
  await supabase.auth.signOut();

  return { success: true, message: "Password updated successfully. Please sign in again." };
}

export async function updateAvatar(avatarPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      avatar_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profil/${avatarPath}` 
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating avatar in profile:", error);
    throw new Error(`Failed to update avatar: ${error.message}`);
  }

  return { success: true, avatarUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profil/${avatarPath}` };
}