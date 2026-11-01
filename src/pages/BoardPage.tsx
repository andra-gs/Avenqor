import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { projectPath } from "../app/navigation";
import { Button } from "../components/ui/Button";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { BoardColumn } from "../features/board/BoardColumn";
import { TaskFormDialog } from "../features/tasks/TaskFormDialog";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { describeError } from "../lib/errors";
import { pluralize } from "../lib/text";
import { TASK_STATUSES, type TaskStatus } from "../types/task";

const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, createTask, setTaskStatus } = useProjectDetail(projectId);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading board…</EmptyMessage>;
  if (state.kind === "notFound") return <PlaceholderNotice message="This project does not exist." />;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;

  const project = state.data;

  async function move(taskId: string, status: TaskStatus) {
    setBusy(true);
    setError(undefined);
    try {
      await setTaskStatus(taskId, status);
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-title font-bold break-words">{project.name}</h2>
          <p className="text-caption text-ink-muted">
            {pluralize(project.taskCount, "task")} · {project.progressPercent}% complete
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => navigate(projectPath(project.id))}>
            Project overview
          </Button>
          <Button icon="plus" onClick={() => setNewTaskOpen(true)}>
            New Task
          </Button>
        </div>
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}
      <div className="grid auto-cols-[minmax(14rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            title={COLUMN_TITLES[status]}
            status={status}
            tasks={project.tasks.filter((task) => task.status === status)}
            disabled={busy}
            onMove={(taskId, nextStatus) => void move(taskId, nextStatus)}
          />
        ))}
      </div>
      <TaskFormDialog
        open={newTaskOpen}
        title="New task"
        submitLabel="Create task"
        onClose={() => setNewTaskOpen(false)}
        onSubmit={createTask}
      />
    </div>
  );
}
