import { matchPath } from "react-router";
import type { IconName } from "../components/icons/Icon";
import { pluralize } from "../lib/text";
import type { ActivityScope } from "../types/activity";
import type { ProjectDetail } from "../types/project";
import type { TaskDetail } from "../types/task";
import type { WorkspaceDetail } from "../types/workspace";

// The single list of sidebar destinations. The sidebar and the top bar both read it.
export interface NavItem {
  path: string;
  label: string;
  subtitle: string;
  icon: IconName;
}

export const MAIN_NAV: NavItem[] = [
  { path: "/", label: "Dashboard", subtitle: "Your work, projects, and activity in one place", icon: "dashboard" },
  { path: "/my-tasks", label: "My Tasks", subtitle: "Tasks assigned to you", icon: "tasks" },
  { path: "/calendar", label: "Calendar", subtitle: "Deadlines and schedule", icon: "calendar" },
  { path: "/documents", label: "Documents", subtitle: "Notes and project documentation", icon: "documents" },
];

export const FOOTER_NAV: NavItem[] = [
  { path: "/settings", label: "Settings", subtitle: "Preferences", icon: "settings" },
  { path: "/help", label: "Help & feedback", subtitle: "Help and feedback", icon: "help" },
];

const WORKSPACE_PATH_PATTERN = "/workspaces/:workspaceId";
const PROJECT_PATH_PATTERN = "/projects/:projectId";
const BOARD_PATH_PATTERN = "/projects/:projectId/board";
const TASK_PATH_PATTERN = "/tasks/:taskId";
const DOCUMENT_PATH_PATTERN = "/documents/:documentId";
const ALL_ACTIVITY_PATH_PATTERN = "/activity";
const WORKSPACE_ACTIVITY_PATH_PATTERN = "/workspaces/:workspaceId/activity";
const PROJECT_ACTIVITY_PATH_PATTERN = "/projects/:projectId/activity";

export function workspacePath(workspaceId: string): string {
  return `/workspaces/${workspaceId}`;
}

export function projectPath(projectId: string): string {
  return `/projects/${projectId}`;
}

// The workspace or project id in an address, or undefined when the address is another page.
export function getWorkspaceIdFromPath(pathname: string): string | undefined {
  return (
    matchPath(WORKSPACE_PATH_PATTERN, pathname)?.params.workspaceId ??
    matchPath(WORKSPACE_ACTIVITY_PATH_PATTERN, pathname)?.params.workspaceId
  );
}

// The address of the full activity list of everything, one workspace, or one project.
export function activityPath(scope: ActivityScope): string {
  if (scope.kind === "workspace") return `/workspaces/${scope.id}/activity`;
  if (scope.kind === "project") return `/projects/${scope.id}/activity`;
  return "/activity";
}

export function taskPath(taskId: string): string {
  return `/tasks/${taskId}`;
}

export function getTaskIdFromPath(pathname: string): string | undefined {
  return matchPath(TASK_PATH_PATTERN, pathname)?.params.taskId;
}

export function documentPath(documentId: string): string {
  return `/documents/${documentId}`;
}

export function getDocumentIdFromPath(pathname: string): string | undefined {
  return matchPath(DOCUMENT_PATH_PATTERN, pathname)?.params.documentId;
}

export function boardPath(projectId: string): string {
  return `/projects/${projectId}/board`;
}

// The project page, its board, and its activity list all belong to one project, so all give its id.
export function getProjectIdFromPath(pathname: string): string | undefined {
  return (
    matchPath(PROJECT_PATH_PATTERN, pathname)?.params.projectId ??
    matchPath(BOARD_PATH_PATTERN, pathname)?.params.projectId ??
    matchPath(PROJECT_ACTIVITY_PATH_PATTERN, pathname)?.params.projectId
  );
}

// One step of the path shown in the title bar. The last step has no link because it is the current page.
export interface Breadcrumb {
  label: string;
  to?: string;
}

interface BreadcrumbContext {
  workspaceName?: string;
  project?: ProjectDetail;
  task?: TaskDetail;
  // Title of the open document, once it is known.
  documentTitle?: string;
}

// The path to the current page, for example Workspace > Project > Board.
export function getBreadcrumbs(pathname: string, context: BreadcrumbContext): Breadcrumb[] {
  const item = [...MAIN_NAV, ...FOOTER_NAV].find((navItem) => navItem.path === pathname);
  if (item) return [{ label: item.label }];

  if (matchPath(ALL_ACTIVITY_PATH_PATTERN, pathname)) return [{ label: "Activity" }];

  const workspaceId = getWorkspaceIdFromPath(pathname);
  if (workspaceId && matchPath(WORKSPACE_ACTIVITY_PATH_PATTERN, pathname)) {
    return [{ label: context.workspaceName ?? "Workspace", to: workspacePath(workspaceId) }, { label: "Activity" }];
  }
  if (workspaceId) return [{ label: context.workspaceName ?? "Workspace" }];

  if (getDocumentIdFromPath(pathname)) {
    return [{ label: "Documents", to: "/documents" }, { label: context.documentTitle ?? "Document" }];
  }

  if (getTaskIdFromPath(pathname)) {
    const { task } = context;
    if (!task) return [{ label: "Task" }];
    return [
      { label: task.workspaceName, to: workspacePath(task.workspaceId) },
      { label: task.projectName, to: projectPath(task.projectId) },
      { label: task.title },
    ];
  }

  const projectId = getProjectIdFromPath(pathname);
  if (projectId) {
    const { project } = context;
    const trail: Breadcrumb[] = [];
    if (project) trail.push({ label: context.workspaceName ?? "Workspace", to: workspacePath(project.workspaceId) });
    const onBoard = matchPath(BOARD_PATH_PATTERN, pathname) !== null;
    const onActivity = matchPath(PROJECT_ACTIVITY_PATH_PATTERN, pathname) !== null;
    const projectLabel = project?.name ?? "Project";
    trail.push(onBoard || onActivity ? { label: projectLabel, to: projectPath(projectId) } : { label: projectLabel });
    if (onBoard) trail.push({ label: "Board" });
    if (onActivity) trail.push({ label: "Activity" });
    return trail;
  }
  return [{ label: "Page not found" }];
}

interface HeadingContext {
  workspace?: WorkspaceDetail;
  project?: ProjectDetail;
  task?: TaskDetail;
}

// Title and subtitle shown in the top bar for the current address.
export function getPageHeading(pathname: string, context: HeadingContext): { title: string; subtitle: string } {
  const item = [...MAIN_NAV, ...FOOTER_NAV].find((navItem) => navItem.path === pathname);
  if (item) {
    return { title: item.label, subtitle: item.subtitle };
  }
  const { workspace, project, task } = context;
  if (matchPath(ALL_ACTIVITY_PATH_PATTERN, pathname)) return { title: "Activity", subtitle: "Everything that changed, newest first" };
  if (matchPath(WORKSPACE_ACTIVITY_PATH_PATTERN, pathname)) {
    return { title: "Activity", subtitle: workspace ? `${workspace.name} · newest first` : "Newest first" };
  }
  if (matchPath(PROJECT_ACTIVITY_PATH_PATTERN, pathname)) {
    return { title: "Activity", subtitle: project ? `${project.name} · newest first` : "Newest first" };
  }
  if (getDocumentIdFromPath(pathname)) return { title: "Documents", subtitle: "Notes and project documentation" };
  if (getTaskIdFromPath(pathname)) {
    return { title: "Task Details", subtitle: task ? `${task.projectName} · ${task.workspaceName}` : "" };
  }
  if (getWorkspaceIdFromPath(pathname)) {
    // Until the workspace is loaded (or if it does not exist) only a general title is shown.
    if (!workspace) return { title: "Workspace", subtitle: "" };
    return {
      title: workspace.name,
      subtitle: `Workspace · ${pluralize(workspace.memberCount, "member")} · ${pluralize(workspace.projects.length, "project")}`,
    };
  }
  if (matchPath(BOARD_PATH_PATTERN, pathname)) {
    return { title: "Board", subtitle: project ? `${project.name} · ${project.status}` : "" };
  }
  if (getProjectIdFromPath(pathname)) {
    return { title: "Project Overview", subtitle: project ? `${project.name} · ${project.status}` : "" };
  }
  return { title: "Page not found", subtitle: "" };
}
