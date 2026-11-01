import { getDatabase } from "../lib/database";
import type { TaskDetail, TaskStatus } from "../types/task";

export async function insertTask(task: {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  assigneeProfileId: string;
  now: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO tasks (id, project_id, title, description, priority, due_date, assignee_profile_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)",
    [task.id, task.projectId, task.title, task.description, task.priority, task.dueDate, task.assigneeProfileId, task.now],
  );
}

// Moves a task to a status. "completed_at" is set when it enters "done" and cleared when it leaves.
// Returns true when the task existed.
export async function updateTaskStatus(id: string, status: TaskStatus, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "UPDATE tasks SET status = $1, completed_at = $2, updated_at = $3 WHERE id = $4",
    [status, status === "done" ? now : null, now, id],
  );
  return result.rowsAffected > 0;
}

export async function deleteTask(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}

// Returns true when the task existed and was changed.
export async function updateTaskDetails(
  id: string,
  details: { title: string; description: string; priority: "low" | "medium" | "high"; dueDate: string | null },
  now: string,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, updated_at = $5 WHERE id = $6",
    [details.title, details.description, details.priority, details.dueDate, now, id],
  );
  return result.rowsAffected > 0;
}

// One task with its project, workspace, and assignee name. Returns undefined when the task does not exist.
export async function getTaskDetail(id: string): Promise<TaskDetail | undefined> {
  const database = await getDatabase();
  const rows = await database.select<
    {
      id: string;
      title: string;
      description: string;
      status: TaskStatus;
      priority: "low" | "medium" | "high";
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      project_id: string;
      project_name: string;
      workspace_id: string;
      workspace_name: string;
      assignee_name: string | null;
    }[]
  >(
    `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
            t.created_at, t.updated_at, t.completed_at,
            t.project_id, p.name AS project_name,
            p.workspace_id, w.name AS workspace_name,
            a.display_name AS assignee_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN workspaces w ON w.id = p.workspace_id
       LEFT JOIN profiles a ON a.id = t.assignee_profile_id
      WHERE t.id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    projectId: row.project_id,
    projectName: row.project_name,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    assigneeName: row.assignee_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}
