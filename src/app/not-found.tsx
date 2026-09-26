import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-20 text-center bg-background text-foreground">
      <p className="font-mono text-sm font-bold text-primary-text">404 Error</p>
      <h1 className="mt-5 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-5 text-muted-foreground">We could not find the page you are looking for.</p>
      <Button asChild className="mt-8">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
