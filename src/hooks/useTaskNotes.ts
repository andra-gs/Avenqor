import { useEffect, useSyncExternalStore } from "react";
import * as noteService from "../services/noteService";
import { createKeyedLoader } from "./createKeyedLoader";

const loader = createKeyedLoader(noteService.getNotes);

// The notes of one task. Every action throws when it fails, so the screen can show the message.
export function useTaskNotes(taskId: string) {
  const snapshot = useSyncExternalStore(loader.subscribe, loader.getSnapshot);

  useEffect(() => {
    void loader.load(taskId);
  }, [taskId]);

  async function run(action: () => Promise<void>) {
    await action();
    await loader.load(taskId);
  }

  return {
    state: loader.stateFor(snapshot, taskId),
    addNote: (body: string) => run(() => noteService.addNote(taskId, body)),
    editNote: (id: string, body: string) => run(() => noteService.editNote(id, body)),
    deleteNote: (id: string) => run(() => noteService.deleteNote(id)),
  };
}
