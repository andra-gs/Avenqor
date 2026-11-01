import { getDatabase } from "../lib/database";

export async function insertProject(project: {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  now: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO projects (id, workspace_id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5)",
    [project.id, project.workspaceId, project.name, project.description, project.now],
  );
}

export interface ProjectDetailData {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";
  workspaceId: string;
  workspaceName: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    dueDate: string | undefined;
  }[];
}

// Returns undefined when the project does not exist.
export async function getProjectDetail(id: string): Promise<ProjectDetailData | undefined> {
  const database = await getDatabase();

  const projects = await database.select<
    { id: string; name: string; description: string; status: "active" | "archived"; workspace_id: string; workspace_name: string }[]
  >(
    `SELECT p.id, p.name, p.description, p.status, p.workspace_id, w.name AS workspace_name
       FROM projects p
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = $1`,
    [id],
  );
  const project = projects[0];
  if (!project) return undefined;

  const tasks = await database.select<
    {
      id: string;
      title: string;
      description: string;
      status: "todo" | "in_progress" | "review" | "done";
      priority: "low" | "medium" | "high";
      due_date: string | null;
    }[]
  >("SELECT id, title, description, status, priority, due_date FROM tasks WHERE project_id = $1 ORDER BY created_at, id", [id]);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    workspaceId: project.workspace_id,
    workspaceName: project.workspace_name,
    tasks: tasks.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date ?? undefined,
    })),
  };
}

// Returns true when a project with this id existed and was changed.
export async function updateProjectStatus(id: string, status: "active" | "archived", now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("UPDATE projects SET status = $1, updated_at = $2 WHERE id = $3", [status, now, id]);
  return result.rowsAffected > 0;
}

// The tasks of the project are deleted with it (foreign key CASCADE).
export async function deleteProject(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM projects WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}

// Returns true when the project existed and was changed.
export async function updateProjectDetails(id: string, name: string, description: string, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "UPDATE projects SET name = $1, description = $2, updated_at = $3 WHERE id = $4",
    [name, description, now, id],
  );
  return result.rowsAffected > 0;
}
