import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/noteRepository";
import type { TaskNote } from "../types/taskExtras";
import { getLocalProfileId } from "./profileService";

export const NOTE_MAX_LENGTH = 1000;

function validateBody(input: string): string {
  const body = input.trim();
  if (!hasVisibleText(body)) throw new ValidationError("Write something in the note.", "body");
  if (body.length > NOTE_MAX_LENGTH) {
    throw new ValidationError(`The note can have at most ${NOTE_MAX_LENGTH} characters.`, "body");
  }
  return body;
}

export async function getNotes(taskId: string): Promise<TaskNote[]> {
  return repository.listNotes(taskId);
}

export async function addNote(taskId: string, bodyInput: string): Promise<void> {
  const body = validateBody(bodyInput);
  // In the offline app every note is written by the local user.
  const authorProfileId = await getLocalProfileId();
  await repository.insertNote({ id: crypto.randomUUID(), taskId, authorProfileId, body, now: new Date().toISOString() });
}

export async function editNote(id: string, bodyInput: string): Promise<void> {
  const changed = await repository.updateNoteBody(id, validateBody(bodyInput), new Date().toISOString());
  if (!changed) throw new ValidationError("This note no longer exists.");
}

export async function deleteNote(id: string): Promise<void> {
  const deleted = await repository.deleteNote(id);
  if (!deleted) throw new ValidationError("This note no longer exists.");
}
