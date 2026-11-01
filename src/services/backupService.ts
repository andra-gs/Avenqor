import {
  BACKUP_FORMAT_VERSION,
  backupFileName,
  buildRestoreScript,
  parseBackup,
  serializeBackup,
  summarizeBackup,
} from "../lib/backupFormat";
import { openTextFile, saveTextFile } from "../lib/fileDialogs";
import { writeLastBackupAt } from "../lib/lastBackup";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/backupRepository";
import type { BackupFile, BackupSummary } from "../types/backup";

// What the person sees after choosing a file to restore: where it is and what it contains.
export interface RestorePreview {
  path: string;
  summary: BackupSummary;
  backup: BackupFile;
}

async function collectBackup(): Promise<BackupFile> {
  const schemaVersion = await repository.readSchemaVersion();
  if (schemaVersion === undefined) throw new ValidationError("The database is not ready, so a backup cannot be made.");
  return {
    app: "Avenqor",
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion,
    createdAt: new Date().toISOString(),
    tables: await repository.readAllTables(),
  };
}

// Reads all data and asks where to save it. Returns the path and the summary of what was saved, or
// undefined when the person cancelled. `kind` only changes the suggested file name.
export async function exportBackup(kind: "backup" | "safety-backup" = "backup"): Promise<{ path: string; summary: BackupSummary } | undefined> {
  const backup = await collectBackup();
  // The file is checked with the same rules as a file to restore, so a backup that could not be
  // restored is never written.
  const text = serializeBackup(backup);
  parseBackup(text);
  const path = await saveTextFile(backupFileName(`avenqor-${kind}`), text);
  if (!path) return undefined;
  writeLastBackupAt(backup.createdAt);
  return { path, summary: summarizeBackup(backup) };
}

// Asks which file to restore and checks it completely. Nothing is changed. Returns undefined when the
// person cancelled; throws a ValidationError (with a message for the person) when the file is not usable.
export async function previewRestore(): Promise<RestorePreview | undefined> {
  const file = await openTextFile();
  if (!file) return undefined;
  const backup = parseBackup(file.content);
  return { path: file.path, summary: summarizeBackup(backup), backup };
}

// Replaces all data with the content of a checked backup, in one transaction.
export async function restoreBackup(backup: BackupFile): Promise<void> {
  await repository.runRestoreScript(buildRestoreScript(backup));
}
