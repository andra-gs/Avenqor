import { useState, type FormEvent } from "react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { TextArea } from "../../components/ui/TextArea";
import { useTaskNotes } from "../../hooks/useTaskNotes";
import { formatDateTime } from "../../lib/dateFormat";
import { describeError } from "../../lib/errors";
import { NOTE_MAX_LENGTH } from "../../services/noteService";
import type { TaskNote } from "../../types/taskExtras";

// Personal notes on a task, newest first. They are stored on this computer only; this is not a comment
// thread between people.
export function NotesSection({ taskId }: { taskId: string }) {
  const { state, addNote, editNote, deleteNote } = useTaskNotes(taskId);
  const [newBody, setNewBody] = useState("");
  const [addError, setAddError] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [editBody, setEditBody] = useState("");
  const [editError, setEditError] = useState<string>();
  const [deleting, setDeleting] = useState<TaskNote>();
  const [deleteError, setDeleteError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAddError(undefined);
    try {
      await addNote(newBody);
      setNewBody("");
    } catch (error) {
      setAddError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setBusy(true);
    setEditError(undefined);
    try {
      await editNote(editingId, editBody);
      setEditingId(undefined);
    } catch (error) {
      setEditError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    setDeleteError(undefined);
    try {
      await deleteNote(deleting.id);
      setDeleting(undefined);
    } catch (error) {
      setDeleteError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  const notes = state?.kind === "ready" ? state.data : [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Notes</SectionHeading>
      <Card>
        <div className="flex flex-col gap-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <TextArea
              label="New note"
              value={newBody}
              maxLength={NOTE_MAX_LENGTH}
              error={addError}
              onChange={(event) => setNewBody(event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                Save note
              </Button>
            </div>
          </form>

          {state?.kind === "error" && <p className="text-body text-danger">{state.message}</p>}
          {state?.kind === "ready" && notes.length === 0 && <EmptyMessage>No notes yet.</EmptyMessage>}
          {notes.length > 0 && (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note.id} className="rounded-control bg-surface-muted p-3.5">
                  {editingId === note.id ? (
                    <form onSubmit={handleEdit} className="flex flex-col gap-3">
                      <TextArea
                        label="Note"
                        value={editBody}
                        maxLength={NOTE_MAX_LENGTH}
                        error={editError}
                        autoFocus
                        onChange={(event) => setEditBody(event.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" disabled={busy} onClick={() => setEditingId(undefined)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={busy}>
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-body whitespace-pre-line [overflow-wrap:anywhere]">{note.body}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-caption text-ink-muted">
                          {note.authorName ?? "Unknown"} · {formatDateTime(note.createdAt)}
                          {note.updatedAt !== note.createdAt && " · edited"}
                        </p>
                        <ActionMenu
                          label="Actions for this note"
                          disabled={busy}
                          items={[
                            {
                              label: "Edit",
                              onSelect: () => {
                                setEditingId(note.id);
                                setEditBody(note.body);
                                setEditError(undefined);
                              },
                            },
                            {
                              label: "Delete",
                              tone: "danger",
                              onSelect: () => {
                                setDeleting(note);
                                setDeleteError(undefined);
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
      <ConfirmDialog
        open={deleting !== undefined}
        title="Delete this note?"
        message="The note will be deleted. This cannot be undone."
        confirmLabel="Delete note"
        error={deleteError}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(undefined)}
      />
    </section>
  );
}
