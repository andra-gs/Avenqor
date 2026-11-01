import { getDatabase } from "../lib/database";
import type { TaskNote } from "../types/taskExtras";

// Newest note first.
export async function listNotes(taskId: string): Promise<TaskNote[]> {
  const database = await getDatabase();
  const rows = await database.select<
    { id: string; body: string; created_at: string; updated_at: string; author_name: string | null }[]
  >(
    `SELECT n.id, n.body, n.created_at, n.updated_at, p.display_name AS author_name
       FROM task_notes n
       LEFT JOIN profiles p ON p.id = n.author_profile_id
      WHERE n.task_id = $1
      ORDER BY n.created_at DESC, n.rowid DESC`,
    [taskId],
  );
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    authorName: row.author_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function insertNote(note: {
  id: string;
  taskId: string;
  authorProfileId: string;
  body: string;
  now: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO task_notes (id, task_id, author_profile_id, body, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5)",
    [note.id, note.taskId, note.authorProfileId, note.body, note.now],
  );
}

// Returns true when the note existed.
export async function updateNoteBody(id: string, body: string, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("UPDATE task_notes SET body = $1, updated_at = $2 WHERE id = $3", [body, now, id]);
  return result.rowsAffected > 0;
}

export async function deleteNote(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM task_notes WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}
