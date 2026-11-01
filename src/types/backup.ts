// A backup file (format version 1). The table and column names are the ones of the SQLite database
// (see docs/DATABASE_SCHEMA.md), so the file mirrors the stored data exactly.
export type BackupValue = string | number | null;
export type BackupRow = Record<string, BackupValue>;

export const BACKUP_TABLES = [
  "profiles",
  "workspaces",
  "workspace_members",
  "projects",
  "tasks",
  "task_checklist_items",
  "task_notes",
  "labels",
  "task_labels",
  "documents",
  "activity_log",
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export interface BackupFile {
  app: "Avenqor";
  // The layout of this file. Changes only when the file layout changes.
  formatVersion: number;
  // The database schema version the data comes from (the highest applied migration).
  schemaVersion: number;
  // UTC ISO 8601 time of creation.
  createdAt: string;
  tables: Record<BackupTableName, BackupRow[]>;
}

// What a person is shown before restoring: the number of items in the file.
export interface BackupSummary {
  createdAt: string;
  workspaces: number;
  projects: number;
  tasks: number;
  documents: number;
  labels: number;
  activityEntries: number;
}
