import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Checkbox } from "../../components/ui/Checkbox";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { IconButton } from "../../components/ui/IconButton";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { TextField } from "../../components/ui/TextField";
import { useChecklist } from "../../hooks/useChecklist";
import { describeError } from "../../lib/errors";
import { CHECKLIST_ITEM_MAX_LENGTH, summarizeChecklist } from "../../services/checklistService";

// The checklist of a task: add, tick, rename, and delete items. Deleting an item needs no confirmation
// because it is quick to type again. The progress of the project does not depend on the checklist.
export function ChecklistSection({ taskId }: { taskId: string }) {
  const { state, addItem, renameItem, setItemDone, deleteItem } = useChecklist(taskId);
  const [newText, setNewText] = useState("");
  const [addError, setAddError] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAddError(undefined);
    try {
      await addItem(newText);
      setNewText("");
    } catch (error) {
      setAddError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setBusy(true);
    setEditError(undefined);
    try {
      await renameItem(editingId, editText);
      setEditingId(undefined);
    } catch (error) {
      setEditError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  const items = state?.kind === "ready" ? state.data : [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <SectionHeading>Checklist</SectionHeading>
        <p className="text-caption text-ink-muted">{summarizeChecklist(items)}</p>
      </div>
      <Card>
        <div className="flex flex-col gap-4">
          {state?.kind === "error" && <p className="text-body text-danger">{state.message}</p>}
          {state?.kind === "ready" && items.length === 0 && <EmptyMessage>No checklist items yet.</EmptyMessage>}
          {items.length > 0 && (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id}>
                  {editingId === item.id ? (
                    <form onSubmit={handleRename} className="flex items-start gap-3">
                      <div className="flex-1">
                        <TextField
                          label="Item text"
                          value={editText}
                          maxLength={CHECKLIST_ITEM_MAX_LENGTH}
                          error={editError}
                          autoFocus
                          onChange={(event) => setEditText(event.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 pt-6">
                        <Button type="submit" disabled={busy}>
                          Save
                        </Button>
                        <Button variant="secondary" disabled={busy} onClick={() => setEditingId(undefined)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <Checkbox
                        label={item.text}
                        checked={item.done}
                        disabled={busy}
                        onChange={(event) => void runAction(() => setItemDone(item.id, event.target.checked))}
                      />
                      <div className="flex shrink-0 gap-2">
                        <IconButton
                          icon="pencil"
                          label="Edit item"
                          disabled={busy}
                          onClick={() => {
                            setEditingId(item.id);
                            setEditText(item.text);
                            setEditError(undefined);
                          }}
                        />
                        <IconButton
                          icon="close"
                          label="Delete item"
                          disabled={busy}
                          onClick={() => void runAction(() => deleteItem(item.id))}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {actionError && <p className="text-caption text-danger">{actionError}</p>}
          <form onSubmit={handleAdd} className="flex items-start gap-3">
            <div className="flex-1">
              <TextField
                label="New checklist item"
                value={newText}
                maxLength={CHECKLIST_ITEM_MAX_LENGTH}
                error={addError}
                onChange={(event) => setNewText(event.target.value)}
              />
            </div>
            <div className="pt-6">
              <Button type="submit" icon="plus" disabled={busy}>
                Add
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </section>
  );
}
