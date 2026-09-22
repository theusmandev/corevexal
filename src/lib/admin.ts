import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

/**
 * Verifies the current user is an authenticated admin using getUser() (not
 * getSession()) so the JWT is re-validated against Supabase auth on every call.
 * Call this at the top of every Server Action that writes data.
 * Redirects or throws on failure — never returns without a valid admin user.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (roleError || !hasRole) {
    redirect("/portal");
  }

  return { supabase, user };
}
