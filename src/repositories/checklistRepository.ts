import { getDatabase } from "../lib/database";
import type { ChecklistItem } from "../types/taskExtras";

export async function listItems(taskId: string): Promise<ChecklistItem[]> {
  const database = await getDatabase();
  const rows = await database.select<{ id: string; text: string; is_done: number; created_at: string }[]>(
    "SELECT id, text, is_done, created_at FROM task_checklist_items WHERE task_id = $1 ORDER BY created_at, rowid",
    [taskId],
  );
  return rows.map((row) => ({ id: row.id, text: row.text, done: row.is_done === 1, createdAt: row.created_at }));
}

export async function insertItem(item: { id: string; taskId: string; text: string; now: string }): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO task_checklist_items (id, task_id, text, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)",
    [item.id, item.taskId, item.text, item.now],
  );
}

// The next three return true when the item existed.
export async function updateItemText(id: string, text: string, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("UPDATE task_checklist_items SET text = $1, updated_at = $2 WHERE id = $3", [text, now, id]);
  return result.rowsAffected > 0;
}

export async function updateItemDone(id: string, done: boolean, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("UPDATE task_checklist_items SET is_done = $1, updated_at = $2 WHERE id = $3", [
    done ? 1 : 0,
    now,
    id,
  ]);
  return result.rowsAffected > 0;
}

export async function deleteItem(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM task_checklist_items WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}
