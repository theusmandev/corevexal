export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "In Progress",
  "Waiting for Client",
  "Completed",
  "Closed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && LEAD_STATUSES.some((s) => s === value);
}
