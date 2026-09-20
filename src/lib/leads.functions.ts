import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const leadSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().min(2).max(100),
  companyStatus: z.string().trim().min(2).max(100),
  companyName: z.string().trim().max(160).optional(),
  serviceRequested: z.string().trim().min(2).max(100),
  businessType: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const client = createClient<Database>(process.env['SUPABASE_URL']!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers }); } },
    });
    const { error } = await client.from("leads").insert({ full_name: data.fullName, email: data.email, phone: data.phone || null, country: data.country, company_status: data.companyStatus, company_name: data.companyName || null, service_requested: data.serviceRequested, business_type: data.businessType, message: data.message });
    if (error) throw new Error("We could not submit your request. Please try again.");
    return { ok: true };
  });