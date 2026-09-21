export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "In Progress",
  "Waiting for Client",
  "Completed",
  "Closed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
