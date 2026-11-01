import { useState } from "react";
import { describeError } from "../lib/errors";
import { ensureNotificationPermission } from "../lib/notifications";
import { isValidReminderTime, readReminderSettings, writeReminderSettings } from "../lib/reminderSettings";
import { sendTestReminder } from "../services/reminderService";

// The reminder settings of the Settings page. `message` tells the person what happened after an action.
export function useReminderSettings() {
  const [settings, setSettings] = useState(readReminderSettings);
  const [message, setMessage] = useState<{ text: string; isError: boolean }>();

  function save(next: typeof settings) {
    setSettings(next);
    writeReminderSettings(next);
  }

  async function setEnabled(enabled: boolean) {
    setMessage(undefined);
    if (!enabled) {
      save({ ...settings, enabled });
      return;
    }
    try {
      if (await ensureNotificationPermission()) {
        save({ ...settings, enabled });
      } else {
        setMessage({ text: "Windows did not allow notifications for Avenqor. Allow them in Windows Settings, then try again.", isError: true });
      }
    } catch (failure) {
      setMessage({ text: describeError(failure), isError: true });
    }
  }

  function setTime(time: string) {
    // The time box can be empty while the person is typing; that is not saved.
    if (isValidReminderTime(time)) save({ ...settings, time });
    else setSettings({ ...settings, time });
  }

  async function sendTest() {
    setMessage(undefined);
    try {
      const shown = await sendTestReminder();
      setMessage(
        shown
          ? { text: "Test notification sent. If you see nothing, check Windows Focus Assist or Do not disturb.", isError: false }
          : { text: "Windows did not allow notifications for Avenqor.", isError: true },
      );
    } catch (failure) {
      setMessage({ text: describeError(failure), isError: true });
    }
  }

  return { settings, message, setEnabled, setTime, sendTest };
}
