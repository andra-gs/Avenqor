import { Card } from "../components/ui/Card";
import { ListRow } from "../components/ui/ListRow";
import { SectionHeading } from "../components/ui/SectionHeading";
import { BackupSection } from "../features/backup/BackupSection";
import { ReminderSection } from "../features/reminders/ReminderSection";
import { ProfileEditor } from "../features/profile/ProfileEditor";
import { WorkspaceManager } from "../features/workspaces/WorkspaceManager";
import { useDatabaseStatus, type DatabaseStatusState } from "../hooks/useDatabaseStatus";
import { pluralize } from "../lib/text";

function describeDatabase(state: DatabaseStatusState): string {
  if (state.kind === "loading") return "Checking the database…";
  if (state.kind === "error") return `Not available: ${state.message}`;
  const { schemaVersion, tableCount, foreignKeysEnabled, rowCounts } = state.status;
  const rows = `${pluralize(rowCounts.workspaces, "workspace")}, ${pluralize(rowCounts.projects, "project")}, ${pluralize(rowCounts.tasks, "task")}`;
  return `Connected · schema version ${schemaVersion ?? "none"} · ${pluralize(tableCount, "table")} · foreign keys ${foreignKeysEnabled ? "on" : "off"} · stored: ${rows}`;
}

export function SettingsPage() {
  const database = useDatabaseStatus();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionHeading>Local profile</SectionHeading>
        <ProfileEditor />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Workspaces</SectionHeading>
        <WorkspaceManager />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Appearance</SectionHeading>
        <Card>
          <div className="flex flex-col gap-3">
            <ListRow title="Theme" subtitle="Light theme only for now." trailing={<span className="text-body font-semibold">Light</span>} />
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Data</SectionHeading>
        <Card>
          <div className="flex flex-col gap-3">
            <ListRow
              title="Storage"
              subtitle="Your data is kept in a database file on this computer. It is not shared with other computers."
            />
            <ListRow title="Database" subtitle={describeDatabase(database)} />
          </div>
        </Card>
      </section>

      <ReminderSection />

      <BackupSection />
    </div>
  );
}
