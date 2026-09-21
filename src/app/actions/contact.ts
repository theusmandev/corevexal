"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/integrations/supabase/types";

const leadSchema = z.object({
 fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
 email: z.string().trim().email("Invalid email address").max(180, "Email is too long"),
 phone: z.string().trim().max(40, "Phone is too long").optional(),
 country: z.string().trim().min(2, "Country is required").max(100),
 companyStatus: z.string().trim().min(2, "Status is required").max(100),
 companyName: z.string().trim().max(160, "Company name is too long").optional(),
 serviceRequested: z.string().trim().min(2, "Service is required").max(100),
 businessType: z.string().trim().min(2, "Business type is required").max(120),
 message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000, "Message is too long"),
 website: z.string().max(0, "Invalid submission"), // Honeypot
});

type ActionState = {
 success: boolean;
 error?: string;
 fieldErrors?: Record<string, string[]>;
};

// Rate limiting placeholder (e.g. upstash rate limit or memory map)
const RATE_LIMIT_TIMEOUT = 5000;
const ipMap = new Map<string, number>();

export async function submitContact(prevState: ActionState, formData: FormData): Promise<ActionState> {
 try {
 // 1. Rate limiting placeholder
 const ip = "anonymous"; // In Next.js App Router we might get IP from headers if available, keeping simple
 const lastTime = ipMap.get(ip) || 0;
 if (Date.now() - lastTime < RATE_LIMIT_TIMEOUT) {
 return { success: false, error: "Please wait a moment before trying again." };
 }
 ipMap.set(ip, Date.now());

 // 2. Validate input and honeypot
 const data = Object.fromEntries(formData.entries());
 const validatedData = leadSchema.safeParse(data);

 if (!validatedData.success) {
 return {
 success: false,
 error: "Please correct the errors below.",
 fieldErrors: validatedData.error.flatten().fieldErrors,
 };
 }

 // 3. Captcha placeholder (swappable module)
 // const captchaResult = await verifyCaptcha(validatedData.data.captchaToken);
 // if (!captchaResult.success) throw new Error("Captcha verification failed.");

 // 4. Supabase Insertion via anon cookie client
 const cookieStore = await cookies();
 const supabase = createServerClient<Database>(
 process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
 process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
 {
 cookies: {
 getAll() {
 return cookieStore.getAll();
 },
 setAll(cookiesToSet) {
 try {
 cookiesToSet.forEach(({ name, value, options }) =>
 cookieStore.set(name, value, options)
 );
 } catch {
 // Expected to fail in server actions sometimes, but fine for reads/writes using existing session
 }
 },
 },
 }
 );

 const { error: dbError } = await supabase.from("leads").insert({
 full_name: validatedData.data.fullName,
 email: validatedData.data.email,
 phone: validatedData.data.phone || null,
 country: validatedData.data.country,
 company_status: validatedData.data.companyStatus,
 company_name: validatedData.data.companyName || null,
 service_requested: validatedData.data.serviceRequested,
 business_type: validatedData.data.businessType,
 message: validatedData.data.message,
 });

 if (dbError) {
 console.error("Database insert error", dbError);
 return { success: false, error: "We could not submit your request at this time. Please try again." };
 }

 return { success: true };
 } catch (err) {
 console.error("Action error", err);
 return { success: false, error: "An unexpected error occurred. Please try again." };
 }
}
