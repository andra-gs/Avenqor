import { useEffect, useSyncExternalStore } from "react";
import * as checklistService from "../services/checklistService";
import { createKeyedLoader } from "./createKeyedLoader";

const loader = createKeyedLoader(checklistService.getChecklist);

// The checklist of one task. Every action throws when it fails, so the screen can show the message.
export function useChecklist(taskId: string) {
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
    addItem: (text: string) => run(() => checklistService.addItem(taskId, text)),
    renameItem: (id: string, text: string) => run(() => checklistService.renameItem(id, text)),
    setItemDone: (id: string, done: boolean) => run(() => checklistService.setItemDone(id, done)),
    deleteItem: (id: string) => run(() => checklistService.deleteItem(id)),
  };
}
