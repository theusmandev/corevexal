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
      <header className="border-b border-border bg-surface">
        <div className="site-container flex h-14 items-center gap-6">
          <p className="font-bold">Corevexal Admin</p>
          <nav aria-label="Admin Navigation" className="flex gap-4 text-sm font-medium">
            <a href="/admin" className="text-muted-foreground hover:text-foreground">Dashboard</a>
            <a href="/admin/leads" className="text-muted-foreground hover:text-foreground">Leads</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
