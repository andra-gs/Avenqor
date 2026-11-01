import { Fragment } from "react";
import { Link, useLocation } from "react-router";
import {
  getBreadcrumbs,
  getDocumentIdFromPath,
  getProjectIdFromPath,
  getTaskIdFromPath,
  getWorkspaceIdFromPath,
} from "../../app/navigation";
import { useDocumentLibrary } from "../../hooks/useDocuments";
import { useProjectDetail } from "../../hooks/useProjectDetail";
import { useTaskDetail } from "../../hooks/useTaskDetail";
import { useWorkspaceDetail } from "../../hooks/useWorkspaceDetail";
import { APP_NAME } from "../../lib/appInfo";
import { BrandLogo } from "../ui/BrandLogo";
import { WindowControls } from "./WindowControls";

const LINK_STYLE =
  "pointer-events-auto truncate rounded-control px-1 outline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent";

// The strip at the top of the window. It replaces the native Windows title bar, so it has its own color
// (token `titlebar`), the path to the current page, and the window buttons. Dragging an empty part moves
// the window; double-clicking it maximizes. The text ignores the mouse so that a drag can start anywhere on the bar.
export function TitleBar() {
  const { pathname } = useLocation();
  const { state: projectState } = useProjectDetail(getProjectIdFromPath(pathname));
  const project = projectState?.kind === "ready" ? projectState.data : undefined;
  const { state: taskState } = useTaskDetail(getTaskIdFromPath(pathname));
  const task = taskState?.kind === "ready" ? taskState.data : undefined;
  // The path of a project page starts with the workspace the project belongs to.
  const workspaceId = getWorkspaceIdFromPath(pathname) ?? project?.workspaceId;
  const { state: workspaceState } = useWorkspaceDetail(workspaceId);
  const workspaceName = workspaceState?.kind === "ready" ? workspaceState.data.name : undefined;
  const { state: libraryState } = useDocumentLibrary();
  const documentId = getDocumentIdFromPath(pathname);
  const documentTitle =
    libraryState?.kind === "ready" ? libraryState.data.documents.find((document) => document.id === documentId)?.title : undefined;
  const crumbs = getBreadcrumbs(pathname, { workspaceName, project, task, documentTitle });

  return (
    <div
      data-tauri-drag-region
      className="flex h-(--layout-titlebar-height) shrink-0 items-center justify-between gap-3 border-b border-border bg-titlebar pl-3 text-caption text-ink-muted select-none"
    >
      <nav aria-label="Current location" data-tauri-drag-region className="pointer-events-none flex min-w-0 items-center gap-1">
        <BrandLogo variant="mark" />
        <Link to="/" className={`${LINK_STYLE} font-semibold text-ink`}>
          {APP_NAME}
        </Link>
        {crumbs.map((crumb, index) => (
          <Fragment key={`${index}-${crumb.label}`}>
            <span aria-hidden="true">/</span>
            {crumb.to ? (
              <Link to={crumb.to} className={LINK_STYLE}>
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate px-1 text-ink">
                {crumb.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
      <WindowControls />
    </div>
  );
}
