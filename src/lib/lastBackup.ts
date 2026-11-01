// When the person last saved a backup, shown on the Settings page. Kept in the web view's own storage:
// it is a convenience, not project data, so it is not part of the database or of a backup. Storage can be
// empty or unavailable, so every access is guarded and the page works without it.
const KEY = "avenqor.lastBackupAt";

export function readLastBackupAt(): string | undefined {
  try {
    return localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeLastBackupAt(isoTime: string): void {
  try {
    localStorage.setItem(KEY, isoTime);
  } catch {
    // Not available: the date is simply not remembered.
  }
}
