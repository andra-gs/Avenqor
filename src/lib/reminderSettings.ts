// The reminder settings, kept in the web view's own storage like the date of the last backup: a
// convenience, not project data, so they are not in the database and not part of a backup (Agreed
// 2026-10-31). Storage can be empty or unavailable, so every access is guarded and the defaults apply.
export interface ReminderSettings {
  enabled: boolean;
  // Time of day as "HH:MM", 24 hours.
  time: string;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = { enabled: false, time: "09:00" };

const SETTINGS_KEY = "avenqor.reminders";
const LAST_DATE_KEY = "avenqor.lastReminderDate";

export function isValidReminderTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function readReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_REMINDER_SETTINGS;
    const { enabled, time } = parsed as Record<string, unknown>;
    return {
      enabled: enabled === true,
      time: typeof time === "string" && isValidReminderTime(time) ? time : DEFAULT_REMINDER_SETTINGS.time,
    };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function writeReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Not available: the settings are simply not remembered.
  }
}

// The day ("YYYY-MM-DD") on which the last reminder was handled, so there is one reminder per day.
export function readLastReminderDate(): string | undefined {
  try {
    return localStorage.getItem(LAST_DATE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeLastReminderDate(day: string): void {
  try {
    localStorage.setItem(LAST_DATE_KEY, day);
  } catch {
    // Not available: a reminder may then be shown again after a restart.
  }
}
