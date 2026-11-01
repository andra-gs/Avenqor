import { getDatabase } from "../lib/database";
import type { DocumentDetail, DocumentKind, DocumentProjectOption, DocumentSummary } from "../types/document";

interface SummaryRow {
  id: string;
  title: string;
  kind: DocumentKind;
  project_id: string;
  project_name: string;
  updated_at: string;
}

// Every document without its body, the most recently changed first.
export async function listDocuments(): Promise<DocumentSummary[]> {
  const database = await getDatabase();
  const rows = await database.select<SummaryRow[]>(
    `SELECT d.id, d.title, d.kind, d.project_id, p.name AS project_name, d.updated_at
       FROM documents d
       JOIN projects p ON p.id = d.project_id
      ORDER BY d.updated_at DESC, d.rowid DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind,
    projectId: row.project_id,
    projectName: row.project_name,
    updatedAt: row.updated_at,
  }));
}

// The active projects, for the "Project" choice of a new document.
export async function listProjectOptions(): Promise<DocumentProjectOption[]> {
  const database = await getDatabase();
  const rows = await database.select<{ id: string; name: string; workspace_name: string }[]>(
    `SELECT p.id, p.name, w.name AS workspace_name
       FROM projects p
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.status = 'active'
      ORDER BY w.name COLLATE NOCASE, p.name COLLATE NOCASE, p.rowid`,
  );
  return rows.map((row) => ({ id: row.id, name: row.name, workspaceName: row.workspace_name }));
}

// Returns undefined when the document does not exist.
export async function getDocument(id: string): Promise<DocumentDetail | undefined> {
  const database = await getDatabase();
  const rows = await database.select<
    (SummaryRow & { body: string; created_at: string; workspace_id: string; workspace_name: string })[]
  >(
    `SELECT d.id, d.title, d.kind, d.body, d.project_id, p.name AS project_name,
            p.workspace_id, w.name AS workspace_name, d.created_at, d.updated_at
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE d.id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    body: row.body,
    projectId: row.project_id,
    projectName: row.project_name,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertDocument(document: {
  id: string;
  projectId: string;
  title: string;
  kind: DocumentKind;
  body: string;
  now: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    "INSERT INTO documents (id, project_id, title, kind, body, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6)",
    [document.id, document.projectId, document.title, document.kind, document.body, document.now],
  );
}

// Returns true when the document existed.
export async function updateDocument(id: string, title: string, kind: DocumentKind, body: string, now: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "UPDATE documents SET title = $1, kind = $2, body = $3, updated_at = $4 WHERE id = $5",
    [title, kind, body, now, id],
  );
  return result.rowsAffected > 0;
}

// Returns true when the document existed.
export async function deleteDocument(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute("DELETE FROM documents WHERE id = $1", [id]);
  return result.rowsAffected > 0;
}
