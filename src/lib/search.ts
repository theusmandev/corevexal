/**
 * sanitizeSearchTerm
 *
 * Safely prepares a user-supplied string for use as a LIKE/ILIKE pattern
 * inside a PostgREST `.ilike()` / `.or()` call.
 *
 * Security contract
 * -----------------
 * We ESCAPE wildcards and structural characters rather than stripping them.
 * Stripping silently mutates user intent (e.g. "O'Brien" becomes "OBrien").
 * Escaping preserves the literal characters the user typed while preventing
 * them from being interpreted as SQL/LIKE meta-syntax.
 *
 * Characters escaped (prefixed with backslash):
 *   • LIKE wildcards   : % _
 *   • SQL string delim : ' "
 *   • Escape char      : \
 *   • PostgREST filter separators that could break the `.or()` argument:
 *       ( ) , *
 *
 * Control characters (U+0000–U+001F, U+007F) are stripped outright because
 * they have no legitimate search meaning and can cause parser confusion.
 *
 * The result is then safe to embed between `%` anchors:
 *   `%${sanitizeSearchTerm(raw)}%`
 *
 * @param raw  Raw user input from a URL query-param or form field.
 * @returns    Sanitized, escaped string ready for ilike pattern interpolation.
 *             Returns an empty string if input is blank or only whitespace.
 */
export function sanitizeSearchTerm(raw: string): string {
  // 1. Trim and hard-cap length to prevent excessively large queries.
  let clean = raw.trim().slice(0, 100);

  // 2. Strip control characters (null bytes, tab, newline, etc.)
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/[\x00-\x1F\x7F]/g, "");

  // 3. Escape backslash FIRST (must precede all other escapes to avoid
  //    double-escaping the escape characters we are about to add).
  clean = clean.replace(/\\/g, "\\\\");

  // 4. Escape LIKE wildcards — prevents the user from crafting broad scans.
  clean = clean.replace(/%/g, "\\%");
  clean = clean.replace(/_/g, "\\_");

  // 5. Escape SQL string delimiters (defence-in-depth; PostgREST also
  //    parameterises values, but we should not rely solely on that).
  clean = clean.replace(/'/g, "\\'");
  clean = clean.replace(/"/g, '\\"');

  // 6. Escape PostgREST `.or()` structural characters so they cannot
  //    break the filter expression syntax.
  //    Ref: https://postgrest.org/en/stable/references/api/tables_views.html#operators
  clean = clean.replace(/\*/g, "\\*");
  clean = clean.replace(/\(/g, "\\(");
  clean = clean.replace(/\)/g, "\\)");
  clean = clean.replace(/,/g, "\\,");

  // 7. Collapse internal runs of whitespace to a single space so that
  //    multi-word queries stay readable and indexed correctly.
  clean = clean.replace(/\s+/g, " ").trim();

  return clean;
}
