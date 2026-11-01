import type { TaskPriority, TaskStatus } from "./task";

// A task that has a deadline, with the project it belongs to. Built from the database by calendarService.
export interface DeadlineTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  // Calendar date "YYYY-MM-DD".
  dueDate: string;
  projectId: string;
  projectName: string;
}
