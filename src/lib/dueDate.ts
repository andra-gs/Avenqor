import { toDateText } from "./calendar";

// Turns a deadline into the label and color the interface shows.
// A deadline is a calendar date written "YYYY-MM-DD". The final storage format is decided in Phase 2.
export type DueTone = "danger" | "accent" | "success" | "neutral";

export interface DueInfo {
  label: string;
  tone: DueTone;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Whole days from today to the deadline: negative when it is in the past, 0 for today.
export function getDaysUntil(dueDate: string, now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseLocalDate(dueDate).getTime() - today.getTime()) / MS_PER_DAY);
}

export function getDueInfo(dueDate: string, now: Date = new Date()): DueInfo {
  const due = parseLocalDate(dueDate);
  const days = getDaysUntil(dueDate, now);

  if (days < 0) return { label: `Overdue · ${formatShortDate(due)}`, tone: "danger" };
  if (days === 0) return { label: "Today", tone: "accent" };
  if (days === 1) return { label: "Tomorrow", tone: "success" };
  return { label: formatShortDate(due), tone: "neutral" };
}

// Today's date as "YYYY-MM-DD" in the user's own time zone, the same format as a stored deadline.
export function todayDateText(now: Date = new Date()): string {
  return toDateText(now);
}
