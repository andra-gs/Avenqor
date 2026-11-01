import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { activityPath, boardPath, workspacePath } from "../app/navigation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ActivitySection } from "../features/activity/ActivitySection";
import { ProjectDocumentsSection } from "../features/documents/ProjectDocumentsSection";
import { ProjectLabelsSection } from "../features/labels/ProjectLabelsSection";
import { ProjectFormDialog } from "../features/projects/ProjectFormDialog";
import { TaskFormDialog } from "../features/tasks/TaskFormDialog";
import { TaskList } from "../features/tasks/TaskList";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { describeError } from "../lib/errors";

export function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, createTask, updateTask, updateProject, setTaskDone, deleteTask, setProjectStatus, deleteProject, createLabel, updateLabel, deleteLabel } =
    useProjectDetail(projectId);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading project…</EmptyMessage>;
  if (state.kind === "notFound") return <PlaceholderNotice message="This project does not exist." />;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;

  const project = state.data;
  const archived = project.status === "archived";

  async function toggleArchive() {
    setBusy(true);
    setActionError(undefined);
    try {
      await setProjectStatus(archived ? "active" : "archived");
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
      await deleteProject();
      setConfirmDeleteOpen(false);
      navigate(workspacePath(project.workspaceId));
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-title font-bold break-words">{project.name}</h2>
            <p className="mt-1 text-caption whitespace-pre-line text-ink-muted break-words">{project.description}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => navigate(boardPath(project.id))}>
              Open board
            </Button>
            <Button variant="secondary" onClick={() => setEditProjectOpen(true)}>
              Edit project
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{project.progressPercent}% complete</Badge>
          <Badge tone={archived ? "neutral" : "success"}>{archived ? "Archived" : "Active"}</Badge>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionHeading>Progress</SectionHeading>
        <Card>
          <p className="text-caption text-ink-muted">Overall progress</p>
          <p className="mt-1 text-display font-bold">{project.progressPercent}%</p>
          <div className="mt-4">
            <ProgressBar value={project.progressPercent} label={`${project.name} overall progress`} size="lg" />
          </div>
          <p className="mt-3 text-caption text-ink-muted">
            {project.completedTaskCount} of {project.taskCount} tasks completed
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading>Tasks</SectionHeading>
          <Button icon="plus" onClick={() => setNewTaskOpen(true)}>
            New Task
          </Button>
        </div>
        <TaskList tasks={project.tasks} onSetDone={setTaskDone} onDelete={deleteTask} onUpdate={updateTask} />
      </section>

      <ProjectDocumentsSection projectId={project.id} />

      <ProjectLabelsSection labels={project.labels} onCreate={createLabel} onUpdate={updateLabel} onDelete={deleteLabel} />

      <ActivitySection entries={project.activity} viewAllTo={activityPath({ kind: "project", id: project.id })} />

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <div className="flex gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => void toggleArchive()}>
            {archived ? "Restore project" : "Archive project"}
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              setConfirmDeleteOpen(true);
              setActionError(undefined);
            }}
          >
            Delete project
          </Button>
        </div>
        {actionError && !confirmDeleteOpen && <p className="text-caption text-danger">{actionError}</p>}
      </div>

      <TaskFormDialog
        open={newTaskOpen}
        title="New task"
        submitLabel="Create task"
        onClose={() => setNewTaskOpen(false)}
        onSubmit={createTask}
      />
      <ProjectFormDialog
        open={editProjectOpen}
        title="Edit project"
        submitLabel="Save"
        initial={{ name: project.name, description: project.description }}
        onClose={() => setEditProjectOpen(false)}
        onSubmit={updateProject}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this project?"
        message={`“${project.name}” and all of its tasks will be deleted. This cannot be undone.`}
        confirmLabel="Delete project"
        error={actionError}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
