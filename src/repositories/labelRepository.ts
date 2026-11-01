import { getDatabase } from "../lib/database";
import type { Label, LabelColor, ProjectLabel } from "../types/label";

interface LabelRow {
  id: string;
  name: string;
  color: LabelColor;
}

function toLabel(row: LabelRow): Label {
  return { id: row.id, name: row.name, color: row.color };
}

// Labels of one project, by name, with how many tasks use each.
export async function listProjectLabels(projectId: string): Promise<ProjectLabel[]> {
  const database = await getDatabase();
  const rows = await database.select<(LabelRow & { task_count: number })[]>(
    `SELECT l.id, l.name, l.color,
            (SELECT COUNT(*) FROM task_labels tl WHERE tl.label_id = l.id) AS task_count
       FROM labels l
      WHERE l.project_id = $1
      ORDER BY l.name COLLATE NOCASE, l.rowid`,
    [projectId],
  );
  return rows.map((row) => ({ ...toLabel(row), taskCount: row.task_count }));
}

// The labels of every task of a project, keyed by task id.
export async function listLabelsByTask(projectId: string): Promise<Map<string, Label[]>> {
  const database = await getDatabase();
  const rows = await database.select<(LabelRow & { task_id: string })[]>(
    `SELECT tl.task_id, l.id, l.name, l.color
       FROM task_labels tl
       JOIN labels l ON l.id = tl.label_id
       JOIN tasks t ON t.id = tl.task_id
      WHERE t.project_id = $1
      ORDER BY l.name COLLATE NOCASE, l.rowid`,
    [projectId],
  );
  const byTask = new Map<string, Label[]>();
  for (const row of rows) {
    const list = byTask.get(row.task_id);
    if (list) list.push(toLabel(row));
    else byTask.set(row.task_id, [toLabel(row)]);
  }
  return byTask;
}

export async function listLabelsOfTask(taskId: string): Promise<Label[]> {
  const database = await getDatabase();
  const rows = await database.select<LabelRow[]>(
    `SELECT l.id, l.name, l.color
       FROM task_labels tl
       JOIN labels l ON l.id = tl.label_id
      WHERE tl.task_id = $1
      ORDER BY l.name COLLATE NOCASE, l.rowid`,
    [taskId],
  );
  return rows.map(toLabel);
}

export async function getTaskProjectId(taskId: string): Promise<string | undefined> {
  const database = await getDatabase();
  const rows = await database.select<{ project_id: string }[]>("SELECT project_id FROM tasks WHERE id = $1", [taskId]);
  return rows[0]?.project_id;
}

export async function getLabelProjectId(labelId: string): Promise<string | undefined> {
  const database = await getDatabase();
  const rows = await database.select<{ project_id: string }[]>("SELECT project_id FROM labels WHERE id = $1", [labelId]);
  return rows[0]?.project_id;
}

// True when the project already has a label with this name (upper and lower case do not matter),
// not counting the label `exceptLabelId`.
export async function nameIsTaken(projectId: string, name: string, exceptLabelId: string): Promise<boolean> {
  const database = await getDatabase();
  const rows = await database.select<{ id: string }[]>(
    "SELECT id FROM labels WHERE project_id = $1 AND name = $2 COLLATE NOCASE AND id <> $3",
    [projectId, name, exceptLabelId],
  );
  return rows.length > 0;
}

export async function insertLabel(label: {
  id: string;
  projectId: string;
  name: string;
  color: LabelColor;
  now: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO labels (id, project_id, name, color, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5)",
    [label.id, label.projectId, label.name, label.color, label.now],
  );
}

// Returns true when the label existed.
export async function updateLabel(id: string, name: string, color: LabelColor, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("UPDATE labels SET name = $1, color = $2, updated_at = $3 WHERE id = $4", [
    name,
    color,
    now,
    id,
  ]);
  return result.rowsAffected > 0;
}

// The links to the label are removed with it (CASCADE). Returns true when the label existed.
export async function deleteLabel(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM labels WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}

// Links a label to a task. Only a label of the task's own project is linked; a label that is already linked
// is left as it is. Returns true when a new link was made.
export async function attachLabel(taskId: string, labelId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    `INSERT OR IGNORE INTO task_labels (task_id, label_id)
     SELECT t.id, l.id FROM tasks t JOIN labels l ON l.project_id = t.project_id
      WHERE t.id = $1 AND l.id = $2`,
    [taskId, labelId],
  );
  return result.rowsAffected > 0;
}

export async function detachLabel(taskId: string, labelId: string): Promise<void> {
  const database = await getDatabase();
  await database.execute("DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2", [taskId, labelId]);
}
