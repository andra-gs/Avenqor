import { useState } from "react";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { describeError } from "../../lib/errors";
import type { ProjectLabel } from "../../types/label";
import { LabelFormDialog } from "./LabelFormDialog";
import { colorName } from "./labelOptions";

interface ProjectLabelsSectionProps {
  labels: ProjectLabel[];
  onCreate: (name: string, color: string) => Promise<void>;
  onUpdate: (labelId: string, name: string, color: string) => Promise<void>;
  onDelete: (labelId: string) => Promise<void>;
}

function taskCountText(count: number): string {
  return count === 1 ? "1 task" : `${count} tasks`;
}

// The labels of a project: create, rename, recolor, and delete. A label is put on a task from the task page.
export function ProjectLabelsSection({ labels, onCreate, onUpdate, onDelete }: ProjectLabelsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectLabel>();
  const [deleting, setDeleting] = useState<ProjectLabel>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    setError(undefined);
    try {
      await onDelete(deleting.id);
      setDeleting(undefined);
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading>Labels</SectionHeading>
        <Button icon="plus" onClick={() => setCreateOpen(true)}>
          New Label
        </Button>
      </div>
      <Card>
        {labels.length === 0 ? (
          <EmptyMessage>No labels yet. Create one here, or from a task page.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-2">
            {labels.map((label) => (
              <ListRow
                key={label.id}
                title={label.name}
                subtitle={taskCountText(label.taskCount)}
                leading={<Badge tone={label.color}>{colorName(label.color)}</Badge>}
                trailing={
                  <ActionMenu
                    label={`Actions for label ${label.name}`}
                    items={[
                      { label: "Edit", onSelect: () => setEditing(label) },
                      {
                        label: "Delete",
                        tone: "danger",
                        onSelect: () => {
                          setDeleting(label);
                          setError(undefined);
                        },
                      },
                    ]}
                  />
                }
              />
            ))}
          </div>
        )}
      </Card>
      <LabelFormDialog
        open={createOpen}
        title="New label"
        submitLabel="Create label"
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />
      <LabelFormDialog
        open={editing !== undefined}
        title="Edit label"
        submitLabel="Save"
        initial={editing ? { name: editing.name, color: editing.color } : undefined}
        onClose={() => setEditing(undefined)}
        onSubmit={(name, color) => (editing ? onUpdate(editing.id, name, color) : Promise.resolve())}
      />
      <ConfirmDialog
        open={deleting !== undefined}
        title="Delete this label?"
        message={`“${deleting?.name ?? ""}” will be removed from ${taskCountText(deleting?.taskCount ?? 0)}. The tasks stay. This cannot be undone.`}
        confirmLabel="Delete label"
        error={error}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(undefined)}
      />
    </section>
  );
}
