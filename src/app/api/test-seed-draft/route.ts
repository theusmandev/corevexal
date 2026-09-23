import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

/**
 * TEMPORARY test-only endpoint.
 * GET /api/test-seed-draft  → inserts a draft service with slug "test-draft-service"
 * DELETE /api/test-seed-draft → removes it
 * Protected by requireAdmin() — must be called while authenticated as admin.
 * REMOVE THIS FILE after draft preview testing is complete.
 */

export async function GET() {
  const { supabase } = await requireAdmin();

  // Get a published category to satisfy the FK constraint
  const { data: categories, error: catError } = await supabase
    .from("service_categories")
    .select("id")
    .eq("status", "published")
    .limit(1)
    .single();

  if (catError || !categories) {
    return NextResponse.json({ error: "No published category found" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("services")
    .upsert(
      {
        category_id: categories.id,
        title: "Test Draft Service",
        slug: "test-draft-service",
        short_description: "Temporary draft used to verify the admin preview feature.",
        description:
          "This draft service exists solely to test that anonymous visitors get a 404 while authenticated admins can preview it via /admin/preview/test-draft-service. Safe to delete.",
        icon: "Building2",
        features: [],
        requirements: [],
        process: [],
        faqs: [],
        related_services: [],
        seo_title: "",
        seo_description: "",
        status: "draft",
        display_order: 999,
      },
      { onConflict: "slug" },
    )
    .select("id, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, service: data });
}

export async function DELETE() {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("slug", "test-draft-service");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: "test-draft-service" });
}
