import { getDatabase } from "../lib/database";
import type { MyTask } from "../types/myTasks";

// Read-only. The tasks of active projects that are assigned to this profile: open tasks first,
// soonest deadline first (no deadline last), finished tasks at the end.
export async function listTasksAssignedTo(profileId: string): Promise<MyTask[]> {
  const database = await getDatabase();
  const rows = await database.select<
    {
      id: string;
      title: string;
      status: MyTask["status"];
      priority: MyTask["priority"];
      due_date: string | null;
      project_id: string;
      project_name: string;
    }[]
  >(
    `SELECT t.id, t.title, t.status, t.priority, t.due_date, t.project_id, p.name AS project_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
      WHERE t.assignee_profile_id = $1 AND p.status = 'active'
      ORDER BY (t.status = 'done'), (t.due_date IS NULL), t.due_date, t.created_at, t.id`,
    [profileId],
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    projectId: row.project_id,
    projectName: row.project_name,
  }));
}
