import { useEffect, useSyncExternalStore } from "react";
import * as calendarService from "../services/calendarService";
import { createKeyedLoader } from "./createKeyedLoader";

const KEY = "calendar";
const loader = createKeyedLoader(() => calendarService.getDeadlineTasks());

// All tasks with a deadline, read again every time the Calendar page is shown.
export function useCalendarData() {
  const snapshot = useSyncExternalStore(loader.subscribe, loader.getSnapshot);

  useEffect(() => {
    void loader.load(KEY);
  }, []);

  return { state: loader.stateFor(snapshot, KEY) };
}
