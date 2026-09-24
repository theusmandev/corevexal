import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { getPublishedCategories } from "@/lib/data/services";
import { getPublicSettings } from "@/lib/data/settings";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, settings] = await Promise.all([
    getPublishedCategories(),
    getPublicSettings()
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <AnnouncementBanner banner={settings.announcementBanner} />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} categories={categories} />
    </div>
  );
}
