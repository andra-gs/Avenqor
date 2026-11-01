import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { ActionMenu } from "../../components/ui/ActionMenu";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { SelectField } from "../../components/ui/SelectField";
import { LabelBadges } from "../labels/LabelBadges";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { taskPath } from "../../app/navigation";
import { getDueInfo } from "../../lib/dueDate";
import { describeError } from "../../lib/errors";
import { filterTasks, hasTaskFilters, NO_TASK_FILTERS, type TaskFilters } from "../../services/taskService";
import { TASK_STATUS_LABELS, TASK_STATUSES, type TaskItem, type TaskPriority, type TaskStatus } from "../../types/task";
import { TaskFormDialog } from "./TaskFormDialog";

interface TaskListProps {
  tasks: TaskItem[];
  onSetDone: (taskId: string, done: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onUpdate: (taskId: string, title: string, priority: TaskPriority, dueDate: string, description: string) => Promise<void>;
}

export function TaskList({ tasks, onSetDone, onDelete, onUpdate }: TaskListProps) {
  const [editing, setEditing] = useState<TaskItem>();
  const [deleting, setDeleting] = useState<TaskItem>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(NO_TASK_FILTERS);

  async function run(action: () => Promise<void>, onSuccess?: () => void) {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      onSuccess?.();
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }

  // The labels that at least one task carries, once each, for the label choice.
  const usedLabels = [...new Map(tasks.flatMap((task) => task.labels).map((label) => [label.id, label])).values()];
  // A label that no task carries any more cannot match anything, so that choice is dropped.
  const activeFilters = usedLabels.some((label) => label.id === filters.labelId) ? filters : { ...filters, labelId: "all" };
  const shown = filterTasks(tasks, activeFilters);

  return (
    <Card>
      {tasks.length > 0 && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <SelectField
            label="Status"
            value={activeFilters.status}
            onChange={(event) => setFilters({ ...activeFilters, status: event.target.value as TaskStatus | "all" })}
            options={[{ value: "all", label: "All statuses" }, ...TASK_STATUSES.map((status) => ({ value: status, label: TASK_STATUS_LABELS[status] }))]}
          />
          <SelectField
            label="Priority"
            value={activeFilters.priority}
            onChange={(event) => setFilters({ ...activeFilters, priority: event.target.value as TaskPriority | "all" })}
            options={[
              { value: "all", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
          <SelectField
            label="Label"
            value={activeFilters.labelId}
            onChange={(event) => setFilters({ ...activeFilters, labelId: event.target.value })}
            options={[{ value: "all", label: "All labels" }, ...usedLabels.map((label) => ({ value: label.id, label: label.name }))]}
          />
          {hasTaskFilters(activeFilters) && (
            <Button variant="secondary" onClick={() => setFilters(NO_TASK_FILTERS)}>
              Clear filters
            </Button>
          )}
        </div>
      )}
      {tasks.length === 0 ? (
        <EmptyMessage>No tasks yet.</EmptyMessage>
      ) : shown.length === 0 ? (
        <EmptyMessage>No tasks match these filters.</EmptyMessage>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((task) => {
            const done = task.status === "done";
            const due = task.dueDate && !done ? getDueInfo(task.dueDate) : undefined;
            return (
              <ListRow
                key={task.id}
                title={task.title}
                titleTo={taskPath(task.id)}
                subtitle={task.labels.length > 0 ? <div className="mt-1 flex flex-wrap gap-1.5"><LabelBadges labels={task.labels} /></div> : undefined}
                trailing={
                  <div className="flex items-center gap-2">
                    {due && <Badge tone={due.tone}>{due.label}</Badge>}
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <ActionMenu
                      label={`Actions for ${task.title}`}
                      disabled={busy}
                      items={[
                        { label: "Edit", onSelect: () => setEditing(task) },
                        { label: done ? "Reopen task" : "Mark done", onSelect: () => void run(() => onSetDone(task.id, !done)) },
                        {
                          label: "Delete",
                          tone: "danger",
                          onSelect: () => {
                            setDeleting(task);
                            setError(undefined);
                          },
                        },
                      ]}
                    />
                  </div>
                }
              />
            );
          })}
        </div>
      )}
      {error && !deleting && <p className="mt-3 text-caption text-danger">{error}</p>}

      <TaskFormDialog
        open={editing !== undefined}
        title="Edit task"
        submitLabel="Save"
        initial={
          editing
            ? { title: editing.title, description: editing.description, priority: editing.priority, dueDate: editing.dueDate }
            : undefined
        }
        onClose={() => setEditing(undefined)}
        onSubmit={(title, priority, dueDate, description) =>
          editing ? onUpdate(editing.id, title, priority, dueDate, description) : Promise.resolve()
        }
      />
      <ConfirmDialog
        open={deleting !== undefined}
        title="Delete this task?"
        message={`“${deleting?.title ?? ""}” will be deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        error={error}
        busy={busy}
        onConfirm={() => deleting && void run(() => onDelete(deleting.id), () => setDeleting(undefined))}
        onCancel={() => setDeleting(undefined)}
      />
    </Card>
  );
}
