import { redirect } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Portal requires an authenticated user.
  // The user is authenticated.

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}
