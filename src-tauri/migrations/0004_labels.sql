-- Migration 4: labels. A label belongs to one project; a task can carry any number of the labels of its own
-- project. Deleting a project deletes its labels, and deleting a label (or a task) removes the links to it.
-- The color is the name of one of six fixed choices; the app maps each name to a color token.

CREATE TABLE labels (
    id         TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name       TEXT NOT NULL CHECK (length(trim(name)) > 0),
    color      TEXT NOT NULL CHECK (color IN ('neutral', 'accent', 'success', 'danger', 'info', 'warning')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    -- One name per project, ignoring upper and lower case ("Bug" and "bug" are the same label).
    UNIQUE (project_id, name COLLATE NOCASE)
);

CREATE TABLE task_labels (
    task_id  TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    label_id TEXT NOT NULL REFERENCES labels (id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_task_labels_label ON task_labels (label_id);
