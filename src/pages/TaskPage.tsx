import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { projectPath, workspacePath } from "../app/navigation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { PriorityBadge } from "../components/ui/PriorityBadge";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SelectField } from "../components/ui/SelectField";
import { StatusBadge } from "../components/ui/StatusBadge";
import { TaskLabelsSection } from "../features/labels/TaskLabelsSection";
import { ChecklistSection } from "../features/tasks/ChecklistSection";
import { NotesSection } from "../features/tasks/NotesSection";
import { TaskFormDialog } from "../features/tasks/TaskFormDialog";
import { useTaskDetail } from "../hooks/useTaskDetail";
import { formatDateTime } from "../lib/dateFormat";
import { getDueInfo } from "../lib/dueDate";
import { describeError } from "../lib/errors";
import type { TaskStatus } from "../types/task";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const LINK_STYLE = "rounded-control text-accent outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent";

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="text-body [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

export function TaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { state, updateTask, setStatus, deleteTask } = useTaskDetail(taskId);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading task…</EmptyMessage>;
  if (state.kind === "notFound") return <PlaceholderNotice message="This task does not exist." />;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;

  const task = state.data;
  const due = task.dueDate && task.status !== "done" ? getDueInfo(task.dueDate) : undefined;

  async function changeStatus(status: TaskStatus) {
    setBusy(true);
    setActionError(undefined);
    try {
      await setStatus(status);
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setActionError(undefined);
    try {
      await deleteTask();
      setConfirmDeleteOpen(false);
      navigate(projectPath(task.projectId));
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-title font-bold [overflow-wrap:anywhere]">{task.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {due && <Badge tone={due.tone}>{due.label}</Badge>}
            </div>
          </div>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit task
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <SectionHeading>Description</SectionHeading>
            <Card>
              {task.description ? (
                <p className="text-body whitespace-pre-line [overflow-wrap:anywhere]">{task.description}</p>
              ) : (
                <EmptyMessage>No description yet. Use “Edit task” to add one.</EmptyMessage>
              )}
            </Card>
          </section>
          <ChecklistSection taskId={task.id} />
          <NotesSection taskId={task.id} />
        </div>

        <section className="flex flex-col gap-3">
          <SectionHeading>Properties</SectionHeading>
          <Card>
            <div className="flex flex-col gap-4">
              <SelectField
                label="Status"
                value={task.status}
                options={STATUS_OPTIONS}
                disabled={busy}
                onChange={(event) => void changeStatus(event.target.value as TaskStatus)}
              />
              <TaskLabelsSection taskId={task.id} />
              <dl className="flex flex-col gap-3">
                <Property label="Priority">
                  <PriorityBadge priority={task.priority} />
                </Property>
                <Property label="Deadline">{task.dueDate ?? "No deadline"}</Property>
                <Property label="Project">
                  <Link to={projectPath(task.projectId)} className={LINK_STYLE}>
                    {task.projectName}
                  </Link>
                </Property>
                <Property label="Workspace">
                  <Link to={workspacePath(task.workspaceId)} className={LINK_STYLE}>
                    {task.workspaceName}
                  </Link>
                </Property>
                <Property label="Assigned to">{task.assigneeName ?? "Nobody"}</Property>
                <Property label="Created">{formatDateTime(task.createdAt)}</Property>
                <Property label="Last changed">{formatDateTime(task.updatedAt)}</Property>
                {task.completedAt && <Property label="Completed">{formatDateTime(task.completedAt)}</Property>}
              </dl>
              {actionError && !confirmDeleteOpen && <p className="text-caption text-danger">{actionError}</p>}
            </div>
          </Card>
        </section>
      </div>

      <div className="border-t border-border pt-6">
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            setConfirmDeleteOpen(true);
            setActionError(undefined);
          }}
        >
          Delete task
        </Button>
      </div>

      <TaskFormDialog
        open={editOpen}
        title="Edit task"
        submitLabel="Save"
        initial={{ title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate }}
        onClose={() => setEditOpen(false)}
        onSubmit={updateTask}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this task?"
        message={`“${task.title}” will be deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        error={actionError}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
