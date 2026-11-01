import { useEffect, useSyncExternalStore } from "react";
import * as taskService from "../services/taskService";
import type { TaskPriority, TaskStatus } from "../types/task";
import { createKeyedLoader } from "./createKeyedLoader";

const loader = createKeyedLoader(taskService.getTaskDetail);

// The state is undefined when there is no task id in the address. Every action throws when it fails,
// so the screen that asked can show the message.
export function useTaskDetail(taskId: string | undefined) {
  const snapshot = useSyncExternalStore(loader.subscribe, loader.getSnapshot);

  useEffect(() => {
    if (taskId) void loader.load(taskId);
  }, [taskId]);

  async function refresh() {
    if (taskId) await loader.load(taskId);
  }

  return {
    state: loader.stateFor(snapshot, taskId),
    async updateTask(title: string, priority: TaskPriority, dueDate: string, description: string) {
      if (!taskId) return;
      await taskService.updateTask(taskId, title, priority, dueDate, description);
      await refresh();
    },
    async setStatus(status: TaskStatus) {
      if (!taskId) return;
      await taskService.setTaskStatus(taskId, status);
      await refresh();
    },
    // After this the task no longer exists, so the screen must leave its page.
    async deleteTask() {
      if (!taskId) return;
      await taskService.deleteTask(taskId);
    },
  };
}
