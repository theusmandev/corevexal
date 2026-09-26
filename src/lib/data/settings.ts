import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Database } from "@/integrations/supabase/types";
import {
  contactInfoSchema,
  socialLinksSchema,
  announcementBannerSchema,
  type ContactInfo,
  type SocialLinks,
  type AnnouncementBanner,
} from "../schemas/settings";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

const supabaseStatic = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface PublicSettings {
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  announcementBanner: AnnouncementBanner;
}

export const getPublicSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    try {
      const { data, error } = await supabaseStatic
        .from("site_settings")
        .select("key, value")
        .eq("is_public", true);

      if (error) {
        console.error("Error fetching site settings:", error);
        return {
          contactInfo: contactInfoSchema.parse({}),
          socialLinks: socialLinksSchema.parse({}),
          announcementBanner: announcementBannerSchema.parse({}),
        };
      }

      const settingsMap = new Map(data.map((row) => [row.key, row.value]));

      return {
        contactInfo: contactInfoSchema
          .catch(contactInfoSchema.parse({}))
          .parse(settingsMap.get("contact_info") || {}),
        socialLinks: socialLinksSchema
          .catch(socialLinksSchema.parse({}))
          .parse(settingsMap.get("social_links") || {}),
        announcementBanner: announcementBannerSchema
          .catch(announcementBannerSchema.parse({}))
          .parse(settingsMap.get("announcement_banner") || {}),
      };
    } catch (err) {
      console.error("Unexpected error parsing site settings:", err);
      return {
        contactInfo: contactInfoSchema.parse({}),
        socialLinks: socialLinksSchema.parse({}),
        announcementBanner: announcementBannerSchema.parse({}),
      };
    }
  },
  ["site_settings"],
  { tags: ["site_settings"], revalidate: 60 },
);
