import { test } from "node:test";
import assert from "node:assert/strict";
import { services, formationServices, paymentPlatforms } from "../src/lib/services.ts";

test("Service slugs are unique and do not clash with reserved words", () => {
  const reservedWords = ["payment-platforms", "business-formation"];

  const allSlugs = [...reservedWords, ...services.map((s) => s.slug), ...paymentPlatforms];

  const uniqueSlugs = new Set(allSlugs);

  assert.strictEqual(
    uniqueSlugs.size,
    allSlugs.length,
    "Duplicate or clashing slug found across services, platforms, and reserved words",
  );
});
