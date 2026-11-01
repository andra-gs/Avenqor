import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

// The only place that talks to the Windows notification system (the Tauri notification plugin).
// Windows shows notifications only for an installed app: in `npm run tauri dev` they carry the name and
// icon of PowerShell instead of Avenqor's.

// True when the app may show notifications; asks once if that was not decided yet.
export async function ensureNotificationPermission(): Promise<boolean> {
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}

// Shows a notification. Returns false when the permission is missing, so the caller can say so.
export async function showNotification(title: string, body: string): Promise<boolean> {
  if (!(await ensureNotificationPermission())) return false;
  sendNotification({ title, body });
  return true;
}
