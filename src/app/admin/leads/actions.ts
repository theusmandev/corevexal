"use server";

import { createClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";

export async function updateLeadStatus(formData: FormData) {
 try {
 const id = formData.get("id");
 const status = formData.get("status");

 if (typeof id !== "string" || !id.trim()) {
 return { success: false, error: "Invalid ID" };
 }
 
 if (typeof status !== "string" || !LEAD_STATUSES.includes(status as LeadStatus)) {
 return { success: false, error: "Invalid status value" };
 }

 const supabase = await createClient();
 
 // Server-side role check
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 return { success: false, error: "Unauthorized" };
 }

 const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
 _user_id: user.id,
 _role: "admin"
 });

 if (roleError || !hasRole) {
 return { success: false, error: "Unauthorized" };
 }

 // Update with .select() to verify RLS success. Must return exactly 1 row.
 const { data, error } = await supabase
 .from("leads")
 .update({ status: status as any })
 .eq("id", id)
 .select("id")
 .single();

 if (error || !data) {
 console.error("Failed to update lead", error);
 return { success: false, error: "Could not update this lead" };
 }

 revalidatePath("/admin/leads");
 revalidatePath(`/admin/leads/${id}`);

 return { success: true };
 } catch (err) {
 console.error("Action error", err);
 return { success: false, error: "Could not update this lead" };
 }
}
