import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Checkbox } from "../../components/ui/Checkbox";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { TextField } from "../../components/ui/TextField";
import { useReminderSettings } from "../../hooks/useReminderSettings";

// Settings for the deadline reminder: on or off, the time of day, and a test button.
export function ReminderSection() {
  const { settings, message, setEnabled, setTime, sendTest } = useReminderSettings();

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Reminders</SectionHeading>
      <Card>
        <div className="flex flex-col gap-4">
          <Checkbox
            label="Remind me about tasks that are due today or overdue"
            checked={settings.enabled}
            onChange={(event) => void setEnabled(event.target.checked)}
          />
          <div className="flex flex-wrap items-end gap-3">
            <TextField label="Remind me at" type="time" value={settings.time} onChange={(event) => setTime(event.target.value)} />
            <div className="pb-5">
              <Button variant="secondary" onClick={() => void sendTest()}>
                Send a test notification
              </Button>
            </div>
          </div>
          {message && <p className={message.isError ? "text-caption text-danger" : "text-caption text-ink-muted"}>{message.text}</p>}
          <ul className="list-disc space-y-1 pl-5 text-caption text-ink-muted">
            <li>You get one notification a day, at that time or when you open Avenqor after it. It counts your own tasks that are not done.</li>
            <li>Reminders appear only while Avenqor is open. Nothing runs in the background after you close it.</li>
            <li>Windows shows notifications for installed apps. When you run Avenqor from the development tool, they carry the name of PowerShell.</li>
            <li>Windows can silence notifications (Focus Assist or Do not disturb). The setting is kept on this computer only and is not part of a backup.</li>
          </ul>
        </div>
      </Card>
    </section>
  );
}
