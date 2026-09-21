"use server";

import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
 const supabase = await createClient();

 const data = {
 email: formData.get("email") as string,
 password: formData.get("password") as string,
 };

 const { data: authData, error } = await supabase.auth.signInWithPassword(data);

 if (error) {
 throw new Error(error.message);
 }

 // Check if user has admin role
 let target = "/portal";
 if (authData?.user) {
 const { data: hasRole } = await supabase.rpc("has_role", {
 _user_id: authData.user.id,
 _role: "admin",
 });
 if (hasRole) {
 target = "/admin";
 }
 }

 redirect(target);
}
