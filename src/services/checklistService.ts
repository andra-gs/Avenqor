import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/checklistRepository";
import type { ChecklistItem } from "../types/taskExtras";

export const CHECKLIST_ITEM_MAX_LENGTH = 120;

function validateText(input: string): string {
  const text = input.trim();
  if (!hasVisibleText(text)) throw new ValidationError("Enter the checklist item.", "text");
  if (text.length > CHECKLIST_ITEM_MAX_LENGTH) {
    throw new ValidationError(`The item can have at most ${CHECKLIST_ITEM_MAX_LENGTH} characters.`, "text");
  }
  return text;
}

export async function getChecklist(taskId: string): Promise<ChecklistItem[]> {
  return repository.listItems(taskId);
}

export async function addItem(taskId: string, textInput: string): Promise<void> {
  await repository.insertItem({ id: crypto.randomUUID(), taskId, text: validateText(textInput), now: new Date().toISOString() });
}

export async function renameItem(id: string, textInput: string): Promise<void> {
  const changed = await repository.updateItemText(id, validateText(textInput), new Date().toISOString());
  if (!changed) throw new ValidationError("This item no longer exists.");
}

export async function setItemDone(id: string, done: boolean): Promise<void> {
  const changed = await repository.updateItemDone(id, done, new Date().toISOString());
  if (!changed) throw new ValidationError("This item no longer exists.");
}

export async function deleteItem(id: string): Promise<void> {
  const deleted = await repository.deleteItem(id);
  if (!deleted) throw new ValidationError("This item no longer exists.");
}

// "2 of 5 done", or an empty text when there are no items.
export function summarizeChecklist(items: ChecklistItem[]): string {
  if (items.length === 0) return "";
  return `${items.filter((item) => item.done).length} of ${items.length} done`;
}
