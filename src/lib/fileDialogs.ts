import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

// The only place that opens the "Save as" and "Open" windows and reads or writes a chosen file.
// The app can only reach a file the person picked in one of these windows: the capability file grants no
// other file access (src-tauri/capabilities/default.json).
const BACKUP_FILTER = [{ name: "Avenqor backup (JSON)", extensions: ["json"] }];

// Asks where to save, then writes the text there. Returns the chosen path, or undefined when the person
// closed the window without choosing.
export async function saveTextFile(defaultFileName: string, content: string): Promise<string | undefined> {
  const path = await save({ defaultPath: defaultFileName, filters: BACKUP_FILTER });
  if (!path) return undefined;
  await writeTextFile(path, content);
  return path;
}

// Asks which file to open, then reads it as text. Returns undefined when the person chose nothing.
export async function openTextFile(): Promise<{ path: string; content: string } | undefined> {
  const path = await open({ multiple: false, directory: false, filters: BACKUP_FILTER });
  if (!path) return undefined;
  return { path, content: await readTextFile(path) };
}
