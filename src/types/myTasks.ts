import type { TaskPriority, TaskStatus } from "./task";

// A task assigned to the local profile, with its project. Built from the database by myTasksService.
export interface MyTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  // Calendar date "YYYY-MM-DD", or undefined when the task has no deadline.
  dueDate: string | undefined;
  projectId: string;
  projectName: string;
}
