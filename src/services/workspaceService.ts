import { hasVisibleText } from "../lib/text";
import { todayDateText } from "../lib/dueDate";
import { ValidationError } from "../lib/errors";
import { calculateProgress } from "../lib/progress";
import * as repository from "../repositories/workspaceRepository";
import type { WorkspaceDetail, WorkspaceSummary } from "../types/workspace";
import { getWorkspaceActivity } from "./activityService";
import { getLocalProfileId } from "./profileService";

export const WORKSPACE_NAME_MAX_LENGTH = 60;

// Business rules for a workspace name. Returns the cleaned name or throws a ValidationError.
function validateName(input: string): string {
  const name = input.trim();
  if (!hasVisibleText(name)) throw new ValidationError("Enter a workspace name.");
  if (name.length > WORKSPACE_NAME_MAX_LENGTH) {
    throw new ValidationError(`The name can have at most ${WORKSPACE_NAME_MAX_LENGTH} characters.`);
  }
  return name;
}

export function listWorkspaces(): Promise<WorkspaceSummary[]> {
  return repository.listWorkspaces();
}

// Everything the workspace page shows. Progress is calculated from the task counts, never stored.
export async function getWorkspaceDetail(id: string): Promise<WorkspaceDetail | undefined> {
  const [data, activity] = await Promise.all([repository.getWorkspaceDetail(id, todayDateText()), getWorkspaceActivity(id)]);
  if (!data) return undefined;

  const activeProjects = data.projects.filter((project) => project.status === "active");
  const archivedProjects = data.projects.filter((project) => project.status === "archived");
  const toSummary = (project: (typeof data.projects)[number]) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    progressPercent: calculateProgress(project.completedTaskCount, project.taskCount),
  });
  return {
    id: data.id,
    name: data.name,
    memberCount: data.memberCount,
    projects: activeProjects.map(toSummary),
    archivedProjects: archivedProjects.map(toSummary),
    taskCount: activeProjects.reduce((sum, project) => sum + project.taskCount, 0),
    completedTaskCount: activeProjects.reduce((sum, project) => sum + project.completedTaskCount, 0),
    upcomingDeadlineCount: data.upcomingDeadlineCount,
    overdueTaskCount: data.overdueTaskCount,
    activity,
  };
}

export async function createWorkspace(nameInput: string): Promise<void> {
  const name = validateName(nameInput);
  const ownerProfileId = await getLocalProfileId();
  await repository.insertWorkspace({ id: crypto.randomUUID(), name, ownerProfileId, now: new Date().toISOString() });
}

export async function renameWorkspace(id: string, nameInput: string): Promise<void> {
  const name = validateName(nameInput);
  const changed = await repository.updateWorkspaceName(id, name, new Date().toISOString());
  if (!changed) throw new ValidationError("This workspace no longer exists.");
}

export async function deleteWorkspace(id: string): Promise<void> {
  const deleted = await repository.deleteWorkspace(id);
  if (!deleted) throw new ValidationError("This workspace no longer exists.");
}
