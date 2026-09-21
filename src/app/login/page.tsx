import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Sign In | Corevexal",
  description: "Sign in to access your Corevexal client portal.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: hasRole } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    redirect(hasRole ? "/admin" : "/portal");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <Brand />
          </div>
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your email and password to access your account
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
