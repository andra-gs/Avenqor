import { todayDateText } from "../lib/dueDate";
import { showNotification } from "../lib/notifications";
import {
  readLastReminderDate,
  readReminderSettings,
  writeLastReminderDate,
  type ReminderSettings,
} from "../lib/reminderSettings";
import type { MyTask } from "../types/myTasks";
import { getMyTasks } from "./myTasksService";

export interface ReminderMessage {
  title: string;
  body: string;
}

const MAX_TITLES = 3;

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// True when a reminder should be handled now: reminders are on, it is the chosen time or later, and
// today's reminder was not handled yet. A person who opens the app after the chosen time still gets it.
export function isReminderDue(now: Date, settings: ReminderSettings, lastHandledDay: string | undefined): boolean {
  if (!settings.enabled) return false;
  if (lastHandledDay === todayDateText(now)) return false;
  return now.getHours() * 60 + now.getMinutes() >= minutesOfDay(settings.time);
}

// One message for all tasks that need attention: not done, and due today or overdue. Undefined when there
// are none. `today` is "YYYY-MM-DD".
export function buildReminderMessage(tasks: MyTask[], today: string): ReminderMessage | undefined {
  const open = tasks.filter((task) => task.status !== "done" && task.dueDate !== undefined);
  const dueToday = open.filter((task) => task.dueDate === today);
  const overdue = open.filter((task) => (task.dueDate as string) < today);
  if (dueToday.length === 0 && overdue.length === 0) return undefined;

  const parts: string[] = [];
  if (dueToday.length > 0) parts.push(`${dueToday.length} due today`);
  if (overdue.length > 0) parts.push(`${overdue.length} overdue`);

  // Titles of the tasks due today come first, then the overdue ones.
  const titles = [...dueToday, ...overdue].map((task) => task.title);
  const shown = titles.slice(0, MAX_TITLES).join(", ");
  const more = titles.length > MAX_TITLES ? ` and ${titles.length - MAX_TITLES} more` : "";
  return { title: "Avenqor: tasks need attention", body: `${parts.join(" · ")}\n${shown}${more}` };
}

// Called every minute while the app is open. Shows at most one reminder per day.
export async function checkReminders(now: Date = new Date()): Promise<void> {
  if (!isReminderDue(now, readReminderSettings(), readLastReminderDate())) return;
  // Marked first, so a slow or failing check is not repeated every minute.
  writeLastReminderDate(todayDateText(now));
  const message = buildReminderMessage(await getMyTasks(), todayDateText(now));
  if (message) await showNotification(message.title, message.body);
}

// The test button in Settings: shows a notification at once. False when the permission is missing.
export function sendTestReminder(): Promise<boolean> {
  return showNotification("Avenqor: reminders work", "This is how a deadline reminder looks.");
}
