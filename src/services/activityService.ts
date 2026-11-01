import { ACTIVITY_PREVIEW_COUNT, describeActivity, isProjectContentAction } from "../lib/activityText";
import * as repository from "../repositories/activityRepository";
import type { ActivityRow } from "../repositories/activityRepository";
import type { ActivityEntry, ActivityScope } from "../types/activity";

// A summary asks for one entry more than it shows, so the screen knows whether to offer "View all".
const PREVIEW_FETCH = ACTIVITY_PREVIEW_COUNT + 1;

function toEntry(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    actorName: row.actorName ?? "Someone",
    action: describeActivity(row.action, row.subjectTitle, row.oldValue, row.newValue),
    occurredAt: row.createdAt,
    projectName: isProjectContentAction(row.action) ? (row.projectName ?? undefined) : undefined,
  };
}

export async function getRecentActivity(limit = PREVIEW_FETCH): Promise<ActivityEntry[]> {
  return (await repository.listRecentActivity(limit)).map(toEntry);
}

export async function getWorkspaceActivity(workspaceId: string, limit = PREVIEW_FETCH): Promise<ActivityEntry[]> {
  return (await repository.listWorkspaceActivity(workspaceId, limit)).map(toEntry);
}

export async function getProjectActivity(projectId: string, limit = PREVIEW_FETCH): Promise<ActivityEntry[]> {
  return (await repository.listProjectActivity(projectId, limit)).map(toEntry);
}

// The history for the full list. Reads one entry more than asked for, to tell whether there is more.
export async function getActivityLog(scope: ActivityScope, limit: number): Promise<{ entries: ActivityEntry[]; hasMore: boolean }> {
  const wanted = limit + 1;
  const entries =
    scope.kind === "workspace"
      ? await getWorkspaceActivity(scope.id, wanted)
      : scope.kind === "project"
        ? await getProjectActivity(scope.id, wanted)
        : await getRecentActivity(wanted);
  return { entries: entries.slice(0, limit), hasMore: entries.length > limit };
}
