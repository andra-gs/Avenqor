-- Migration 5: project documents (notes, requirements, meeting notes, API references, UI/UX decisions).
-- A document belongs to one project and is deleted with it. The body is plain text. Attachments are
-- not part of this table: files would live in an application folder and need their own design.

CREATE TABLE documents (
    id         TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    title      TEXT NOT NULL CHECK (length(trim(title)) > 0),
    kind       TEXT NOT NULL CHECK (kind IN ('notes', 'requirements', 'meeting', 'api', 'design')),
    body       TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_documents_project ON documents (project_id);
CREATE INDEX idx_documents_updated ON documents (updated_at);
