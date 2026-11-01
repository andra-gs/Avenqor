import { useEffect, useSyncExternalStore } from "react";
import * as myTasksService from "../services/myTasksService";
import { createKeyedLoader } from "./createKeyedLoader";

const KEY = "my-tasks";
const loader = createKeyedLoader(() => myTasksService.getMyTasks());

// The tasks assigned to the local profile, read again every time the My Tasks page is shown.
export function useMyTasks() {
  const snapshot = useSyncExternalStore(loader.subscribe, loader.getSnapshot);

  useEffect(() => {
    void loader.load(KEY);
  }, []);

  return { state: loader.stateFor(snapshot, KEY) };
}
