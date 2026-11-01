import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { useBackup } from "../../hooks/useBackup";
import { formatDateTime } from "../../lib/dateFormat";
import { ValidationError } from "../../lib/errors";
import { readLastBackupAt } from "../../lib/lastBackup";
import { pluralize } from "../../lib/text";
import type { RestorePreview } from "../../services/backupService";
import type { BackupSummary } from "../../types/backup";
import { RestoreDialog } from "./RestoreDialog";

// Text for a failed file action: a message about the file is shown as written; anything else is a
// technical problem with the file or the disk.
function describeFileError(error: unknown, action: string): string {
  if (error instanceof ValidationError) return error.message;
  const detail = error instanceof Error ? error.message : String(error);
  return `${action} failed. (${detail})`;
}

export function describeSummary(summary: BackupSummary): string {
  return [
    pluralize(summary.workspaces, "workspace"),
    pluralize(summary.projects, "project"),
    pluralize(summary.tasks, "task"),
    pluralize(summary.documents, "document"),
    pluralize(summary.labels, "label"),
    `${summary.activityEntries} activity ${summary.activityEntries === 1 ? "entry" : "entries"}`,
  ].join(", ");
}

// Backup and restore on the Settings page: save all data to a file, and replace all data with a file.
export function BackupSection() {
  const { exportBackup, previewRestore } = useBackup();
  const [busy, setBusy] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState(readLastBackupAt());
  const [exportMessage, setExportMessage] = useState<{ text: string; failed: boolean }>();
  const [restoreError, setRestoreError] = useState<string>();
  const [preview, setPreview] = useState<RestorePreview>();
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleExport() {
    setBusy(true);
    setExportMessage(undefined);
    try {
      const result = await exportBackup();
      if (!result) return;
      setLastBackupAt(readLastBackupAt());
      setExportMessage({ text: `Backup saved to ${result.path}. It contains ${describeSummary(result.summary)}.`, failed: false });
    } catch (error) {
      setExportMessage({ text: describeFileError(error, "Saving the backup"), failed: true });
    } finally {
      setBusy(false);
    }
  }

  async function handleChooseFile() {
    setBusy(true);
    setRestoreError(undefined);
    try {
      const result = await previewRestore();
      if (!result) return;
      setPreview(result);
    } catch (error) {
      setPreview(undefined);
      setRestoreError(describeFileError(error, "Opening the file"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Backup and restore</SectionHeading>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-body font-semibold">Export backup</h3>
              <Badge tone="success">Recommended</Badge>
            </div>
            <p className="text-small text-ink-muted">
              Saves all your data to one file that you choose: workspaces, projects, tasks with their checklists, notes, and labels,
              documents, and the activity history. Not included: window and sidebar settings.
            </p>
            <div>
              <Button icon="documents" disabled={busy} onClick={() => void handleExport()}>
                Export backup
              </Button>
            </div>
            <p className="text-caption text-ink-muted">
              {lastBackupAt ? `Last backup from this computer: ${formatDateTime(lastBackupAt)}.` : "No backup has been saved from this computer yet."}
            </p>
            {exportMessage && (
              <p className={exportMessage.failed ? "text-caption text-danger" : "text-caption text-success-strong"} role="status">
                {exportMessage.text}
              </p>
            )}
            <p className="text-caption text-ink-muted">
              The file is plain text (JSON) and anyone who can open it can read your data. Keep it somewhere safe.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3">
            <h3 className="text-body font-semibold">Restore from a backup</h3>
            <p className="text-small text-ink-muted">
              Choose a backup file made by Avenqor. The file is checked first and nothing changes until you confirm. Restoring replaces
              all the data in the app with the data in the file.
            </p>
            <div>
              <Button variant="secondary" icon="plus" disabled={busy} onClick={() => void handleChooseFile()}>
                Choose backup file
              </Button>
            </div>
            {restoreError && (
              <p className="text-caption text-danger" role="alert">
                {restoreError}
              </p>
            )}
            {preview && (
              <div className="flex flex-col gap-2 rounded-control bg-surface-muted p-3">
                <p className="text-small font-semibold [overflow-wrap:anywhere]">{preview.path}</p>
                <p className="text-caption text-ink-muted">
                  Made on {formatDateTime(preview.summary.createdAt)}. Contains {describeSummary(preview.summary)}.
                </p>
                <div>
                  <Button variant="danger" disabled={busy} onClick={() => setDialogOpen(true)}>
                    Restore this backup…
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      {preview && <RestoreDialog open={dialogOpen} preview={preview} onClose={() => setDialogOpen(false)} />}
    </section>
  );
}
