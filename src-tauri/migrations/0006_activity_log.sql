-- Migration 6: local activity history.
-- One table, `activity_log`, filled by SQLite triggers. A trigger runs in the same statement as the change
-- it records, so a change and its history entry are saved together or not at all, with no extra code in
-- the app. The title of the thing is copied into the entry, so the history stays readable after the
-- task or document is deleted.
--
-- Recorded: workspace created/renamed; project created, edited, archived, restored, deleted; task created,
-- edited, moved to another status, deleted; document created, edited, deleted.
-- Not recorded: checklist items, notes, labels (too frequent), and the deletion of a workspace (its own
-- history is deleted with it, so there is nowhere to show the entry).
-- The person is the local profile: the first profile created (the app has exactly one until accounts exist).
-- Entries of a project are deleted with the project; entries of a workspace with the workspace. Deleting a
-- project leaves one "project deleted" entry in its workspace. Deletes caused by a parent being deleted
-- (tasks of a deleted project) are not recorded one by one: the WHEN checks skip them.

CREATE TABLE activity_log (
    id               TEXT PRIMARY KEY NOT NULL,
    workspace_id     TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    project_id       TEXT REFERENCES projects (id) ON DELETE CASCADE,
    actor_profile_id TEXT REFERENCES profiles (id) ON DELETE SET NULL,
    action           TEXT NOT NULL CHECK (action IN (
                         'workspace_created', 'workspace_renamed',
                         'project_created', 'project_updated', 'project_archived', 'project_restored', 'project_deleted',
                         'task_created', 'task_updated', 'task_status_changed', 'task_deleted',
                         'document_created', 'document_updated', 'document_deleted')),
    subject_title    TEXT NOT NULL,
    old_value        TEXT,
    new_value        TEXT,
    created_at       TEXT NOT NULL
);

CREATE INDEX idx_activity_workspace ON activity_log (workspace_id, created_at);
CREATE INDEX idx_activity_project ON activity_log (project_id, created_at);
CREATE INDEX idx_activity_created ON activity_log (created_at);

CREATE TRIGGER trg_activity_workspace_created
AFTER INSERT ON workspaces
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.id, NULL, NEW.owner_profile_id, 'workspace_created', NEW.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_workspace_renamed
AFTER UPDATE ON workspaces
WHEN OLD.name IS NOT NEW.name
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.id, NULL, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'workspace_renamed', NEW.name, OLD.name, NEW.name, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_project_created
AFTER INSERT ON projects
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.workspace_id, NEW.id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'project_created', NEW.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_project_archived
AFTER UPDATE ON projects
WHEN OLD.status = 'active' AND NEW.status = 'archived'
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.workspace_id, NEW.id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'project_archived', NEW.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_project_restored
AFTER UPDATE ON projects
WHEN OLD.status = 'archived' AND NEW.status = 'active'
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.workspace_id, NEW.id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'project_restored', NEW.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_project_updated
AFTER UPDATE ON projects
WHEN OLD.name IS NOT NEW.name OR OLD.description IS NOT NEW.description
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            NEW.workspace_id, NEW.id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'project_updated', NEW.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_project_deleted
AFTER DELETE ON projects
WHEN EXISTS (SELECT 1 FROM workspaces WHERE id = OLD.workspace_id)
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            OLD.workspace_id, NULL, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'project_deleted', OLD.name, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_task_created
AFTER INSERT ON tasks
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = NEW.project_id), NEW.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'task_created', NEW.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_task_status_changed
AFTER UPDATE ON tasks
WHEN OLD.status IS NOT NEW.status
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = NEW.project_id), NEW.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'task_status_changed', NEW.title, OLD.status, NEW.status, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_task_updated
AFTER UPDATE ON tasks
WHEN OLD.title IS NOT NEW.title OR OLD.description IS NOT NEW.description OR OLD.priority IS NOT NEW.priority OR OLD.due_date IS NOT NEW.due_date
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = NEW.project_id), NEW.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'task_updated', NEW.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_task_deleted
AFTER DELETE ON tasks
WHEN EXISTS (SELECT 1 FROM projects WHERE id = OLD.project_id)
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = OLD.project_id), OLD.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'task_deleted', OLD.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_document_created
AFTER INSERT ON documents
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = NEW.project_id), NEW.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'document_created', NEW.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_document_updated
AFTER UPDATE ON documents
WHEN OLD.title IS NOT NEW.title OR OLD.kind IS NOT NEW.kind OR OLD.body IS NOT NEW.body
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = NEW.project_id), NEW.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'document_updated', NEW.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;

CREATE TRIGGER trg_activity_document_deleted
AFTER DELETE ON documents
WHEN EXISTS (SELECT 1 FROM projects WHERE id = OLD.project_id)
BEGIN
    INSERT INTO activity_log (id, workspace_id, project_id, actor_profile_id, action, subject_title, old_value, new_value, created_at)
    VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
            (SELECT workspace_id FROM projects WHERE id = OLD.project_id), OLD.project_id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 'document_deleted', OLD.title, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;
