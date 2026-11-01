// The backup file format: building, checking, and turning a backup into SQL. Pure functions only (no
// database, no files), so they can be tested on their own. Everything in a file is untrusted input:
// parseBackup checks every row before anything touches the database.
import { BACKUP_TABLES, type BackupFile, type BackupRow, type BackupSummary, type BackupTableName } from "../types/backup";
import { ValidationError } from "./errors";

export const BACKUP_FORMAT_VERSION = 1;
// The database schema this version of the app writes and accepts (migration 6).
export const BACKUP_SCHEMA_VERSION = 6;
// A file bigger than this (in characters) is refused before it is parsed.
export const BACKUP_MAX_CHARACTERS = 50_000_000;
const MAX_ROWS_PER_TABLE = 200_000;

// ---- Column rules -------------------------------------------------------------------------------------

type Rule =
  | { kind: "id"; nullable?: boolean }
  | { kind: "text"; max: number; nonEmpty?: boolean; nullable?: boolean }
  | { kind: "enum"; values: string[]; nullable?: boolean }
  | { kind: "date"; nullable?: boolean }
  | { kind: "time"; nullable?: boolean }
  | { kind: "bit" };

const id = (nullable = false): Rule => ({ kind: "id", nullable });
const text = (max: number, nonEmpty = false, nullable = false): Rule => ({ kind: "text", max, nonEmpty, nullable });
const time = (nullable = false): Rule => ({ kind: "time", nullable });
const enumOf = (values: string[], nullable = false): Rule => ({ kind: "enum", values, nullable });

const LABEL_COLORS = ["neutral", "accent", "success", "danger", "info", "warning"];
const ACTIVITY_ACTIONS = [
  "workspace_created",
  "workspace_renamed",
  "project_created",
  "project_updated",
  "project_archived",
  "project_restored",
  "project_deleted",
  "task_created",
  "task_updated",
  "task_status_changed",
  "task_deleted",
  "document_created",
  "document_updated",
  "document_deleted",
];

// Columns in the order they are written. The length limits are generous: they stop absurd data, while the
// stricter limits of the forms stay in the services.
const COLUMNS: Record<BackupTableName, Record<string, Rule>> = {
  profiles: { id: id(), display_name: text(500, true), created_at: time() },
  workspaces: {
    id: id(),
    name: text(500, true),
    description: text(10_000),
    owner_profile_id: id(),
    created_at: time(),
    updated_at: time(),
  },
  workspace_members: { workspace_id: id(), profile_id: id(), role: enumOf(["owner", "admin", "member", "guest"]) },
  projects: {
    id: id(),
    workspace_id: id(),
    name: text(500, true),
    description: text(10_000),
    status: enumOf(["active", "archived"]),
    created_at: time(),
    updated_at: time(),
  },
  tasks: {
    id: id(),
    project_id: id(),
    title: text(1_000, true),
    description: text(100_000),
    status: enumOf(["todo", "in_progress", "review", "done"]),
    priority: enumOf(["low", "medium", "high"]),
    due_date: { kind: "date", nullable: true },
    assignee_profile_id: id(true),
    created_at: time(),
    updated_at: time(),
    completed_at: time(true),
  },
  task_checklist_items: {
    id: id(),
    task_id: id(),
    text: text(1_000, true),
    is_done: { kind: "bit" },
    created_at: time(),
    updated_at: time(),
  },
  task_notes: {
    id: id(),
    task_id: id(),
    author_profile_id: id(true),
    body: text(100_000, true),
    created_at: time(),
    updated_at: time(),
  },
  labels: {
    id: id(),
    project_id: id(),
    name: text(500, true),
    color: enumOf(LABEL_COLORS),
    created_at: time(),
    updated_at: time(),
  },
  task_labels: { task_id: id(), label_id: id() },
  documents: {
    id: id(),
    project_id: id(),
    title: text(1_000, true),
    kind: enumOf(["notes", "requirements", "meeting", "api", "design"]),
    body: text(2_000_000),
    created_at: time(),
    updated_at: time(),
  },
  activity_log: {
    id: id(),
    workspace_id: id(),
    project_id: id(true),
    actor_profile_id: id(true),
    action: enumOf(ACTIVITY_ACTIONS),
    subject_title: text(1_000),
    old_value: text(1_000, false, true),
    new_value: text(1_000, false, true),
    created_at: time(),
  },
};

// Primary key columns, used to find repeated rows.
const KEYS: Record<BackupTableName, string[]> = {
  profiles: ["id"],
  workspaces: ["id"],
  workspace_members: ["workspace_id", "profile_id"],
  projects: ["id"],
  tasks: ["id"],
  task_checklist_items: ["id"],
  task_notes: ["id"],
  labels: ["id"],
  task_labels: ["task_id", "label_id"],
  documents: ["id"],
  activity_log: ["id"],
};

export function columnNames(table: BackupTableName): string[] {
  return Object.keys(COLUMNS[table]);
}

// ---- Checking -----------------------------------------------------------------------------------------

function fail(message: string): never {
  throw new ValidationError(message);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// Returns the cleaned value of one column or throws a ValidationError that says where the problem is.
function checkValue(table: string, index: number, column: string, rule: Rule, value: unknown): string | number | null {
  const where = `${table}, row ${index + 1}, “${column}”`;
  const nullable = "nullable" in rule && rule.nullable === true;
  if (value === null || value === undefined) {
    if (nullable) return null;
    return fail(`The backup is damaged: a value is missing (${where}).`);
  }
  if (rule.kind === "bit") {
    if (value !== 0 && value !== 1) return fail(`The backup is damaged: expected 0 or 1 (${where}).`);
    return value;
  }
  if (typeof value !== "string") return fail(`The backup is damaged: expected text (${where}).`);
  if (value.includes("\u0000")) return fail(`The backup is damaged: unreadable characters (${where}).`);
  switch (rule.kind) {
    case "id":
      if (value.length === 0 || value.length > 100) return fail(`The backup is damaged: invalid identifier (${where}).`);
      return value;
    case "text":
      if (value.length > rule.max) return fail(`The backup is damaged: text is too long (${where}).`);
      if (rule.nonEmpty && value.trim().length === 0) return fail(`The backup is damaged: text is empty (${where}).`);
      return value;
    case "enum":
      if (!rule.values.includes(value)) return fail(`The backup contains a value this version does not know (${where}).`);
      return value;
    case "date":
      if (!isRealDate(value)) return fail(`The backup is damaged: invalid date (${where}).`);
      return value;
    case "time":
      if (value.length > 40 || Number.isNaN(Date.parse(value))) return fail(`The backup is damaged: invalid time (${where}).`);
      return value;
  }
}

function checkTable(table: BackupTableName, input: unknown): BackupRow[] {
  if (!Array.isArray(input)) return fail(`The backup is damaged: the list “${table}” is missing.`);
  if (input.length > MAX_ROWS_PER_TABLE) return fail(`The backup is too large to restore (“${table}”).`);
  const columns = COLUMNS[table];
  const seen = new Set<string>();
  return input.map((raw, index) => {
    if (!isPlainObject(raw)) return fail(`The backup is damaged: a row is not valid (${table}, row ${index + 1}).`);
    const row: BackupRow = {};
    for (const [column, rule] of Object.entries(columns)) {
      row[column] = checkValue(table, index, column, rule, raw[column]);
    }
    const key = KEYS[table].map((column) => String(row[column])).join("\u0001");
    if (seen.has(key)) return fail(`The backup is damaged: a row appears twice (${table}, row ${index + 1}).`);
    seen.add(key);
    return row;
  });
}

// Every reference must point at a row that is in the backup, and a label can only be used on tasks of
// its own project. The database would refuse a broken file too; checking first gives a clear message
// before anything is changed.
function checkRelations(tables: BackupFile["tables"]): void {
  const idsOf = (table: BackupTableName) => new Set(tables[table].map((row) => row.id as string));
  const profiles = idsOf("profiles");
  const workspaces = idsOf("workspaces");
  const projects = idsOf("projects");
  const tasks = idsOf("tasks");
  const labels = idsOf("labels");
  const need = (set: Set<string>, value: unknown, what: string): void => {
    if (value !== null && !set.has(value as string)) fail(`The backup is damaged: ${what} points to something that is not in the file.`);
  };

  tables.workspaces.forEach((row) => need(profiles, row.owner_profile_id, "a workspace owner"));
  tables.workspace_members.forEach((row) => {
    need(workspaces, row.workspace_id, "a workspace member");
    need(profiles, row.profile_id, "a workspace member");
  });
  tables.projects.forEach((row) => need(workspaces, row.workspace_id, "a project"));
  tables.tasks.forEach((row) => {
    need(projects, row.project_id, "a task");
    need(profiles, row.assignee_profile_id, "a task assignee");
  });
  tables.task_checklist_items.forEach((row) => need(tasks, row.task_id, "a checklist item"));
  tables.task_notes.forEach((row) => {
    need(tasks, row.task_id, "a note");
    need(profiles, row.author_profile_id, "a note author");
  });
  tables.labels.forEach((row) => need(projects, row.project_id, "a label"));
  tables.documents.forEach((row) => need(projects, row.project_id, "a document"));
  tables.activity_log.forEach((row) => {
    need(workspaces, row.workspace_id, "an activity entry");
    need(projects, row.project_id, "an activity entry");
    need(profiles, row.actor_profile_id, "an activity entry");
  });

  const projectOfTask = new Map(tables.tasks.map((row) => [row.id as string, row.project_id as string]));
  const projectOfLabel = new Map(tables.labels.map((row) => [row.id as string, row.project_id as string]));
  tables.task_labels.forEach((row) => {
    need(tasks, row.task_id, "a label link");
    need(labels, row.label_id, "a label link");
    if (projectOfTask.get(row.task_id as string) !== projectOfLabel.get(row.label_id as string)) {
      fail("The backup is damaged: a label is used on a task of another project.");
    }
  });

  const names = new Set<string>();
  tables.labels.forEach((row) => {
    const key = `${row.project_id as string}\u0001${(row.name as string).toLowerCase()}`;
    if (names.has(key)) fail("The backup is damaged: two labels of one project have the same name.");
    names.add(key);
  });
}

// Turns the text of a backup file into a checked BackupFile, or throws a ValidationError with a message
// for the person. Unknown extra fields are ignored; nothing from the file is used before it is checked.
export function parseBackup(fileText: string): BackupFile {
  if (fileText.length > BACKUP_MAX_CHARACTERS) fail("This file is too large to be an Avenqor backup.");
  let data: unknown;
  try {
    data = JSON.parse(fileText);
  } catch {
    return fail("This file is not a valid backup: it could not be read as JSON.");
  }
  if (!isPlainObject(data) || data.app !== "Avenqor") fail("This file is not an Avenqor backup.");
  const { formatVersion, schemaVersion, createdAt, tables } = data;
  if (typeof formatVersion !== "number" || !Number.isInteger(formatVersion)) fail("This file is not a valid backup: the format version is missing.");
  if (formatVersion !== BACKUP_FORMAT_VERSION) {
    fail(
      `This file uses backup format ${formatVersion}, but this version of Avenqor can only restore format ${BACKUP_FORMAT_VERSION}. ` +
        "The file may have been edited or damaged, or it may not have been made by this application.",
    );
  }
  if (typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion)) fail("This file is not a valid backup: the schema version is missing.");
  if (schemaVersion !== BACKUP_SCHEMA_VERSION) {
    fail(
      `This file contains data for database version ${schemaVersion}, but this version of Avenqor can only restore database version ${BACKUP_SCHEMA_VERSION}. ` +
        "The file may have been edited or damaged, or it may not have been made by this application.",
    );
  }
  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) fail("This file is not a valid backup: the creation time is missing.");
  if (!isPlainObject(tables)) fail("This file is not a valid backup: the data is missing.");

  const checked = {} as BackupFile["tables"];
  for (const table of BACKUP_TABLES) checked[table] = checkTable(table, tables[table]);
  checkRelations(checked);
  return { app: "Avenqor", formatVersion, schemaVersion, createdAt, tables: checked };
}

export function summarizeBackup(backup: BackupFile): BackupSummary {
  return {
    createdAt: backup.createdAt,
    workspaces: backup.tables.workspaces.length,
    projects: backup.tables.projects.length,
    tasks: backup.tables.tasks.length,
    documents: backup.tables.documents.length,
    labels: backup.tables.labels.length,
    activityEntries: backup.tables.activity_log.length,
  };
}

// The file content: readable JSON, so a person can open it in a text editor.
export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

// A file name such as "avenqor-backup-2026-10-30-1305.json" (local time).
export function backupFileName(prefix: string, now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${prefix}-${stamp}.json`;
}

// ---- Restoring ----------------------------------------------------------------------------------------

// A text value as SQL. The characters are written as hexadecimal bytes, so no character in the data
// (quotes, line breaks, anything) can change the meaning of the statement.
function sqlLiteral(value: string | number | null): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  if (value === "") return "''";
  const hex = Array.from(new TextEncoder().encode(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `CAST(X'${hex}' AS TEXT)`;
}

// The order the tables are filled in, so every reference already exists when it is used.
const INSERT_ORDER: BackupTableName[] = [
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
];

// One SQL script that replaces all data with the backup. It runs as ONE call, so it is one transaction:
//  - the first statement of an error rolls everything back (INSERT OR ROLLBACK), leaving the old data;
//  - the database triggers that write the history (migration 6) and the owner membership (migration 2)
//    also fire while rows are inserted, so their rows are removed again before the backup's own rows
//    of those two tables are inserted.
// Call this only with a BackupFile that parseBackup returned.
export function buildRestoreScript(backup: BackupFile): string {
  const lines: string[] = ["BEGIN IMMEDIATE;"];
  // Delete from the children up. The deletes of tasks, documents, and projects write history rows through
  // triggers, which are removed by the activity_log delete that follows.
  for (const table of ["task_labels", "labels", "task_notes", "task_checklist_items", "documents", "tasks", "projects", "workspace_members", "workspaces", "activity_log", "profiles"]) {
    lines.push(`DELETE FROM ${table};`);
  }
  for (const table of INSERT_ORDER) {
    if (table === "workspace_members") lines.push("DELETE FROM workspace_members;");
    if (table === "activity_log") lines.push("DELETE FROM activity_log;");
    const columns = columnNames(table);
    for (const row of backup.tables[table]) {
      const values = columns.map((column) => sqlLiteral(row[column]));
      lines.push(`INSERT OR ROLLBACK INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    }
  }
  lines.push("COMMIT;");
  return lines.join("\n");
}
