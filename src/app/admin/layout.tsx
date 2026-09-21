import { redirect } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Enforce admin role
  const { data: hasRole, error } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (error || !hasRole) {
    // If authenticated but not admin, deny access
    redirect("/login?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}
