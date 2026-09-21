export function sanitizeSearchTerm(raw: string): string {
  let clean = raw.trim().slice(0, 100);

  // Remove " \ * % and control characters [\x00-\x1F\x7F]
  clean = clean.replace(/["\\*%]/g, "");
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/[\x00-\x1F\x7F]/g, "");

  // Collapse whitespace
  clean = clean.replace(/\s+/g, " ");

  return clean.trim();
}
