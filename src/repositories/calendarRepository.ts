import { getDatabase } from "../lib/database";
import type { DeadlineTask } from "../types/calendar";

// Read-only. Every task that has a deadline and belongs to an active project, earliest deadline first.
export async function listDeadlineTasks(): Promise<DeadlineTask[]> {
  const database = await getDatabase();
  const rows = await database.select<
    {
      id: string;
      title: string;
      status: DeadlineTask["status"];
      priority: DeadlineTask["priority"];
      due_date: string;
      project_id: string;
      project_name: string;
    }[]
  >(
    `SELECT t.id, t.title, t.status, t.priority, t.due_date, t.project_id, p.name AS project_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
      WHERE t.due_date IS NOT NULL AND p.status = 'active'
      ORDER BY t.due_date, t.created_at, t.id`,
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    projectId: row.project_id,
    projectName: row.project_name,
  }));
}
