import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { useBackup } from "../../hooks/useBackup";
import { formatDateTime } from "../../lib/dateFormat";
import { ValidationError } from "../../lib/errors";
import type { RestorePreview } from "../../services/backupService";

interface RestoreDialogProps {
  open: boolean;
  preview: RestorePreview;
  onClose: () => void;
}

function describe(error: unknown, action: string): string {
  if (error instanceof ValidationError) return error.message;
  return `${action} failed. (${error instanceof Error ? error.message : String(error)})`;
}

// The last step before data is replaced. The person must first save a safety backup of the data that is
// in the app now; only then can the replace button be used.
function RestoreSteps({ preview, onClose, onBusyChange }: Omit<RestoreDialogProps, "open"> & { onBusyChange: (busy: boolean) => void }) {
  const { exportBackup, restoreBackup } = useBackup();
  const [safetyPath, setSafetyPath] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusyState] = useState(false);
  const [done, setDone] = useState(false);
  // The dialog above must know, so that Escape cannot close it while data is being replaced.
  const setBusy = (value: boolean) => {
    setBusyState(value);
    onBusyChange(value);
  };

  async function handleSafetyBackup() {
    setBusy(true);
    setError(undefined);
    try {
      const result = await exportBackup("safety-backup");
      if (result) setSafetyPath(result.path);
    } catch (failure) {
      setError(describe(failure, "Saving the safety backup"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    setError(undefined);
    try {
      await restoreBackup(preview.backup);
      setDone(true);
      // Every screen keeps what it loaded, so the window is loaded again to show the restored data.
      setTimeout(() => window.location.reload(), 1200);
    } catch (failure) {
      setError(describe(failure, "Restoring"));
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="mt-4 text-body text-success-strong" role="status">
        The backup was restored. Reloading…
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      <p className="text-body text-ink-muted">
        All the data in the app will be replaced by the backup made on {formatDateTime(preview.summary.createdAt)}. Anything created after
        that time and not saved in a backup will be lost.
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-small font-semibold">Step 1: save a safety backup of the data you have now</p>
        <div>
          <Button variant="secondary" disabled={busy || safetyPath !== undefined} onClick={() => void handleSafetyBackup()}>
            {safetyPath ? "Safety backup saved" : "Save safety backup…"}
          </Button>
        </div>
        {safetyPath && <p className="text-caption text-ink-muted [overflow-wrap:anywhere]">Saved to {safetyPath}. Restore it later if you change your mind.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-small font-semibold">Step 2: replace the data</p>
        <p className="text-caption text-ink-muted">If anything goes wrong while replacing, your current data stays as it is.</p>
      </div>
      {error && (
        <p className="text-caption text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" disabled={busy || safetyPath === undefined} onClick={() => void handleRestore()}>
          Replace all data
        </Button>
      </div>
    </div>
  );
}

export function RestoreDialog({ open, preview, onClose }: RestoreDialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} title="Restore this backup?" onClose={onClose} busy={busy}>
      {open && <RestoreSteps preview={preview} onClose={onClose} onBusyChange={setBusy} />}
    </Dialog>
  );
}
