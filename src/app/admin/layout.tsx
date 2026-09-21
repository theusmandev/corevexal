import { redirect } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";
import { AdminNav } from "@/components/admin-nav";
import { signOut } from "@/app/actions/auth";

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
    redirect("/portal");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="site-container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="font-bold hidden sm:block text-primary">Corevexal</p>
            <AdminNav />
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
