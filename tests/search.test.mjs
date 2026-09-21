import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

function sanitizeSearchTerm(raw) {
  let clean = raw.trim().slice(0, 100);
  clean = clean.replace(/["\\*%]/g, "");
  clean = clean.replace(/[\x00-\x1F\x7F]/g, "");
  clean = clean.replace(/\s+/g, " ");
  return clean.trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

test("sanitizeSearchTerm logic", () => {
  assert.strictEqual(sanitizeSearchTerm(`%)_('"`), `)_('`);
  assert.strictEqual(sanitizeSearchTerm(`a,b`), `a,b`);
  assert.strictEqual(sanitizeSearchTerm(`*`), ``);
  assert.strictEqual(sanitizeSearchTerm(`\\`), ``);
  assert.strictEqual(sanitizeSearchTerm(`"`), ``);

  const longStr = "a".repeat(300);
  assert.strictEqual(sanitizeSearchTerm(longStr).length, 100);

  assert.strictEqual(sanitizeSearchTerm(``), ``);
  assert.strictEqual(sanitizeSearchTerm(`john_smith@example.com`), `john_smith@example.com`);
  assert.strictEqual(sanitizeSearchTerm(`محمد علي`), `محمد علي`); // Urdu/Arabic name
  assert.strictEqual(sanitizeSearchTerm(`not-a-uuid`), `not-a-uuid`);
  assert.strictEqual(
    sanitizeSearchTerm(`123e4567-e89b-12d3-a456-426614174000`),
    `123e4567-e89b-12d3-a456-426614174000`,
  );
  assert.strictEqual(
    sanitizeSearchTerm(`123E4567-E89B-12D3-A456-426614174000`),
    `123E4567-E89B-12D3-A456-426614174000`,
  );
});

test("Supabase query runner with anon key", async () => {
  const inputs = [
    `%)_('"`,
    `a,b`,
    `*`,
    `\\`,
    `"`,
    "a".repeat(300),
    ``,
    `john_smith@example.com`,
    `محمد علي`,
    `not-a-uuid`,
    `123e4567-e89b-12d3-a456-426614174000`,
    `123E4567-E89B-12D3-A456-426614174000`,
  ];

  for (const input of inputs) {
    const safeSearch = sanitizeSearchTerm(input);
    if (!safeSearch) continue;
    const term = `"%${safeSearch}%"`;

    // Execute query
    const { data, error } = await supabase
      .from("leads")
      .select("id")
      .or(`full_name.ilike.${term},email.ilike.${term},company_name.ilike.${term}`)
      .limit(1);

    assert.ifError(error);
  }
});
