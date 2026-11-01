import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { SelectField } from "../../components/ui/SelectField";
import { TextArea } from "../../components/ui/TextArea";
import { TextField } from "../../components/ui/TextField";
import { toFormError, type FormError } from "../../lib/errors";
import { PROJECT_DESCRIPTION_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH } from "../../services/projectService";

interface ProjectFormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  // Values to start with (when editing). Leave out for an empty form.
  initial?: { name: string; description: string };
  // Pass the list when the user must choose the workspace (for example on the Dashboard).
  // Leave it out when the workspace is already known.
  workspaces?: { id: string; name: string }[];
  onSubmit: (name: string, description: string, workspaceId?: string) => Promise<void>;
}

type FormProps = Omit<ProjectFormDialogProps, "open" | "title">;

// The inputs that show their own message. Any other message is shown above the buttons.
const FIELDS = ["name"];

function fieldMessage(error: FormError | undefined, field: string): string | undefined {
  return error?.field === field ? error.message : undefined;
}

function ProjectForm({ submitLabel, onClose, initial, workspaces, onSubmit }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(workspaces?.[0]?.id);
  const [error, setError] = useState<FormError>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(name, description, workspaceId);
      onClose();
    } catch (failure) {
      setError(toFormError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      {workspaces && (
        <SelectField
          label="Workspace"
          value={workspaceId}
          options={workspaces.map((workspace) => ({ value: workspace.id, label: workspace.name }))}
          onChange={(event) => setWorkspaceId(event.target.value)}
        />
      )}
      <TextField
        label="Project name"
        value={name}
        error={fieldMessage(error, "name")}
        maxLength={PROJECT_NAME_MAX_LENGTH}
        autoFocus
        onChange={(event) => setName(event.target.value)}
      />
      <TextArea
        label="Description (optional)"
        value={description}
        maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error && !FIELDS.includes(error.field ?? "") && <p className="text-caption text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// Used to create a project and to edit one. The form is rebuilt each time the window opens.
export function ProjectFormDialog({ open, title, ...formProps }: ProjectFormDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={formProps.onClose}>
      {open && <ProjectForm {...formProps} />}
    </Dialog>
  );
}
