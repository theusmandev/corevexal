import { getPublicSettings } from "@/lib/data/settings";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Site Settings - Admin",
};

export default async function SettingsPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Site Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage global site configuration and contact details.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
