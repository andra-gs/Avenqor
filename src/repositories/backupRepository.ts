import { getDatabase } from "../lib/database";
import { columnNames } from "../lib/backupFormat";
import { BACKUP_TABLES, type BackupRow, type BackupTableName } from "../types/backup";

// Reads every row of every table, in the order the rows were stored. Read-only.
export async function readAllTables(): Promise<Record<BackupTableName, BackupRow[]>> {
  const database = await getDatabase();
  const tables = {} as Record<BackupTableName, BackupRow[]>;
  for (const table of BACKUP_TABLES) {
    // The names come from the fixed list above, never from user input.
    tables[table] = await database.select<BackupRow[]>(`SELECT ${columnNames(table).join(", ")} FROM ${table} ORDER BY rowid`);
  }
  return tables;
}

// The highest migration that was applied, or undefined when none was.
export async function readSchemaVersion(): Promise<number | undefined> {
  const database = await getDatabase();
  const rows = await database.select<{ version: number | null }[]>("SELECT MAX(version) AS version FROM _sqlx_migrations WHERE success = 1");
  return rows[0]?.version ?? undefined;
}

// Runs a script made by buildRestoreScript as a single call (one transaction). If it fails, a rollback
// is sent as a last safeguard; the error "no transaction is active" from that is expected and ignored.
export async function runRestoreScript(script: string): Promise<void> {
  const database = await getDatabase();
  try {
    await database.execute(script);
  } catch (error) {
    try {
      await database.execute("ROLLBACK");
    } catch {
      // Nothing was open: the script rolled itself back.
    }
    throw error;
  }
}
