import { getDatabase } from "../lib/database";
import type { ActivityAction } from "../lib/activityText";

// A history entry as stored. The sentence is made by the service.
export interface ActivityRow {
  id: string;
  action: ActivityAction;
  subjectTitle: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  // Null when the profile no longer exists.
  actorName: string | null;
  // Null for entries that are not about the content of a project, or when the project is gone.
  projectName: string | null;
}

interface RawRow {
  id: string;
  action: ActivityAction;
  subject_title: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  actor_name: string | null;
  project_name: string | null;
}

// The history is written by database triggers (migration 6); the app only reads it.
const SELECT = `SELECT a.id, a.action, a.subject_title, a.old_value, a.new_value, a.created_at,
                       pr.display_name AS actor_name, p.name AS project_name
                  FROM activity_log a
                  LEFT JOIN profiles pr ON pr.id = a.actor_profile_id
                  LEFT JOIN projects p ON p.id = a.project_id`;
// The parameters are numbered in the order they first appear in the text (SQLite binds them that way).
const ORDER_BY = "ORDER BY a.created_at DESC, a.rowid DESC";

function toRow(row: RawRow): ActivityRow {
  return {
    id: row.id,
    action: row.action,
    subjectTitle: row.subject_title,
    oldValue: row.old_value,
    newValue: row.new_value,
    createdAt: row.created_at,
    actorName: row.actor_name,
    projectName: row.project_name,
  };
}

// The newest entries of everything.
export async function listRecentActivity(limit: number): Promise<ActivityRow[]> {
  const database = await getDatabase();
  return (await database.select<RawRow[]>(`${SELECT} ${ORDER_BY} LIMIT $1`, [limit])).map(toRow);
}

export async function listWorkspaceActivity(workspaceId: string, limit: number): Promise<ActivityRow[]> {
  const database = await getDatabase();
  const rows = await database.select<RawRow[]>(
    `${SELECT} WHERE a.workspace_id = $1 ${ORDER_BY} LIMIT $2`,
    [workspaceId, limit],
  );
  return rows.map(toRow);
}

export async function listProjectActivity(projectId: string, limit: number): Promise<ActivityRow[]> {
  const database = await getDatabase();
  const rows = await database.select<RawRow[]>(
    `${SELECT} WHERE a.project_id = $1 ${ORDER_BY} LIMIT $2`,
    [projectId, limit],
  );
  return rows.map(toRow);
}
