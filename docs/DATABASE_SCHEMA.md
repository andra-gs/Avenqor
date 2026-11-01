# Database Schema

Last updated: 2026-10-31

> **Status (2026-10-31): migrations 1 to 6 are applied** (schema version 6, 11 tables, foreign keys on; reported by the developer 2026-10-29 in development mode and in the release program). Screens read and write all of these tables. Backup and restore (step 4a, verified 2026-10-30) read and replace all 11 tables. Status labels are explained in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).

## Rules for the schema (Agreed)

From `CLAUDE.md`:

- Every schema change is made through a **migration**. The schema is never edited by hand.
- Use foreign keys, constraints, and indexes where appropriate, and choose deletion behavior deliberately.
- Use transactions when several changes must succeed together.
- User data must survive upgrades and schema changes.
- Database operations stay out of UI components.
- Large binary files are not stored in the database unless there is a clear reason. For the planned Documents update (Future) the developer **Agreed 2026-10-30** to store imported files in the database (limit 10 MB per file) so there is one data file and backups stay simple; nothing like this exists yet.
- The backup file includes a format or schema version.

## What the database must be able to hold (Agreed categories)

These are the kinds of information `CLAUDE.md` says belong in SQLite. The tables below implement all of them except preferences.

- Workspaces
- Projects, with descriptions and status
- Tasks, with status, priority, and deadline
- Labels, checklists, subtasks, and task comments or notes
- Project members (a data model for future collaboration)
- Activity history
- Documents (today plain text rows; the planned file model is Future)
- Preferences (no table yet; not needed so far)

**Project progress** is derived from real stored task data and has no stored column.

## Relationships

The product hierarchy from `CLAUDE.md`; the tables below follow it.

```
Workspace ──< Project ──< Task
```

A workspace contains projects, and a project contains tasks and related resources (deadlines, documents, activity).

## Constraints already fixed by requirements

- Kanban status values start as: To Do, In Progress, Review, Done.
- The model must allow the roles Owner, Admin, Member, and Guest in future, without an offline permission system.

## Tables

Conventions (Agreed 2026-10-25): IDs are UUID text created by the app; deadlines are text `YYYY-MM-DD`; timestamps are UTC ISO 8601 text supplied by the app. Project progress is not stored: it is calculated from tasks.

The first five tables in the list were created in migration 1. Two more tables were created in migration 3 (applied, reported by the developer 2026-10-28): `task_checklist_items` (`id`, `task_id` to `tasks` with CASCADE, `text` not empty, `is_done` 0 or 1, `created_at`, `updated_at`; index on `task_id`; listed by `created_at`, then the row's own number) and `task_notes` (`id`, `task_id` to `tasks` with CASCADE, `author_profile_id` to `profiles` with SET NULL, `body` not empty, `created_at`, `updated_at`; index on `task_id`). Claude ran migrations 1 to 3 in an in-memory SQLite database (Python, 2026-10-28): the empty-text CHECKs and the foreign key reject bad rows, deleting a task removes its items and notes, deleting a note's author profile clears `author_profile_id` and keeps the note, and notes list newest first.

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | The local user (one row now; accounts come in a later phase) | `id`, `display_name`, `created_at` |
| `workspaces` | A group of projects | `id`, `name`, `description`, `owner_profile_id` (to `profiles`, RESTRICT), `created_at`, `updated_at` |
| `workspace_members` | Who belongs to a workspace and with which role (`owner`, `admin`, `member`, `guest`); stored for future collaboration, with no permission system | `workspace_id` (CASCADE), `profile_id` (CASCADE), `role`; primary key is the pair |
| `projects` | A project in a workspace | `id`, `workspace_id` (CASCADE), `name`, `description`, `status` (`active`, `archived`), `created_at`, `updated_at` |
| `tasks` | A task in a project | `id`, `project_id` (CASCADE), `title`, `description`, `status` (`todo`, `in_progress`, `review`, `done`), `priority` (`low`, `medium`, `high`), `due_date` (optional), `assignee_profile_id` (optional, SET NULL), `created_at`, `updated_at`, `completed_at` |
| `task_checklist_items` | Checklist items of a task (migration 3) | `id`, `task_id` (CASCADE), `text`, `is_done`, `created_at`, `updated_at` |
| `task_notes` | Notes of a task (migration 3) | `id`, `task_id` (CASCADE), `author_profile_id` (optional, SET NULL), `body`, `created_at`, `updated_at` |
| `labels` | Labels of a project (migration 4) | `id`, `project_id` (CASCADE), `name` (unique per project, ignoring case), `color` (`neutral`, `accent`, `success`, `danger`, `info`, `warning`), `created_at`, `updated_at` |
| `task_labels` | Which labels a task has (migration 4) | `task_id` (CASCADE), `label_id` (CASCADE); primary key is the pair |
| `documents` | Plain-text project documents (migration 5) | `id`, `project_id` (CASCADE), `title`, `kind` (`notes`, `requirements`, `meeting`, `api`, `design`), `body`, `created_at`, `updated_at` |
| `activity_log` | Local activity history, written by triggers (migration 6) | `id`, `workspace_id` (CASCADE), `project_id` (optional, CASCADE), `actor_profile_id` (optional, SET NULL), `action`, `subject_title`, `old_value`, `new_value`, `created_at` |

Constraints: names and titles must not be empty (checked after trimming spaces); status, priority, and role values are limited by `CHECK`; `due_date` must look like `YYYY-MM-DD`. Indexes: `projects(workspace_id)`, `tasks(project_id)`, `tasks(assignee_profile_id)`, `tasks(due_date)`, `workspace_members(profile_id)`.

Deletion behavior (Agreed 2026-10-25): deleting a workspace deletes its projects and their tasks; deleting a project deletes its tasks; deleting a profile that owns a workspace is blocked; deleting a profile that is only an assignee clears the assignee of its tasks. The screens must ask for confirmation first. Verified 2026-10-25 for workspace to projects (the Settings page showed 2 projects, then 0 after the workspace was deleted); project to tasks verified 2026-10-26 the same way (the counts went to 0 after deleting a project). This depends on SQLite foreign keys being on for every connection, which the Settings screen reports (foreign keys reported on 2026-10-25; the cascade was verified with row counts on 2026-10-25 and 2026-10-26).

Trigger (migration 2, verified 2026-10-25 by a new workspace showing 1 member): `trg_workspaces_add_owner_member` runs after a row is inserted into `workspaces` and adds the owner to `workspace_members` with the role `owner`. It replaces a manual transaction: the workspace and its owner membership are saved by one statement, so both rows exist or neither does.

Migration 4 (written 2026-10-28, applied: the developer reported `schema version 4`, 9 tables on 2026-10-29) adds `labels` (`id`, `project_id` to `projects` with CASCADE, `name` not empty after trimming, `color` limited by `CHECK` to `neutral`, `accent`, `success`, `danger`, `info`, `warning`, `created_at`, `updated_at`; the name is unique per project ignoring upper and lower case) and `task_labels` (`task_id` to `tasks` with CASCADE, `label_id` to `labels` with CASCADE; primary key is the pair; index on `label_id`). A label belongs to one project; the rule that a task only carries labels of its own project is kept in `labelService` and in the SQL that links them (a label of another project is not linked). Claude ran migrations 1 to 4 and the repository's SQL in an in-memory SQLite database (Python, 2026-10-28): "Bug" and "bug" are rejected in one project but allowed in two projects, a color outside the list is rejected, linking twice or to a task of another project adds nothing, deleting a label, a task, or a project removes the links or labels that depend on it.

Migration 5 (written 2026-10-29, applied) adds `documents` (`id`, `project_id` to `projects` with CASCADE, `title` not empty after trimming, `kind` limited by `CHECK` to `notes`, `requirements`, `meeting`, `api`, `design`, `body` plain text with default empty, `created_at`, `updated_at`; indexes on `project_id` and `updated_at`). Claude ran migrations 1 to 5 and the repository's SQL in an in-memory SQLite database (Python, 2026-10-29): an empty title, an unknown type, and a missing project are rejected; the list is newest first and has no body; the project choices list only active projects; update and delete report whether the row existed; deleting a project deletes its documents.

Migration 6 (written 2026-10-29, applied: the developer reported `schema version 6`, 11 tables on 2026-10-29) adds `activity_log` (`id` UUID text made by the trigger, `workspace_id` to `workspaces` with CASCADE, `project_id` optional to `projects` with CASCADE, `actor_profile_id` optional to `profiles` with SET NULL, `action` limited by `CHECK` to 14 values such as `task_created` and `task_status_changed`, `subject_title` (a copy of the name or title, so the entry stays readable after the thing is deleted), `old_value` and `new_value` (used for a status change and a workspace rename), `created_at` UTC ISO 8601 with milliseconds; indexes on `(workspace_id, created_at)`, `(project_id, created_at)`, and `created_at`). The entries are written by 14 SQLite triggers named `trg_activity_*` (workspace created and renamed; project created, edited, archived, restored, deleted; task created, edited, status changed, deleted; document created, edited, deleted), in the same statement as the change, so both are saved or neither is. The person is the local profile (the first profile created). Not recorded: checklist items, notes, labels, and the deletion of a workspace. Deletes caused by a parent's deletion are not recorded one by one (the triggers check that the parent still exists). Deleting a project removes its entries and leaves one "project deleted" entry in its workspace; deleting a workspace removes all its entries. Claude ran migrations 1 to 6 in an in-memory SQLite database (Python, 2026-10-29) through a scenario of creates, edits, moves, archive and restore, deletes, a project delete, and a workspace delete: each change produced exactly one entry with the right values, changes to `updated_at` alone produced none, no foreign key violation occurred (`PRAGMA foreign_key_check` empty), and the three read queries returned the expected rows.

No table yet: preferences. Checklists and notes are in migration 3 (see above). Nested subtasks are not planned for the MVP.

## Migrations

| Version | Description | Applied in | Status |
|---|---|---|---|
| 6 | `activity_log` (`src-tauri/migrations/0006_activity_log.sql`) | on app start, after migration 5 | applied (reported by the developer 2026-10-29: schema version 6, 11 tables) |
| 5 | `documents` (`src-tauri/migrations/0005_documents.sql`) | on app start, after migration 4 | applied (reported by the developer 2026-10-29: schema version 5, 10 tables) |
| 4 | `labels` (`src-tauri/migrations/0004_labels.sql`) | on app start, after migration 3 | applied (reported by the developer 2026-10-29: schema version 4, 9 tables) |
| 3 | `task_checklist_and_notes` (`src-tauri/migrations/0003_task_checklist_and_notes.sql`) | on app start, after migration 2 | applied (reported by the developer 2026-10-28: schema version 3, 7 tables) |
| 2 | `workspace_owner_member_trigger` (`src-tauri/migrations/0002_workspace_owner_member.sql`) | on app start, after migration 1 | applied (reported by the developer 2026-10-25: schema version 2, a new workspace shows 1 member) |
| 1 | `create_initial_tables` (`src-tauri/migrations/0001_initial.sql`) | on app start, when the database is opened | applied (reported by the developer 2026-10-25) |

Migration files live in `src-tauri/migrations/` and are registered in `src-tauri/src/lib.rs` for the connection `sqlite:avenqor.db`. Each change is a new file with the next version number; existing migrations are never edited. The database file is `%APPDATA%\io.github.andra-gs.avenqor\avenqor.db` (Roaming; see the known issue in DEVELOPMENT_STATUS.md).

## Open questions

Decided on 2026-10-25: ID format (UUID text), date format, local profile (a row in `profiles`), deletion behavior (above), database file location (app config folder, see above).

Planned (Future): documents as files and folders, with imported files stored in the database (see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)). It will need a new migration that moves today's documents; it is not designed yet.
