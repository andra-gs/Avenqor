import { useLocation } from "react-router";
import { getPageHeading, getProjectIdFromPath, getTaskIdFromPath, getWorkspaceIdFromPath } from "../../app/navigation";
import { useLocalProfile } from "../../hooks/useLocalProfile";
import { useProjectDetail } from "../../hooks/useProjectDetail";
import { useTaskDetail } from "../../hooks/useTaskDetail";
import { useWorkspaceDetail } from "../../hooks/useWorkspaceDetail";
import { SearchBox } from "../../features/search/SearchBox";
import { Avatar } from "../ui/Avatar";

export function TopBar() {
  const { pathname } = useLocation();
  const { state: workspaceState } = useWorkspaceDetail(getWorkspaceIdFromPath(pathname));
  const workspace = workspaceState?.kind === "ready" ? workspaceState.data : undefined;
  const { state: projectState } = useProjectDetail(getProjectIdFromPath(pathname));
  const project = projectState?.kind === "ready" ? projectState.data : undefined;
  const { state: taskState } = useTaskDetail(getTaskIdFromPath(pathname));
  const task = taskState?.kind === "ready" ? taskState.data : undefined;
  const { profile } = useLocalProfile();
  const heading = getPageHeading(pathname, { workspace, project, task });

  return (
    <header className="flex h-(--layout-topbar-height) shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-9">
      <div className="min-w-0">
        <h1 className="truncate text-title font-bold">{heading.title}</h1>
        <p className="truncate text-small text-ink-muted">{heading.subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <SearchBox />
        <div className="flex items-center gap-3">
          <Avatar initials={profile.initials} />
          <div>
            <p className="text-body font-semibold">{profile.displayName}</p>
            <p className="text-caption text-ink-muted">Local profile</p>
          </div>
        </div>
      </div>
    </header>
  );
}
