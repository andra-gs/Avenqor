import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { SelectField } from "../../components/ui/SelectField";
import { TextArea } from "../../components/ui/TextArea";
import { TextField } from "../../components/ui/TextField";
import { toFormError, type FormError } from "../../lib/errors";
import { DOCUMENT_BODY_MAX_LENGTH, DOCUMENT_TITLE_MAX_LENGTH, KIND_OPTIONS } from "../../services/documentService";
import type { DocumentKind, DocumentProjectOption } from "../../types/document";

interface DocumentFormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  // The projects to choose from. Leave out when editing: a document stays in its project.
  projects?: DocumentProjectOption[];
  // The project to write in. Without `projects` (no choice shown) it is the project of the new document;
  // with `projects` it is the one chosen at the start.
  initialProjectId?: string;
  initial?: { title: string; kind: DocumentKind; body: string };
  onSubmit: (projectId: string, title: string, kind: DocumentKind, body: string) => Promise<void>;
}

type FormProps = Omit<DocumentFormDialogProps, "open" | "title">;

function DocumentForm({ submitLabel, onClose, projects, initialProjectId, initial, onSubmit }: FormProps) {
  const [projectId, setProjectId] = useState(initialProjectId ?? projects?.[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [kind, setKind] = useState<DocumentKind>(initial?.kind ?? "notes");
  const [body, setBody] = useState(initial?.body ?? "");
  const [error, setError] = useState<FormError>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(projectId, title, kind, body);
      onClose();
    } catch (failure) {
      setError(toFormError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      {projects && (
        <SelectField
          label="Project"
          value={projectId}
          options={projects.map((project) => ({ value: project.id, label: `${project.name} · ${project.workspaceName}` }))}
          onChange={(event) => setProjectId(event.target.value)}
        />
      )}
      <TextField
        label="Document title"
        value={title}
        error={error?.field === "title" ? error.message : undefined}
        maxLength={DOCUMENT_TITLE_MAX_LENGTH}
        autoFocus
        onChange={(event) => setTitle(event.target.value)}
      />
      <SelectField
        label="Type"
        value={kind}
        options={KIND_OPTIONS}
        onChange={(event) => setKind(event.target.value as DocumentKind)}
      />
      <TextArea
        label="Text (optional)"
        value={body}
        maxLength={DOCUMENT_BODY_MAX_LENGTH}
        rows={10}
        onChange={(event) => setBody(event.target.value)}
      />
      {error && error.field !== "title" && <p className="text-caption text-danger">{error.message}</p>}
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

export function DocumentFormDialog({ open, title, onClose, ...formProps }: DocumentFormDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      {open && <DocumentForm onClose={onClose} {...formProps} />}
    </Dialog>
  );
}
