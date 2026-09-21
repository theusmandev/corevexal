import { signOut } from "@/app/actions/auth";

export const metadata = {
  robots: "noindex, nofollow"
};

export default function AdminPage() {
  return (
    <div className="site-container py-20">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-surface p-10 text-center shadow-sm">
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Control Panel</h1>
        <p className="mt-4 text-muted-foreground">
          Welcome to the Corevexal administrative area. This section is restricted to users with the admin role.
        </p>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
