import { TASK_STATUS_LABELS, type TaskStatus } from "../types/task";

// The kinds of history entry. They match the values stored in the database (migration 6).
// How many entries a summary on the Dashboard, a workspace page, or a project page shows. A link to the
// full list appears when there are more.
export const ACTIVITY_PREVIEW_COUNT = 8;

export type ActivityAction =
  | "workspace_created"
  | "workspace_renamed"
  | "project_created"
  | "project_updated"
  | "project_archived"
  | "project_restored"
  | "project_deleted"
  | "task_created"
  | "task_updated"
  | "task_status_changed"
  | "task_deleted"
  | "document_created"
  | "document_updated"
  | "document_deleted";

function quote(title: string): string {
  return `“${title}”`;
}

function statusLabel(value: string | null): string {
  return value && value in TASK_STATUS_LABELS ? TASK_STATUS_LABELS[value as TaskStatus] : (value ?? "");
}

// The sentence for one entry, without the person: for example `moved task “Draft” from To Do to Done`.
export function describeActivity(action: ActivityAction, title: string, oldValue: string | null, newValue: string | null): string {
  switch (action) {
    case "workspace_created":
      return `created workspace ${quote(title)}`;
    case "workspace_renamed":
      return `renamed workspace ${quote(oldValue ?? "")} to ${quote(newValue ?? title)}`;
    case "project_created":
      return `created project ${quote(title)}`;
    case "project_updated":
      return `edited project ${quote(title)}`;
    case "project_archived":
      return `archived project ${quote(title)}`;
    case "project_restored":
      return `restored project ${quote(title)}`;
    case "project_deleted":
      return `deleted project ${quote(title)}`;
    case "task_created":
      return `created task ${quote(title)}`;
    case "task_updated":
      return `edited task ${quote(title)}`;
    case "task_status_changed":
      return `moved task ${quote(title)} from ${statusLabel(oldValue)} to ${statusLabel(newValue)}`;
    case "task_deleted":
      return `deleted task ${quote(title)}`;
    case "document_created":
      return `created document ${quote(title)}`;
    case "document_updated":
      return `edited document ${quote(title)}`;
    case "document_deleted":
      return `deleted document ${quote(title)}`;
  }
}

// Entries about a task or a document name the project they happened in when they are shown outside it.
export function isProjectContentAction(action: ActivityAction): boolean {
  return action.startsWith("task_") || action.startsWith("document_");
}
