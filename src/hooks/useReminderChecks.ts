import { useEffect } from "react";
import { checkReminders } from "../services/reminderService";

const CHECK_EVERY_MS = 60_000;

// Runs the reminder check once at start and then every minute while the app is open. A failure is only
// written to the console: a missing reminder must never disturb the screens.
export function useReminderChecks() {
  useEffect(() => {
    function run() {
      checkReminders().catch((failure: unknown) => console.error("Reminder check failed", failure));
    }
    run();
    const timer = window.setInterval(run, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, []);
}
