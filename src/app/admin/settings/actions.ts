"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/integrations/supabase/server";
import {
  contactInfoSchema,
  socialLinksSchema,
  announcementBannerSchema,
} from "@/lib/schemas/settings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }
  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (roleError || !hasRole) {
    return { error: "Unauthorized" };
  }
  return { success: true };
}

export async function updateContactInfo(formData: FormData) {
  const supabase = await createClient();
  const authRes = await requireAdmin(supabase);
  if (authRes.error) return authRes;

  const validatedData = contactInfoSchema.safeParse({
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  });

  if (!validatedData.success) {
    return { error: "Invalid contact information." };
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "contact_info",
      value: validatedData.data,
      is_public: true,
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("Error updating contact info:", error);
    return { error: "Failed to update contact information." };
  }

  updateTag("site_settings");
  return { success: true };
}

export async function updateSocialLinks(formData: FormData) {
  const supabase = await createClient();
  const authRes = await requireAdmin(supabase);
  if (authRes.error) return authRes;

  const validatedData = socialLinksSchema.safeParse({
    linkedin: formData.get("linkedin") as string,
    twitter: formData.get("twitter") as string,
    instagram: formData.get("instagram") as string,
    facebook: formData.get("facebook") as string,
  });

  if (!validatedData.success) {
    return { error: "Invalid social links." };
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "social_links",
      value: validatedData.data,
      is_public: true,
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("Error updating social links:", error);
    return { error: "Failed to update social links." };
  }

  updateTag("site_settings");
  return { success: true };
}

export async function updateAnnouncementBanner(formData: FormData) {
  const supabase = await createClient();
  const authRes = await requireAdmin(supabase);
  if (authRes.error) return authRes;

  const validatedData = announcementBannerSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    text: formData.get("text") as string,
    link_text: formData.get("link_text") as string,
    link_url: formData.get("link_url") as string,
  });

  if (!validatedData.success) {
    return {
      error: "Invalid announcement banner configuration. " + validatedData.error.errors[0]?.message,
    };
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "announcement_banner",
      value: validatedData.data,
      is_public: true,
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("Error updating announcement banner:", error);
    return { error: "Failed to update announcement banner." };
  }

  updateTag("site_settings");
  return { success: true };
}
