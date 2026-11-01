import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/labelRepository";
import { LABEL_COLORS, type Label, type LabelColor } from "../types/label";

export const LABEL_NAME_MAX_LENGTH = 30;

// Business rules for the fields of a label. Returns the cleaned values or throws a ValidationError.
function validateFields(nameInput: string, color: string): { name: string; color: LabelColor } {
  const name = nameInput.trim();
  if (!hasVisibleText(name)) throw new ValidationError("Enter a label name.", "name");
  if (name.length > LABEL_NAME_MAX_LENGTH) {
    throw new ValidationError(`The name can have at most ${LABEL_NAME_MAX_LENGTH} characters.`, "name");
  }
  if (!LABEL_COLORS.includes(color as LabelColor)) throw new ValidationError("Choose a color.", "color");
  return { name, color: color as LabelColor };
}

async function assertNameFree(projectId: string, name: string, exceptLabelId: string): Promise<void> {
  if (await repository.nameIsTaken(projectId, name, exceptLabelId)) {
    throw new ValidationError("This project already has a label with this name.", "name");
  }
}

// Creates a label and returns its id.
export async function createLabel(projectId: string, nameInput: string, colorInput: string): Promise<string> {
  const { name, color } = validateFields(nameInput, colorInput);
  await assertNameFree(projectId, name, "");
  const id = crypto.randomUUID();
  await repository.insertLabel({ id, projectId, name, color, now: new Date().toISOString() });
  return id;
}

export async function updateLabel(id: string, nameInput: string, colorInput: string): Promise<void> {
  const { name, color } = validateFields(nameInput, colorInput);
  const projectId = await repository.getLabelProjectId(id);
  if (!projectId) throw new ValidationError("This label no longer exists.");
  await assertNameFree(projectId, name, id);
  await repository.updateLabel(id, name, color, new Date().toISOString());
}

// The tasks lose the label; the tasks themselves stay.
export async function deleteLabel(id: string): Promise<void> {
  const deleted = await repository.deleteLabel(id);
  if (!deleted) throw new ValidationError("This label no longer exists.");
}

// A task can only carry labels of its own project.
export async function attachLabel(taskId: string, labelId: string): Promise<void> {
  const [taskProject, labelProject] = await Promise.all([
    repository.getTaskProjectId(taskId),
    repository.getLabelProjectId(labelId),
  ]);
  if (!taskProject) throw new ValidationError("This task no longer exists.");
  if (!labelProject) throw new ValidationError("This label no longer exists.");
  if (taskProject !== labelProject) throw new ValidationError("This label belongs to another project.");
  await repository.attachLabel(taskId, labelId);
}

export async function detachLabel(taskId: string, labelId: string): Promise<void> {
  await repository.detachLabel(taskId, labelId);
}

// Creates a label in the project of the task and puts it on the task. The two steps are not one
// transaction; if the second fails, the new label simply stays unused in the project.
export async function createLabelForTask(taskId: string, nameInput: string, colorInput: string): Promise<void> {
  const projectId = await repository.getTaskProjectId(taskId);
  if (!projectId) throw new ValidationError("This task no longer exists.");
  const labelId = await createLabel(projectId, nameInput, colorInput);
  await repository.attachLabel(taskId, labelId);
}

export interface TaskLabels {
  attached: Label[];
  // Labels of the same project that the task does not carry yet.
  available: Label[];
}

// Returns undefined when the task does not exist.
export async function getTaskLabels(taskId: string): Promise<TaskLabels | undefined> {
  const projectId = await repository.getTaskProjectId(taskId);
  if (!projectId) return undefined;
  const [attached, all] = await Promise.all([repository.listLabelsOfTask(taskId), repository.listProjectLabels(projectId)]);
  const attachedIds = new Set(attached.map((label) => label.id));
  return { attached, available: all.filter((label) => !attachedIds.has(label.id)) };
}
