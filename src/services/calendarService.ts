import * as repository from "../repositories/calendarRepository";
import type { DeadlineTask } from "../types/calendar";

export async function getDeadlineTasks(): Promise<DeadlineTask[]> {
  return repository.listDeadlineTasks();
}

// Groups tasks by their deadline date, so the month grid can look up one day at a time.
export function groupByDate(tasks: DeadlineTask[]): Map<string, DeadlineTask[]> {
  const groups = new Map<string, DeadlineTask[]>();
  for (const task of tasks) {
    const list = groups.get(task.dueDate);
    if (list) list.push(task);
    else groups.set(task.dueDate, [task]);
  }
  return groups;
}

// The tasks still to do, soonest first. Overdue tasks come first because their dates are the earliest.
export function getOpenDeadlines(tasks: DeadlineTask[]): DeadlineTask[] {
  return tasks.filter((task) => task.status !== "done");
}
