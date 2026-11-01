import { useEffect, useSyncExternalStore } from "react";
import * as labelService from "../services/labelService";
import { createKeyedLoader } from "./createKeyedLoader";

const loader = createKeyedLoader(labelService.getTaskLabels);

// The labels of one task and the labels it can still receive. Every action throws when it fails,
// so the screen can show the message.
export function useTaskLabels(taskId: string) {
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
    attach: (labelId: string) => run(() => labelService.attachLabel(taskId, labelId)),
    detach: (labelId: string) => run(() => labelService.detachLabel(taskId, labelId)),
    createAndAttach: (name: string, color: string) => run(() => labelService.createLabelForTask(taskId, name, color)),
  };
}
