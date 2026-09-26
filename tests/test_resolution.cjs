/**
 * tests/test_resolution.cjs
 *
 * Slug resolution integration tests.
 * Tests 8 known slugs against the live Supabase project and asserts whether
 * each resolves as a CATEGORY, SERVICE, or 404_NOT_FOUND.
 *
 * Usage:
 *   node tests/test_resolution.cjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
 * the environment.  When run from the repo root the .env.local values are
 * NOT automatically loaded, so either:
 *   - set them in your shell, or
 *   - run via: node -r dotenv/config tests/test_resolution.cjs (if dotenv is available)
 * Alternatively, the script reads .env.local directly as a fallback.
 */

"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Minimal .env.local loader (avoids external dependencies)
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("FATAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Minimal Supabase REST client (no npm deps)
// ---------------------------------------------------------------------------
function supabaseGet(table, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    };

    https
      .get(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}\nBody: ${body}`));
          }
        });
      })
      .on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Resolve a slug: check categories table then services table
// Returns: "CATEGORY" | "SERVICE" | "404_NOT_FOUND"
// ---------------------------------------------------------------------------
async function resolveSlug(slug) {
  // 1. Check service_categories (published only — same filter as the live site)
  const catRes = await supabaseGet("service_categories", {
    slug: `eq.${slug}`,
    status: "eq.published",
    select: "slug",
    limit: "1",
  });
  if (catRes.data && catRes.data.length > 0) return "CATEGORY";

  // 2. Check services (published only)
  const svcRes = await supabaseGet("services", {
    slug: `eq.${slug}`,
    status: "eq.published",
    select: "slug",
    limit: "1",
  });
  if (svcRes.data && svcRes.data.length > 0) return "SERVICE";

  return "404_NOT_FOUND";
}

// ---------------------------------------------------------------------------
// Test cases: [slug, expectedOutcome]
// ---------------------------------------------------------------------------
const TEST_CASES = [
  ["business-formation", "CATEGORY"],
  ["uk-ltd-formation", "SERVICE"],
  ["business-banking", "CATEGORY"],
  ["business-banking-setup", "SERVICE"],
  ["digital-technology", "CATEGORY"],
  ["digital-technology-solutions", "SERVICE"],
  ["consulting", "404_NOT_FOUND"],
  ["not-a-real-slug", "404_NOT_FOUND"],
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
async function main() {
  console.log("Slug Resolution Tests");
  console.log("=".repeat(60));
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const [slug, expected] of TEST_CASES) {
    let actual;
    try {
      actual = await resolveSlug(slug);
    } catch (err) {
      actual = `ERROR: ${err.message}`;
    }

    const ok = actual === expected;
    const icon = ok ? "✅ PASS" : "❌ FAIL";
    const line = `${icon}  ${slug.padEnd(35)} expected=${expected}, got=${actual}`;
    console.log(line);

    if (ok) {
      passed++;
    } else {
      failed++;
      failures.push({ slug, expected, actual });
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} tests.`);

  if (failures.length > 0) {
    console.log("\nFailed cases:");
    for (const f of failures) {
      console.log(`  • ${f.slug}: expected ${f.expected}, got ${f.actual}`);
    }
    process.exit(1);
  }

  console.log("\nAll tests passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
