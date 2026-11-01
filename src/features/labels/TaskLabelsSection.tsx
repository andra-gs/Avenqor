import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { SelectField } from "../../components/ui/SelectField";
import { useTaskLabels } from "../../hooks/useTaskLabels";
import { describeError } from "../../lib/errors";
import { LabelFormDialog } from "./LabelFormDialog";

// The labels of a task inside the Properties card: remove one with its cross, add one of the project's
// other labels, or create a new label that is put on the task at once.
export function TaskLabelsSection({ taskId }: { taskId: string }) {
  const { state, attach, detach, createAndAttach } = useTaskLabels(taskId);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }

  if (state?.kind === "error") return <p className="text-caption text-danger">{state.message}</p>;
  if (state?.kind !== "ready") return null;
  const { attached, available } = state.data;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-small font-medium">Labels</p>
      {attached.length === 0 ? (
        <p className="text-caption text-ink-muted">No labels yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {attached.map((label) => (
            <li key={label.id} className="inline-flex items-center">
              <Badge tone={label.color}>{label.name}</Badge>
              <IconButton
                icon="close"
                label={`Remove label ${label.name}`}
                disabled={busy}
                onClick={() => void runAction(() => detach(label.id))}
              />
            </li>
          ))}
        </ul>
      )}
      {available.length > 0 && (
        <SelectField
          label="Add label"
          value=""
          disabled={busy}
          options={[{ value: "", label: "Choose a label…" }, ...available.map((label) => ({ value: label.id, label: label.name }))]}
          onChange={(event) => {
            const labelId = event.target.value;
            if (labelId) void runAction(() => attach(labelId));
          }}
        />
      )}
      <div>
        <Button variant="secondary" icon="plus" disabled={busy} onClick={() => setCreateOpen(true)}>
          Create label
        </Button>
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}
      <LabelFormDialog
        open={createOpen}
        title="Create label"
        submitLabel="Create label"
        onClose={() => setCreateOpen(false)}
        onSubmit={(name, color) => createAndAttach(name, color)}
      />
    </div>
  );
}
