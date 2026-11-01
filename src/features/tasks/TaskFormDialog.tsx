import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { SelectField } from "../../components/ui/SelectField";
import { TextArea } from "../../components/ui/TextArea";
import { TextField } from "../../components/ui/TextField";
import { normalizeDateInput } from "../../lib/calendar";
import { toFormError, type FormError } from "../../lib/errors";
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "../../services/taskService";
import type { TaskPriority } from "../../types/task";

interface TaskFormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  // Values to start with (when editing). Leave out for an empty form with medium priority.
  initial?: { title: string; description: string; priority: TaskPriority; dueDate: string | undefined };
  onSubmit: (title: string, priority: TaskPriority, dueDate: string, description: string) => Promise<void>;
}

type FormProps = Omit<TaskFormDialogProps, "open" | "title">;

// The inputs that show their own message. Any other message is shown above the buttons.
const FIELDS = ["title"];

function fieldMessage(error: FormError | undefined, field: string): string | undefined {
  return error?.field === field ? error.message : undefined;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function TaskForm({ submitLabel, onClose, initial, onSubmit }: FormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [error, setError] = useState<FormError>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(title, priority, dueDate, description);
      onClose();
    } catch (failure) {
      setError(toFormError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <TextField
        label="Task title"
        value={title}
        error={fieldMessage(error, "title")}
        maxLength={TASK_TITLE_MAX_LENGTH}
        autoFocus
        onChange={(event) => setTitle(event.target.value)}
      />
      <TextArea
        label="Description (optional)"
        value={description}
        maxLength={TASK_DESCRIPTION_MAX_LENGTH}
        rows={4}
        onChange={(event) => setDescription(event.target.value)}
      />
      <SelectField
        label="Priority"
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={(event) => setPriority(event.target.value as TaskPriority)}
      />
      <TextField
        label="Deadline (optional)"
        type="date"
        value={dueDate}
        max="9999-12-31"
        onChange={(event) => setDueDate(normalizeDateInput(event.target.value))}
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

// Used to create a task and to edit one. The form is rebuilt each time the window opens.
export function TaskFormDialog({ open, title, ...formProps }: TaskFormDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={formProps.onClose}>
      {open && <TaskForm {...formProps} />}
    </Dialog>
  );
}
