import { getDatabase } from "../lib/database";
import type { TaskStatus } from "../types/task";

// Rows as the database returns them. The service turns them into search results.
export interface WorkspaceRow {
  id: string;
  name: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  status: "active" | "archived";
  workspace_name: string;
}

export interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  project_name: string;
  workspace_name: string;
}

export interface DocumentRow {
  id: string;
  title: string;
  body: string;
  project_name: string;
}

// `pattern` is a LIKE pattern such as "%report%" made by the service, with % and _ in the typed text
// already escaped with a backslash (hence ESCAPE '\'). SQLite's LIKE ignores upper and lower case for
// the letters A to Z only; accented letters must match exactly. Parameters are numbered in the order
// they first appear in the text (SQLite binds them that way).
export async function findWorkspaces(pattern: string, limit: number): Promise<WorkspaceRow[]> {
  const database = await getDatabase();
  return database.select<WorkspaceRow[]>(
    `SELECT id, name FROM workspaces
      WHERE name LIKE $1 ESCAPE '\\'
      ORDER BY name COLLATE NOCASE
      LIMIT $2`,
    [pattern, limit],
  );
}

export async function findProjects(pattern: string, limit: number): Promise<ProjectRow[]> {
  const database = await getDatabase();
  return database.select<ProjectRow[]>(
    `SELECT p.id, p.name, p.status, w.name AS workspace_name
       FROM projects p
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.name LIKE $1 ESCAPE '\\' OR p.description LIKE $1 ESCAPE '\\'
      ORDER BY p.updated_at DESC
      LIMIT $2`,
    [pattern, limit],
  );
}

export async function findTasks(pattern: string, limit: number): Promise<TaskRow[]> {
  const database = await getDatabase();
  return database.select<TaskRow[]>(
    `SELECT t.id, t.title, t.status, p.name AS project_name, w.name AS workspace_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE t.title LIKE $1 ESCAPE '\\' OR t.description LIKE $1 ESCAPE '\\'
      ORDER BY t.updated_at DESC
      LIMIT $2`,
    [pattern, limit],
  );
}

export async function findDocuments(pattern: string, limit: number): Promise<DocumentRow[]> {
  const database = await getDatabase();
  return database.select<DocumentRow[]>(
    `SELECT d.id, d.title, d.body, p.name AS project_name
       FROM documents d
       JOIN projects p ON p.id = d.project_id
      WHERE d.title LIKE $1 ESCAPE '\\' OR d.body LIKE $1 ESCAPE '\\'
      ORDER BY d.updated_at DESC
      LIMIT $2`,
    [pattern, limit],
  );
}
