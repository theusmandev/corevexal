import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedCategories } from "@/lib/data/services";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getPublishedCategories();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
