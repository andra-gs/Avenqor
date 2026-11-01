import { useState } from "react";
import { activityPath } from "../app/navigation";
import { Button } from "../components/ui/Button";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { ActivitySection } from "../features/activity/ActivitySection";
import { MyTasksSection } from "../features/dashboard/MyTasksSection";
import { RecentProjectsSection } from "../features/dashboard/RecentProjectsSection";
import { WorkspacesSection } from "../features/dashboard/WorkspacesSection";
import { ProjectFormDialog } from "../features/projects/ProjectFormDialog";
import { useDashboardData } from "../hooks/useDashboardData";
import { useLocalProfile } from "../hooks/useLocalProfile";
import { getGreeting } from "../lib/greeting";

// The page only arranges sections. Data comes from a hook; the look comes from shared components.
export function DashboardPage() {
  const { state, createProject } = useDashboardData();
  const { profile } = useLocalProfile();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading dashboard…</EmptyMessage>;
  if (state.kind !== "ready") {
    return <PlaceholderNotice message={state.kind === "error" ? state.message : "The dashboard is not available."} />;
  }

  const data = state.data;
  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-display font-bold">{profile.displayName ? `${greeting}, ${profile.displayName}` : greeting}</h2>
          <p className="text-body text-ink-muted">Here’s what needs your attention today.</p>
        </div>
        <Button
          icon="plus"
          disabled={data.workspaces.length === 0}
          title={data.workspaces.length === 0 ? "Create a workspace in Settings first" : undefined}
          onClick={() => setNewProjectOpen(true)}
        >
          New Project
        </Button>
      </div>

      <WorkspacesSection workspaces={data.workspaces} />
      <RecentProjectsSection projects={data.recentProjects} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <MyTasksSection tasks={data.myTasks} />
        </div>
        <ActivitySection entries={data.activity} viewAllTo={activityPath({ kind: "all" })} />
      </div>

      <ProjectFormDialog
        open={newProjectOpen}
        title="New project"
        submitLabel="Create project"
        onClose={() => setNewProjectOpen(false)}
        workspaces={data.workspaces}
        onSubmit={(name, description, workspaceId) => createProject(workspaceId ?? "", name, description)}
      />
    </div>
  );
}
