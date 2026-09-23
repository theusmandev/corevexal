import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getPublishedCategories } from "@/lib/data/services";
import { getPublicSettings } from "@/lib/data/settings";

export default async function NotFound() {
  const [categories, settings] = await Promise.all([
    getPublishedCategories(),
    getPublicSettings()
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader categories={categories} />
      <main className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm font-bold text-primary-text">404 Error</p>
        <h1 className="mt-5 font-display text-4xl font-bold">Page not found</h1>
        <p className="mt-5 text-muted-foreground">
          We could not find the page you are looking for.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return home</Link>
        </Button>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
