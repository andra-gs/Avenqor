import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import { calculateProgress } from "../lib/progress";
import * as labelRepository from "../repositories/labelRepository";
import * as repository from "../repositories/projectRepository";
import type { ProjectDetail, ProjectStatus } from "../types/project";
import { getProjectActivity } from "./activityService";

export const PROJECT_NAME_MAX_LENGTH = 60;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 300;

// Business rules for the fields of a project. Returns the cleaned values or throws a ValidationError.
function validateProjectFields(nameInput: string, descriptionInput: string): { name: string; description: string } {
  const name = nameInput.trim();
  const description = descriptionInput.trim();
  if (!hasVisibleText(name)) throw new ValidationError("Enter a project name.", "name");
  if (name.length > PROJECT_NAME_MAX_LENGTH) {
    throw new ValidationError(`The name can have at most ${PROJECT_NAME_MAX_LENGTH} characters.`, "name");
  }
  if (description.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
    throw new ValidationError(`The description can have at most ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`, "description");
  }
  return { name, description };
}

export async function createProject(workspaceId: string, nameInput: string, descriptionInput: string): Promise<void> {
  const { name, description } = validateProjectFields(nameInput, descriptionInput);
  await repository.insertProject({
    id: crypto.randomUUID(),
    workspaceId,
    name,
    description,
    now: new Date().toISOString(),
  });
}

export async function updateProject(id: string, nameInput: string, descriptionInput: string): Promise<void> {
  const { name, description } = validateProjectFields(nameInput, descriptionInput);
  const changed = await repository.updateProjectDetails(id, name, description, new Date().toISOString());
  if (!changed) throw new ValidationError("This project no longer exists.");
}

// Everything the project page shows. Progress is calculated from the tasks, never stored.
export async function getProjectDetail(id: string): Promise<ProjectDetail | undefined> {
  const data = await repository.getProjectDetail(id);
  if (!data) return undefined;

  const [labelsByTask, labels, activity] = await Promise.all([
    labelRepository.listLabelsByTask(id),
    labelRepository.listProjectLabels(id),
    getProjectActivity(id),
  ]);
  const completedTaskCount = data.tasks.filter((task) => task.status === "done").length;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    progressPercent: calculateProgress(completedTaskCount, data.tasks.length),
    workspaceId: data.workspaceId,
    workspaceName: data.workspaceName,
    taskCount: data.tasks.length,
    completedTaskCount,
    tasks: data.tasks.map((task) => ({ ...task, labels: labelsByTask.get(task.id) ?? [] })),
    labels,
    activity,
  };
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<void> {
  const changed = await repository.updateProjectStatus(id, status, new Date().toISOString());
  if (!changed) throw new ValidationError("This project no longer exists.");
}

export async function deleteProject(id: string): Promise<void> {
  const deleted = await repository.deleteProject(id);
  if (!deleted) throw new ValidationError("This project no longer exists.");
}
