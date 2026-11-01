import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { toFormError, type FormError } from "../../lib/errors";
import { LABEL_NAME_MAX_LENGTH } from "../../services/labelService";
import type { LabelColor } from "../../types/label";
import { COLOR_OPTIONS } from "./labelOptions";

interface LabelFormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  initial?: { name: string; color: LabelColor };
  onSubmit: (name: string, color: LabelColor) => Promise<void>;
}

type FormProps = Omit<LabelFormDialogProps, "open" | "title">;

function LabelForm({ submitLabel, onClose, initial, onSubmit }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState<LabelColor>(initial?.color ?? "accent");
  const [error, setError] = useState<FormError>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(name, color);
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
        label="Label name"
        value={name}
        error={error?.field === "name" ? error.message : undefined}
        maxLength={LABEL_NAME_MAX_LENGTH}
        autoFocus
        onChange={(event) => setName(event.target.value)}
      />
      <SelectField
        label="Color"
        value={color}
        options={COLOR_OPTIONS}
        onChange={(event) => setColor(event.target.value as LabelColor)}
      />
      {error && error.field !== "name" && <p className="text-caption text-danger">{error.message}</p>}
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

export function LabelFormDialog({ open, title, onClose, ...formProps }: LabelFormDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      {open && <LabelForm onClose={onClose} {...formProps} />}
    </Dialog>
  );
}
