// Shows a stored UTC timestamp (ISO 8601) in the user's own time zone, for example "Oct 28, 2026, 7:04 AM".
export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
