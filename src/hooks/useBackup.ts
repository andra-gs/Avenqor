import * as backupService from "../services/backupService";

// Actions of the backup section. Every action throws when it fails, so the screen can show the message.
export function useBackup() {
  return {
    exportBackup: backupService.exportBackup,
    previewRestore: backupService.previewRestore,
    restoreBackup: backupService.restoreBackup,
  };
}
