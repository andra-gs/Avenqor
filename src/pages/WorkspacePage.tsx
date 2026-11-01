import { useState } from "react";
import { useParams } from "react-router";
import { activityPath } from "../app/navigation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Stat } from "../components/ui/Stat";
import { ProjectFormDialog } from "../features/projects/ProjectFormDialog";
import { ProjectCard } from "../features/projects/ProjectCard";
import { WorkspaceActivitySection } from "../features/workspaces/WorkspaceActivitySection";
import { useWorkspaceDetail } from "../hooks/useWorkspaceDetail";
import { pluralize } from "../lib/text";

export function WorkspacePage() {
  const { workspaceId } = useParams();
  const { state, createProject } = useWorkspaceDetail(workspaceId);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading workspace…</EmptyMessage>;
  if (state.kind === "notFound") return <PlaceholderNotice message="This workspace does not exist." />;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;

  const workspace = state.data;
  const activeProjects = workspace.projects.filter((project) => project.status === "active").length;
  const deadlineNote = workspace.overdueTaskCount > 0 ? `upcoming · ${workspace.overdueTaskCount} overdue` : "upcoming";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title font-bold">Workspace Overview</h2>
        {/* Renaming is in Settings for now, so this button stays disabled. */}
        <Button variant="secondary" disabled title="Rename workspaces in Settings">
          Edit Workspace
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-4 gap-6">
          <Stat label="Projects" value={activeProjects} note="active projects" noteTone="accent" />
          <Stat
            label="Tasks"
            value={workspace.taskCount}
            note={`${workspace.completedTaskCount} completed`}
            noteTone="info"
          />
          <Stat label="Members" value={workspace.memberCount} note="local member records" />
          <Stat
            label="Deadlines"
            value={workspace.upcomingDeadlineCount}
            note={deadlineNote}
            noteTone={workspace.overdueTaskCount > 0 ? "danger" : "muted"}
          />
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SectionHeading>Projects</SectionHeading>
            <Badge tone="accent">{pluralize(workspace.projects.length, "project")}</Badge>
          </div>
          <Button icon="plus" onClick={() => setNewProjectOpen(true)}>
            New Project
          </Button>
        </div>
        {workspace.projects.length === 0 ? (
          <EmptyMessage>No projects in this workspace yet.</EmptyMessage>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {workspace.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {workspace.archivedProjects.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading>Archived</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            {workspace.archivedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      <WorkspaceActivitySection entries={workspace.activity} viewAllTo={activityPath({ kind: "workspace", id: workspace.id })} />

      <ProjectFormDialog
        open={newProjectOpen}
        title="New project"
        submitLabel="Create project"
        onClose={() => setNewProjectOpen(false)}
        onSubmit={createProject}
      />
    </div>
  );
}
