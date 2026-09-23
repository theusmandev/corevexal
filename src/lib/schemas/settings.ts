import { z } from "zod";

export const contactInfoSchema = z.object({
  email: z.union([z.literal(""), z.string().email("Invalid email address")]).optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export const socialLinksSchema = z.object({
  linkedin: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().default(""),
  twitter: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().default(""),
  instagram: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().default(""),
  facebook: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().default(""),
});

export const announcementBannerSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().max(200, "Text must be 200 characters or less").default(""),
  link_text: z.string().optional().default(""),
  link_url: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().default(""),
}).refine(
  (data) => {
    const hasLinkText = data.link_text && data.link_text.trim() !== "";
    const hasLinkUrl = data.link_url && data.link_url.trim() !== "";
    return (hasLinkText && hasLinkUrl) || (!hasLinkText && !hasLinkUrl);
  },
  {
    message: "Both link text and link URL must be provided together, or both must be empty.",
    path: ["link_text"],
  }
);

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type AnnouncementBanner = z.infer<typeof announcementBannerSchema>;
