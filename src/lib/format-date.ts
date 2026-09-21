export function formatAdminDate(isoString: string | null | undefined): string {
 if (!isoString) return "N/A";
 try {
 const d = new Date(isoString);
 if (isNaN(d.getTime())) return "Invalid Date";
 return new Intl.DateTimeFormat("en-GB", {
 timeZone: "UTC",
 day: "2-digit",
 month: "short",
 year: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 hour12: false,
 }).format(d) + " UTC";
 } catch (e) {
 return "Invalid Date";
 }
}
