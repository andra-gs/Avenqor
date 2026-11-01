import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/taskRepository";
import { TASK_STATUSES, type TaskDetail, type TaskItem, type TaskPriority, type TaskStatus } from "../types/task";
import { getLocalProfileId } from "./profileService";

export const TASK_TITLE_MAX_LENGTH = 120;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

// A deadline is empty (no deadline) or a real calendar date written "YYYY-MM-DD".
function parseDueDate(input: string): string | null {
  const value = input.trim();
  if (value === "") return null;
  const invalid = new ValidationError("Enter a valid deadline date.", "dueDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw invalid;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw invalid;
  return value;
}

// Business rules for the fields of a task. Returns the cleaned values or throws a ValidationError.
function validateTaskFields(
  titleInput: string,
  priority: TaskPriority,
  dueDateInput: string,
  descriptionInput: string,
): { title: string; description: string; dueDate: string | null } {
  const title = titleInput.trim();
  if (!hasVisibleText(title)) throw new ValidationError("Enter a task title.", "title");
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    throw new ValidationError(`The title can have at most ${TASK_TITLE_MAX_LENGTH} characters.`, "title");
  }
  const description = descriptionInput.trim();
  if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
    throw new ValidationError(`The description can have at most ${TASK_DESCRIPTION_MAX_LENGTH} characters.`, "description");
  }
  if (!PRIORITIES.includes(priority)) throw new ValidationError("Choose a priority.");
  return { title, description, dueDate: parseDueDate(dueDateInput) };
}

export async function createTask(
  projectId: string,
  titleInput: string,
  priority: TaskPriority,
  dueDateInput: string,
  descriptionInput: string,
): Promise<void> {
  const { title, description, dueDate } = validateTaskFields(titleInput, priority, dueDateInput, descriptionInput);
  // In the offline app every task is the local user's own, so it is assigned to the local profile.
  const assigneeProfileId = await getLocalProfileId();
  await repository.insertTask({
    id: crypto.randomUUID(),
    projectId,
    title,
    description,
    priority,
    dueDate,
    assigneeProfileId,
    now: new Date().toISOString(),
  });
}

export async function updateTask(
  id: string,
  titleInput: string,
  priority: TaskPriority,
  dueDateInput: string,
  descriptionInput: string,
): Promise<void> {
  const { title, description, dueDate } = validateTaskFields(titleInput, priority, dueDateInput, descriptionInput);
  const changed = await repository.updateTaskDetails(
    id,
    { title, description, priority, dueDate },
    new Date().toISOString(),
  );
  if (!changed) throw new ValidationError("This task no longer exists.");
}

export async function getTaskDetail(id: string): Promise<TaskDetail | undefined> {
  return repository.getTaskDetail(id);
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  if (!TASK_STATUSES.includes(status)) throw new ValidationError("Choose a valid status.");
  const changed = await repository.updateTaskStatus(id, status, new Date().toISOString());
  if (!changed) throw new ValidationError("This task no longer exists.");
}

// "Mark done" and "Reopen" on the task list are the same change as moving a task on the board.
export async function setTaskDone(id: string, done: boolean): Promise<void> {
  await setTaskStatus(id, done ? "done" : "todo");
}

export async function deleteTask(id: string): Promise<void> {
  const deleted = await repository.deleteTask(id);
  if (!deleted) throw new ValidationError("This task no longer exists.");
}

// Choices for the task list of a project. "all" means no limit on that point.
export interface TaskFilters {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  // A label id, or "all".
  labelId: string;
}

export const NO_TASK_FILTERS: TaskFilters = { status: "all", priority: "all", labelId: "all" };

export function hasTaskFilters(filters: TaskFilters): boolean {
  return filters.status !== "all" || filters.priority !== "all" || filters.labelId !== "all";
}

// The tasks that match every choice, in the same order.
export function filterTasks(tasks: TaskItem[], filters: TaskFilters): TaskItem[] {
  return tasks.filter(
    (task) =>
      (filters.status === "all" || task.status === filters.status) &&
      (filters.priority === "all" || task.priority === filters.priority) &&
      (filters.labelId === "all" || task.labels.some((label) => label.id === filters.labelId)),
  );
}
