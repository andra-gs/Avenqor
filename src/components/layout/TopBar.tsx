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
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border bg-surface px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 md:h-(--layout-topbar-height) md:flex-nowrap md:px-9 md:py-0">
      <div className="min-w-0 flex-1 md:flex-none">
        <h1 className="truncate text-title font-bold">{heading.title}</h1>
        <p className="truncate text-small text-ink-muted">{heading.subtitle}</p>
      </div>
      {/* On a phone the wrapper disappears (contents) so the search box can take its own row under the title. */}
      <div className="contents md:flex md:shrink-0 md:items-center md:gap-5">
        <SearchBox />
        <div className="flex items-center gap-3">
          <Avatar initials={profile.initials} />
          <div className="hidden md:block">
            <p className="text-body font-semibold">{profile.displayName}</p>
            <p className="text-caption text-ink-muted">Local profile</p>
          </div>
        </div>
      </div>
    </header>
  );
}
