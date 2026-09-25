"use client";

import { useTransition } from "react";
import { updateContactInfo, updateSocialLinks, updateAnnouncementBanner } from "./actions";
import { Button } from "@/components/ui/button";
import type { PublicSettings } from "@/lib/data/settings";

export function SettingsForm({ settings }: { settings: PublicSettings }) {
  const [isPending1, startTransition1] = useTransition();
  const [isPending2, startTransition2] = useTransition();
  const [isPending3, startTransition3] = useTransition();

  const handleContactSubmit = (formData: FormData) => {
    startTransition1(async () => {
      const res = await updateContactInfo(formData);
      if ("error" in res && res.error) alert(res.error);
      else alert("Contact info updated.");
    });
  };

  const handleSocialSubmit = (formData: FormData) => {
    startTransition2(async () => {
      const res = await updateSocialLinks(formData);
      if ("error" in res && res.error) alert(res.error);
      else alert("Social links updated.");
    });
  };

  const handleBannerSubmit = (formData: FormData) => {
    startTransition3(async () => {
      const res = await updateAnnouncementBanner(formData);
      if ("error" in res && res.error) alert(res.error);
      else alert("Announcement banner updated.");
    });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Contact Information</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Displayed in the site footer and contact page. Leave fields blank to hide them.
        </p>
        <form action={handleContactSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="mb-2 block text-sm font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={settings.contactInfo.email}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phone"
              defaultValue={settings.contactInfo.phone}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Physical Address</label>
            <textarea
              name="address"
              rows={3}
              defaultValue={settings.contactInfo.address}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" disabled={isPending1}>
            {isPending1 ? "Saving..." : "Save Contact Info"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Social Links</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Full URLs to your social profiles. Leave blank to hide the icon.
        </p>
        <form action={handleSocialSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="mb-2 block text-sm font-medium">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              defaultValue={settings.socialLinks.linkedin}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Twitter / X URL</label>
            <input
              type="url"
              name="twitter"
              defaultValue={settings.socialLinks.twitter}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Instagram URL</label>
            <input
              type="url"
              name="instagram"
              defaultValue={settings.socialLinks.instagram}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Facebook URL</label>
            <input
              type="url"
              name="facebook"
              defaultValue={settings.socialLinks.facebook}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" disabled={isPending2}>
            {isPending2 ? "Saving..." : "Save Social Links"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Announcement Banner</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          A dismissible banner shown at the very top of all public pages.
        </p>
        <form action={handleBannerSubmit} className="space-y-4 max-w-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              defaultChecked={settings.announcementBanner.enabled}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="enabled" className="text-sm font-medium">
              Enable banner
            </label>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Announcement Text (max 200 chars)</label>
            <input
              type="text"
              name="text"
              maxLength={200}
              defaultValue={settings.announcementBanner.text}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Link Text (Optional)</label>
              <input
                type="text"
                name="link_text"
                defaultValue={settings.announcementBanner.link_text}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Read more"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Link URL (Optional)</label>
              <input
                type="url"
                name="link_url"
                defaultValue={settings.announcementBanner.link_url}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://"
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending3}>
            {isPending3 ? "Saving..." : "Save Announcement Banner"}
          </Button>
        </form>
      </section>
    </div>
  );
}
