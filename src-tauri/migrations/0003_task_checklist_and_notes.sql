-- Migration 3: a checklist and notes for each task.
-- Both tables belong to one task. Deleting a task (or its project or workspace) deletes them too (CASCADE).
-- Items and notes are listed in the order they were created (created_at, then the row's own number).

CREATE TABLE task_checklist_items (
    id         TEXT PRIMARY KEY NOT NULL,
    task_id    TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    text       TEXT NOT NULL CHECK (length(trim(text)) > 0),
    is_done    INTEGER NOT NULL DEFAULT 0 CHECK (is_done IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- A note remembers who wrote it. If that profile is ever deleted the note stays, without an author.
CREATE TABLE task_notes (
    id                TEXT PRIMARY KEY NOT NULL,
    task_id           TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    author_profile_id TEXT REFERENCES profiles (id) ON DELETE SET NULL,
    body              TEXT NOT NULL CHECK (length(trim(body)) > 0),
    created_at        TEXT NOT NULL,
    updated_at        TEXT NOT NULL
);

CREATE INDEX idx_task_checklist_items_task ON task_checklist_items (task_id);
CREATE INDEX idx_task_notes_task ON task_notes (task_id);
