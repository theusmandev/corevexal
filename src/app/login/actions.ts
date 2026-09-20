"use server";

import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // In a real app we'd pass this to UI, but this is minimal
    throw new Error(error.message);
  }

  // Redirect on successful sign in
  redirect("/portal");
}
