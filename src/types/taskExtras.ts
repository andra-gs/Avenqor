// Checklist items and notes of a task. They are built from the database by checklistService and noteService.
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface TaskNote {
  id: string;
  body: string;
  // Name of the profile that wrote the note, or undefined when that profile no longer exists.
  authorName: string | undefined;
  // UTC ISO 8601 timestamps. The note was edited when the two differ.
  createdAt: string;
  updatedAt: string;
}
