# Architecture

Last updated: 2026-10-31

> **Status (2026-10-31): the layers below (UI, hooks, services, repositories, database) exist and were verified by the developer through Phase 3 and step 4a (backup and restore).** The first half of this document describes the **Agreed** principles from `CLAUDE.md`; the "Actual implementation" section records what exists and has been verified. Status labels are explained in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).

## Technology (Agreed)

Tauri 2 (desktop shell), React + TypeScript + Vite (interface), Rust (native side), SQLite (local database). Styling uses Tailwind CSS 4. Target for the first release: Windows.

**How the pieces fit:** Tauri opens a native window that shows the React interface inside Microsoft Edge WebView2. The React code (the "frontend") cannot freely touch your computer. It can only use what Rust (the "native backend") and Tauri's permission system explicitly allow.

## Layers (Agreed)

`CLAUDE.md` requires these responsibilities to stay separate.

| Layer | Responsibility |
|---|---|
| UI components | Show the interface and react to clicks and typing. |
| Features | Group the screens and logic of one area (projects, tasks, calendar, documents). |
| Services | Business rules and coordination ("a task needs a title"). |
| Repositories | The only code that reads or writes stored data. |
| Local persistence | The SQLite database (one file). Files the person picks (backups) are read and written only through the system file windows. |
| Platform integration | Tauri commands, permissions, notifications, filesystem access. |
| External integrations | GitHub API and any future remote backend (Future). |

Intended direction of calls:

```
UI component (React)
      │  user action
      ▼
Feature  ── screen logic for one area
      │
      ▼
Service  ── business rules, validation
      │
      ▼
Repository  ── the only place that touches stored data
      │
      ▼
SQLite file (local)        Platform layer (Tauri/Rust): app data folder,
                           notifications, file access
```

UI components must not talk to the database directly (Agreed: "keep database operations out of UI components").

### Data flow example: moving a task on the Kanban board (Implemented)

1. The user drops a task card into the "Review" column (or clicks an arrow button).
2. The board page asks the task service to change the task's status (`taskService.setTaskStatus`).
3. The service checks the new status is one of To Do, In Progress, Review, Done.
4. The repository saves the new status (and sets or clears `completed_at`). A **database trigger** writes the matching activity-history entry inside the same statement, so both succeed or neither does (see "Step notes", step 3g, for why a trigger is used instead of an app-side transaction).
5. The board redraws from the saved data. After a restart, the task is still in "Review".

## Folder layout

The suggested layout from `CLAUDE.md` is now in use. The full list of tracked files is under "Actual implementation".

## Local storage (Agreed)

- Structured data goes in a local SQLite database (see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)).
- Documents are rows in the database today (plain text). The planned Documents update (Future, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)) stores imported files **inside the database** (limit 10 MB per file, Agreed 2026-10-30) so there is a single data file and backups stay simple. This replaces the earlier idea of an application-managed folder for attachments.
- The database lives in the operating system's application data directory, not the installation folder (on Windows: `%APPDATA%\io.github.andra-gs.avenqor\avenqor.db`).
- Data must survive closing and reopening the application.
- No remote backend is required for core features, and the offline app must not pretend to sync with other users.

## Security principles (Agreed)

- Grant Tauri **capabilities** (the permission files that decide what the frontend may do) with least privilege.
- Never give the frontend unrestricted filesystem, shell, or operating-system access.
- Validate all data that crosses from the frontend to the native side.
- Treat imported backup files as untrusted input.
- Keep secrets (such as GitHub tokens) out of source code and logs.

## Decisions

`CLAUDE.md` rule 16 requires options and approval for decisions with long-term consequences. The decisions below were made with the developer. Open for later: the whiteboard canvas library (see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)).

### D1. How the application accesses SQLite (decided 2026-10-25: Option A)

`CLAUDE.md` says to use "a Tauri 2-compatible SQLite plugin or another well-maintained compatible solution" and to verify compatibility first. Two options exist.

**Option A: the official Tauri SQL plugin, called from TypeScript.**
Facts from the official plugin documentation (read on 2026-10-20; tried and verified in this project since 2026-10-25, version 2.6.0):
- It is added with `npm run tauri add sql`, or manually with `cargo add tauri-plugin-sql --features sqlite`, registration in the Rust builder, and `npm install @tauri-apps/plugin-sql`.
- Migrations are defined in Rust and run in a transaction.
- The default permission (`sql:default`) allows loading, selecting, and closing. Writing needs an extra permission such as `sql:allow-execute`.
- The page states a minimum of Rust 1.90.

Trade-offs: less code to write, and it matches the wording in `CLAUDE.md`. But granting write permission lets frontend code send SQL statements, so validation must be done carefully in the services layer, and the "validate data crossing the frontend/native boundary" rule is harder to enforce.

**Option B: SQLite managed in Rust, exposed through specific Tauri commands.**
Trade-offs: a tighter boundary, because the frontend can only call named commands and Rust validates input. But there is more Rust code to write, which is a steeper learning curve, and a Rust SQLite library would still need to be chosen and verified. The suggested layout puts `repositories/` in the frontend, which would change under this option.

No Phase 0 or Phase 1 work depends on this choice.

### D2. Other decisions

| Item | Decision |
|---|---|
| Styling | Tailwind CSS 4 (approved 2026-10-22) |
| Routing | React Router 7, `HashRouter` (approved as part of the Phase 1 plan, 2026-10-22; installed and verified in step 3) |
| Local user or profile | 2026-10-25: one profile row in the database; tasks refer to it by ID |
| Date and time storage format | 2026-10-25: deadlines `YYYY-MM-DD` text; event times UTC ISO 8601 text |
| ID format | 2026-10-25: UUID text created in the app |

## Future online integration strategy

Online features are **Future** (Phase 6). Nothing here is built, and `CLAUDE.md` forbids building online features that depend on a nonexistent server.

**Agreed principles that keep the door open:**
- Keep business logic and data access modular, so another platform or data source can be added later.
- Design the data model so the roles Owner, Admin, Member, and Guest can be added later, without building a fake permission system now.
- Phase 6 will define authentication, a backend API, a cloud database, synchronization, conflict handling, and offline-to-online data migration.

**Design considerations (adopted in the Phase 2 schema, 2026-10-25):**
- Give records globally unique IDs (instead of simple counting numbers), so data created on separate computers can later be combined without ID clashes.
- Record created and updated timestamps on records, which synchronization would need.
- Keep data access behind the repository layer, so replacing local SQLite with a remote source does not require changing screens.

## Actual implementation

Branch `main` (version 1.0.0; the earlier branches `phase-1-ui` and `phase-3-kanban` were merged into it). Verified from the developer's test results and from the tracked files. The project began as the `create-tauri-app` template (`react-ts`), renamed to `project-manager`, with the demo code removed. The application now has the app frame with a custom title bar, and working workspaces, projects, tasks (with checklists, notes, and labels), a Kanban board with drag and drop, a Calendar, My Tasks, project documents, local activity history, and backup and restore, all on a local SQLite database.

### Folder layout (tracked files)

```
Avenqor-logo.png   source file of the logo
CLAUDE.md, README.md
index.html, package.json, package-lock.json
tsconfig.json, tsconfig.node.json, vite.config.ts
src/
  main.tsx, App.tsx, index.css, vite-env.d.ts
  app/             navigation.ts (sidebar destinations, page headings, title bar path)
  assets/          avenqor-logo.png (wordmark), avenqor-mark.png (the letter A)
  components/
    layout/        AppShell, Sidebar, SidebarResizeHandle, TitleBar, TopBar, WindowControls
    icons/         Icon.tsx
    ui/            ActionMenu, Avatar, Badge, BrandLogo, Button, Card, Checkbox, ConfirmDialog, Dialog, EmptyMessage, FieldFooter, IconButton, LinkCard, ListRow, PlaceholderNotice, PriorityBadge, ProgressBar, SectionHeading, SelectField, Stat, StatusBadge, TextArea, TextField
  features/        activity, backup, board, calendar, dashboard, documents, labels, my-tasks, profile, projects, reminders, search, tasks, workspaces (sections and cards that screens compose)
  pages/           Activity, Board, Calendar, Dashboard, Documents, Help, MyTasks, NotFound, Project, Settings, Task, Workspace
  hooks/           createKeyedLoader (shared loading helper), useActivityLog, useBackup, useReminderChecks, useReminderSettings, useCalendarData, useChecklist, useDashboardData, useDatabaseStatus, useDocuments, useLocalProfile, useMyTasks, useProjectDetail, useSearch, useSidebarCollapsed, useTaskDetail, useTaskLabels, useTaskNotes, useWindowMaximized, useWorkspaceDetail, useWorkspaces
  services/        activity, backup, calendar, checklist, dashboard, document, label, myTasks, note, profile, project, reminder, search, task, workspace (validation and business rules)
  repositories/    activity, backup, calendar, checklist, dashboard, databaseStatus, document, label, myTasks, note, profile, project, search, task, workspace (the only code that writes SQL)
  lib/             activityText, appInfo, backupFormat, calendar, classNames, database (the only code that opens the database), dateFormat, dueDate, errors, fileDialogs (the only code that uses the dialog and fs plugins), greeting, lastBackup, layout, notifications (the only code that uses the notification plugin), progress, reminderSettings, relativeTime, text, windowControls (the only code that uses the Tauri window API)
  styles/          tokens.css
  types/           activity, backup, calendar, dashboard, document, label, myTasks, profile, project, search, task, taskExtras, workspace
src-tauri/
  Cargo.toml, Cargo.lock, build.rs, tauri.conf.json
  capabilities/    default.json
  icons/           application icons
  migrations/      0001 to 0006 (SQL files, registered in lib.rs)
  src/             main.rs, lib.rs
.vscode/           extensions.json
docs/              the documentation files
```

Generated and not tracked by Git: `node_modules/`, `dist/`, and `src-tauri/target/`.

### Interface structure (Implemented, verified by the developer on 2026-10-23)

- **Routing:** React Router 7 (`react-router`, `^7.18.4` in `package.json`) in `HashRouter` mode. The current page is kept after `#` in the address, because a packaged desktop app has no web server to answer other addresses. Routes: `/`, `/activity`, `/workspaces/:workspaceId/activity`, `/projects/:projectId/activity`, `/my-tasks`, `/calendar`, `/documents/:documentId?`, `/workspaces/:workspaceId`, `/projects/:projectId`, `/projects/:projectId/board`, `/tasks/:taskId`, `/settings`, `/help`, and a "not found" fallback. Verified in the release build: all menu items open their pages.
- **Frame:** `AppShell` places `Sidebar` on the left and `TopBar` plus the page content on the right. The page title in the top bar comes from `src/app/navigation.ts`.
- **Data rule in practice:** screens read workspaces and the local profile only through the hooks in `src/hooks/`. Since Phase 2 the hooks read the database through services and repositories; the mock data was removed.
- **Screens:** Activity (full history), Dashboard, Workspace, Project, Board, Task, My Tasks, Calendar, Documents, Settings (including Backup and restore), Help, and Not found. All except Help read the database (verified by the developer, see [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)). `PlaceholderNotice` is no longer used by a finished screen.
- **Screens compose, hooks fetch:** pages arrange sections from `src/features/`; the sections and cards use the shared components. Progress percentages and deadline counts are calculated from task counts and dates (`src/lib/progress.ts`, `src/lib/dueDate.ts`), never typed in.
- **Collapsible sidebar:** it collapses to icons below a window width of 1100px, by the toggle button, or by dragging its edge (two states only, no stored choice).
- **Not verified:** the layout on 1366x768 and 1920x1080 screens (the window was tested at the smallest size, 960x600, and at the default size).

### Shared base components (Implemented in development mode, verified by the developer on 2026-10-23)

Located in `src/components/ui/`: `Button`, `IconButton`, the components listed in the folder layout above (for example `Button`, `Card`, `Badge`, `ProgressBar`, `ActionMenu`, `BrandLogo`). They take no `className`, so their look can only change inside the component or in `src/styles/tokens.css` (`CLAUDE.md` section 19). `PriorityBadge` and `StatusBadge` own the mapping from a task value to a color and a label. `src/lib/classNames.ts` provides `cx`, which joins class names.

Verified: in `npm run tauri dev` the components render, hover and keyboard focus work, and changing `--color-accent` changes the primary button, the "Today" badge, the first progress bar, and the sidebar highlight together. `npm run build` (TypeScript check and Vite build) passed. Not verified: the components in a release build.

### Styling and design tokens (Implemented, Agreed in `CLAUDE.md` section 19)

- Tailwind CSS 4 is used through its Vite plugin (`@tailwindcss/vite`, enabled in `vite.config.ts`). The DM Sans font comes from the package `@fontsource-variable/dm-sans` and is bundled with the app, so it works offline.
- `src/styles/tokens.css` is the single place for colors, text sizes, and corner radius. It switches off Tailwind's built-in palette, text sizes, and radius, so screens can only use token names such as `text-accent`. Values come from the Figma frame "01 Dashboard". Figma is a reference, not a binding specification.
- `src/index.css` loads the font, Tailwind, and the tokens, and sets the page defaults from tokens.
- Verified by the developer on 2026-10-23: changing `--color-accent` in `tokens.css` changed the colored line on the page without editing another file. This is the proof criterion of section 19, tested only on the placeholder page. It must be repeated once real screens exist.
- Layout sizes (sidebar width 224px, top bar height 72px) are plain CSS variables at the end of `tokens.css`. General spacing uses Tailwind's default scale.

### How the pieces are wired (from the configuration files)

- `src-tauri/tauri.conf.json`: product name `Avenqor`, version `1.0.0` (set 2026-11-01; the installer built from it was tested by the developer the same day), identifier `io.github.andra-gs.avenqor` (both changed 2026-10-25, before any data was stored; verified: the database file is created in that folder). In development it runs `npm run dev` and loads `http://localhost:1420`. For a release it runs `npm run build` (`tsc && vite build`) and packages the files from `dist`. One window of 1200x680 (minimum 960x600, centered). `bundle.targets` is `all`.
- `tauri.conf.json` `plugins.sql.preload` opens `sqlite:avenqor.db` at startup (verified by the developer 2026-10-25: the file `avenqor.db` is created in `%APPDATA%\io.github.andra-gs.avenqor`).
- `src-tauri/capabilities/default.json`: for the `main` window: `core:default`; four window permissions for the custom title bar (`core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`); `sql:default` and `sql:allow-execute`; four file permissions for backups (`dialog:allow-save`, `dialog:allow-open`, `fs:allow-write-text-file`, `fs:allow-read-text-file`); and `notification:default` for reminders.
- `src-tauri/src/main.rs` calls `project_manager_lib::run()`. `src-tauri/src/lib.rs` registers the four plugins (`sql` with the six migrations, `dialog`, `fs`, `notification`) and no custom commands.
- `src-tauri/Cargo.toml`: package `project-manager`, library `project_manager_lib`, Rust edition 2024. Dependencies: `tauri` 2, `serde`, `serde_json`, `tauri-plugin-sql` 2 (feature `sqlite`), `tauri-plugin-dialog` 2, `tauri-plugin-fs` 2, `tauri-plugin-notification` 2.
- `package.json`: dependencies `react` and `react-dom` ^19.1.0, `react-router` ^7.18.4, `@tauri-apps/api` ^2, `@tauri-apps/plugin-sql` ^2.6.0, `@tauri-apps/plugin-dialog` ^2, `@tauri-apps/plugin-fs` ^2, `@tauri-apps/plugin-notification` ^2, `tailwindcss` and `@tailwindcss/vite` ^4.3.3, `@fontsource-variable/dm-sans` ^5.3.0. Dev dependencies: `vite` ^8.0.16, `@vitejs/plugin-react` ^6.0.2, `typescript` ~6.0.3, `@tauri-apps/cli` ^2, and React type packages.
- Versions that were actually built (from the Phase 0 logs): Vite 8.3.4, `tauri` 2.12.4, `wry` 0.57.0, `tauri-build` 2.7.3.

### Data access in practice (workspaces verified by the developer 2026-10-25)

Flow for creating a workspace: the Settings form (`features/workspaces/WorkspaceManager`) calls the hook `useWorkspaces`, which calls `services/workspaceService` (checks the name, creates a UUID, gets the local profile), which calls `repositories/workspaceRepository` (parameterized SQL through `lib/database`). The hook keeps one shared list outside any screen and reloads it from the database after every change, so the sidebar and Settings stay in step. Only files in `src/repositories/` import `lib/database`. Errors that the user can fix are `ValidationError`s (`lib/errors.ts`) and are shown as written; other errors show a general sentence with the technical detail.

### Step notes (how each feature was built)

Steps in order. Each note says what was added and why; "verified" dates are from the developer's tests.

- Step 2c-1 (verified by the developer 2026-10-25): the workspace page reads the database through `useWorkspaceDetail` (workspace, its projects with task counts, deadline counts) and creates projects through `ProjectFormDialog` and `projectService`. Progress is calculated from task counts in the service. Activity is an empty list until Phase 3 (no invented entries next to real data).
- Step 2c-2a (verified 2026-10-26): the project page reads the database through `useProjectDetail` and offers new tasks (`TaskFormDialog`, `taskService`), marking tasks done or reopening them, deleting tasks, archiving or restoring the project, and deleting the project. Archived projects appear in an "Archived" section on the workspace page. Both detail hooks use `createKeyedLoader`.
- Step 2c-2b (verified by the developer 2026-10-26): the Dashboard and the local profile read the database too, and the mock data was removed.
- Step 2d (verified 2026-10-26): `ProjectFormDialog` and `TaskFormDialog` serve both creating and editing, so projects (name, description) and tasks (title, priority, deadline) can be edited.
- Phase 3 step 3a (verified by the developer 2026-10-27): the board page `src/pages/BoardPage.tsx` (route `/projects/:projectId/board`) uses `src/features/board/` (`BoardColumn`, `BoardCard`) and the same `useProjectDetail` hook. A task changes column through `taskService.setTaskStatus` and `taskRepository.updateTaskStatus`, which also set or clear `completed_at`. `setTaskDone` now calls `setTaskStatus`, so the task list and the board share one rule.
- Phase 3 step 3c (verified by the developer 2026-10-28): the Calendar page reads every task with a deadline of an active project through `useCalendarData`, `calendarService`, and `calendarRepository` (read-only, no new table). `src/lib/calendar.ts` holds the date helpers (Monday-first month grid, month changes; local dates written `YYYY-MM-DD`; checked by a throwaway Node script in three time zones on 2026-10-27, the script is not kept in the repository). `src/features/calendar/` has `MonthGrid` and `DeadlineList`.
- Phase 3 step 3d (verified by the developer 2026-10-28): the My Tasks page reads the open and finished tasks assigned to the local profile in active projects through `useMyTasks`, `myTasksService`, and `myTasksRepository` (read-only, no new table). The status filter (Open, To Do, In Progress, Review, Done, All) is applied in the page with `filterMyTasks`. Claude ran the repository's SQL against the two migrations in an in-memory SQLite database (Python, 2026-10-28): it returned only the local profile's tasks of active projects, open ones first by deadline, tasks without deadline after them, finished tasks last.
- Custom title bar (Agreed by the developer 2026-10-28, verified by the developer the same day in development mode; see DEVELOPMENT_STATUS for what was not checked): the native Windows title bar is turned off (`"decorations": false` in `tauri.conf.json`) and `src/components/layout/TitleBar.tsx` draws its own, with the color token `titlebar`, a path to the current page (`getBreadcrumbs` in `src/app/navigation.ts`, for example Workspace / Project / Board), and `WindowControls` (minimize, maximize or restore, close). `src/lib/windowControls.ts` is the only file that uses the Tauri window API. Four extra permissions were added to `src-tauri/capabilities/default.json`: `core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, and `allow-start-dragging`. Deviation from Figma: the Figma frames have no title bar of their own.
- Phase 3 step 3e-1 (verified by the developer 2026-10-28, with the corrections listed below): the task page `src/pages/TaskPage.tsx` (route `/tasks/:taskId`) reads one task with its project, workspace, and assignee name through `useTaskDetail`, `taskService.getTaskDetail`, and `taskRepository.getTaskDetail`. The task form now also edits the description (`tasks.description`, already in migration 1, at most 2000 characters); task titles in the task list, the board, My Tasks, the Calendar, and the Dashboard link to the task page, and the title bar path and top bar heading know the task page. Claude ran the new SQL (insert, update, detail query) against the two migrations in an in-memory SQLite database (Python, 2026-10-28). `tsc` run in the Claude workspace without the npm packages reported no errors other than missing-package noise, so it is only a partial check. Corrections after the developer's test (verified by the developer 2026-10-28, except the second round below): a very long description without spaces made the task page wider than the window at small sizes (fixed with a one-column grid that may shrink and `overflow-wrap: anywhere`); form messages now appear under the input they belong to, with a red border: `ValidationError` has an optional `field` (`src/lib/errors.ts`), the services name the field (`title`, `description`, `dueDate`, `name`), and `TaskFormDialog` and `ProjectFormDialog` show it with the input's `error` prop (the workspace and profile forms already did). The sidebar no longer shows the "Working name" note and, when collapsed, only the expand button; the name is larger. Second round (verified by the developer 2026-10-28; the counter was then changed again, see the third round below), at the developer's request: only the name/title box shows its message under the box; descriptions have no message but a character counter at the lower left (`TextArea` shows "used / limit" when it has a `maxLength`; the browser stops typing at the limit), and the deadline has no message either: `normalizeDateInput` in `src/lib/calendar.ts` corrects what the date box reports (a year above 9999 becomes 9999, a non-date becomes no deadline), checked with a Node script on 2026-10-28. The service rules stay as a safety net. Third round (verified by the developer 2026-10-28): every text box with a character limit, new or edit (workspace name, display name, project name and description, task title and description), shows the counter at the lower right of the box, and only once 10 percent of the limit is used; `src/components/ui/FieldFooter.tsx` draws this line (error message left, counter right) for both `TextField` and `TextArea`.
- Phase 3 step 3e-2 (verified by the developer 2026-10-28): migration 3 adds `task_checklist_items` and `task_notes`; `checklistRepository` and `noteRepository` hold the SQL, `checklistService` (items up to 120 characters) and `noteService` (notes up to 1000 characters, author = the local profile) hold the rules, `useChecklist` and `useTaskNotes` load per task, and `ChecklistSection` and `NotesSection` in `src/features/tasks/` are shown on the task page under the description. Deleting a checklist item has no confirmation and uses a small cross button (changed at the developer's request after the test, verified 2026-10-29); deleting a note asks first. The progress of a project stays based on tasks in Done, not on checklists. A new base component `Checkbox` was added.
- Phase 3 step 3e-3 (verified by the developer 2026-10-29): migration 4 adds `labels` and `task_labels`; `labelRepository` holds the SQL, `labelService` the rules (name up to 30 characters, unique per project ignoring case, a task only receives labels of its own project), `useTaskLabels` loads the labels of one task, and `useProjectDetail` now also returns the project's labels (with task counts) and creates, edits, and deletes them. `TaskItem` has a `labels` list, filled by `projectService.getProjectDetail`, so the project task list and the board cards show label badges. `src/features/labels/` has `TaskLabelsSection` (in the Properties card of the task page: remove with a cross, add an existing label, create a label that is attached at once), `ProjectLabelsSection` (a Labels section on the project page: create, edit, delete with a confirmation that names the number of affected tasks), `LabelFormDialog`, `LabelBadges`, and `labelOptions` (color names). Creating a label from a task is two statements, not one transaction (the SQL plugin pools connections); if the second fails, the new label stays unused in the project. Label colors are stored as the tone name and mapped to the color tokens by `Badge`, so a redesign needs no data change.
- Phase 3 step 3f (verified by the developer 2026-10-29; afterwards, at the developer's request, clicking the open document in the list closes it and the list box fits its content): migration 5 adds `documents`; `documentRepository` holds the SQL (lists without the text, one document with its text, the active projects for the "Project" choice), `documentService` holds the rules (title up to 80 characters, text up to 20000 characters kept as typed apart from empty space at both ends, five types) and the title search and filters (`filterDocuments`, run in memory), and `useDocuments.ts` has three hooks: `useDocumentLibrary` (list and project choices), `useDocumentDetail` (one document), and `useDocumentActions` (create, update, delete; each reads the list and the open document again). The Documents page `src/pages/DocumentsPage.tsx` uses the route `documents/:documentId?`: the list with search, type filter, and project filter is on the left and the open document on the right (`src/features/documents/`: `DocumentList`, `DocumentView`, `DocumentFormDialog`, `KindBadge`, `ProjectDocumentsSection`). The sidebar link no longer needs an exact address match (only the Dashboard does), so Documents stays highlighted on a document, and the title bar path shows Documents / document title. Deviations from Figma "08 Project Documents": the Figma frame shows one project's documents with an inline editor; here the page lists the documents of all projects with a project filter, and editing is done in a window (a dialog) like tasks and projects, so the text is plain text with no section formatting; the Figma "Local document" pill is kept as a badge.
- Phase 3 step 3g (written 2026-10-29, verified 2026-10-29): migration 6 adds `activity_log`, which is written by SQLite triggers, not by app code. Reason: the SQL plugin may use a different connection for each command, so an app-side transaction that saves a change and its history entry together is not reliable, while a trigger runs inside the same statement as the change (the same approach as the owner trigger of migration 2). The app only reads the history: `activityRepository` (three queries: newest of everything, of one workspace, of one project; 20 entries), `activityService` (the entry for the screen), and `src/lib/activityText.ts` (the sentence for each kind of entry, for example `moved task “X” from To Do to Done`, checked with a Node script on 2026-10-29; the script is not kept in the repository). `dashboardService`, `workspaceService`, and `projectService` now fill the `activity` list that the existing sections already showed (`ActivitySection`, `WorkspaceActivitySection`), so no screen layout changed. Phase 3 step 3g was verified by the developer 2026-10-29 (migration 6, schema version 6, 11 tables). Adjustments afterwards, at the developer's request (written 2026-10-29, verified 2026-10-29): `TextField` and `TextArea` set `autoComplete="off"` so the Windows web view stops showing its "Saved info" list while typing (it could not be reproduced in the Claude workspace, so it is unverified whether this is enough); and the task list on the project page replaces its Edit, Mark done or Reopen, and Delete buttons with one new base component, `src/components/ui/ActionMenu.tsx`: one "more" button (three dots, new icon `more`) opens a small menu, which closes after a choice, on a click elsewhere, or on Escape, and works with the arrow keys. Delete is in red and still asks for confirmation. Only the project page task list uses it so far.
- Logo (written 2026-10-29, verified 2026-10-29): the developer committed `Avenqor-logo.png` (the name in the logo lettering, indigo, transparent background, 1920x1080 canvas). Claude cropped it to `src/assets/avenqor-logo.png` (wordmark, 560 px wide) and cut out the letter A into `src/assets/avenqor-mark.png`; the new base component `BrandLogo` (`src/components/ui/BrandLogo.tsx`) shows the wordmark at the top of the sidebar (in place of the text name) and the small A before the name in the title bar. The application icons in `src-tauri/icons/` (all sizes, `icon.ico`, `icon.icns`) were regenerated from the letter A in indigo on a white rounded square (Pillow, not the Tauri icon command, because the Claude workspace has no npm registry); the white square keeps the icon readable on a dark taskbar. The original `Avenqor-logo.png` stays in the repository root as the source file.
- Phase 3 step 3b (written 2026-10-30, verified 2026-10-30): board cards can be dragged to another column. Decision: the browser's built-in drag and drop (HTML5 `draggable`, `onDragStart`, `onDragOver`, `onDrop`) is used instead of the library `@dnd-kit/core` mentioned in the earlier plan, because the Claude workspace has no npm registry, so the library could not be installed or checked here, and the built-in way needs no new dependency (`CLAUDE.md`: no unnecessary libraries). Trade-off: no touch or keyboard dragging; the arrow buttons stay for the keyboard, and `@dnd-kit` remains an option if this is not good enough. `BoardCard` is draggable and carries the task id under a custom data type (`src/features/board/dragData.ts`); `BoardColumn` accepts only that type, highlights while a card is over it, ignores a drop on the column the card is already in, and calls the same `onMove` as the arrow buttons, so saving, `completed_at`, and the Activity entry follow the existing path with no database change. Required setting: `"dragDropEnabled": false` on the window in `tauri.conf.json`; with Tauri's default (`true`) the Windows web view hands drag events to the operating system and in-page drag and drop does not work. Consequence: dropping files from Explorer onto the window is not available; the planned file import (see PROJECT_OVERVIEW.md) will use a file picker, or this setting will be revisited then.
- Phase 4 step 4a, backup and restore (written 2026-10-30, verified 2026-10-30; design approved by the developer the same day): `src/lib/backupFormat.ts` is a set of pure functions (no database, no files) that define the file format (format version 1, schema version 6; the tables and columns are those of the database), check an untrusted file completely (`parseBackup`: JSON, app name, versions (a wrong format or schema version is refused with a message that says which version the file has and which this app restores, without suggesting an update), every column's type, allowed values, dates, lengths, duplicates, references between tables, labels only on tasks of their project), and build the restore SQL (`buildRestoreScript`). `src/repositories/backupRepository.ts` reads all tables, reads the schema version, and runs the script. `src/services/backupService.ts` joins them: `exportBackup`, `previewRestore`, `restoreBackup`. `src/lib/fileDialogs.ts` is the only file that uses the new Tauri plugins `dialog` and `fs` (the "Save as" and "Open" windows; the app can only reach a file the person picked, and `capabilities/default.json` got only `dialog:allow-save`, `dialog:allow-open`, `fs:allow-write-text-file`, and `fs:allow-read-text-file`). `src/lib/lastBackup.ts` remembers the time of the last backup in the web view's local storage (a convenience, not project data, not part of backups). The screens are `src/features/backup/BackupSection.tsx` (two cards, Export and Restore, in Settings) and `RestoreDialog.tsx`. Restore flow: choose a file, which is checked and summarized (nothing changes); confirm; save a safety backup of the current data (required, the replace button stays disabled until it is saved); replace; the window reloads so every screen shows the restored data. Atomicity: the SQL plugin may use a different connection for each call, so the restore is ONE script sent in ONE call (`BEGIN IMMEDIATE; DELETE …; INSERT OR ROLLBACK …; COMMIT;`); text values are written as hexadecimal bytes (`CAST(X'..' AS TEXT)`) so no character in the data can change a statement; `INSERT OR ROLLBACK` rolls everything back on the first error; a `ROLLBACK` call is sent after a failure as a last safeguard. The triggers of migration 2 (owner membership) and migration 6 (history) also fire during the inserts, so the script deletes their rows before inserting the backup's own `workspace_members` and `activity_log` rows. Deviation from Figma "09 Local Data & Backup": the Export and Import cards are placed in the existing Settings page (that frame is the Settings page); the Storage summary and Preferences panels are not built. A note for future SQL: the SQL plugin binds the values in the order the numbered parameters (`$1`, `$2`) first appear in the text, so a query must number them in that order.
- Design adjustments (verified by the developer 2026-10-31): (1) every progress bar is the accent color: `ProgressBar` lost its `tone` option, and `ProjectCard` and the Dashboard no longer pass one. Deviation from Figma, which varies the bar colors. (2) Activity summaries (Dashboard, workspace page, project page) show the newest 8 entries (`ACTIVITY_PREVIEW_COUNT` in `src/lib/activityText.ts`). The services read one more than that, so the section knows whether to show "View all activity" (`ViewAllLink`). The link opens `ActivityPage`, one page for three addresses (`/activity`, `/workspaces/:id/activity`, `/projects/:id/activity`). `useActivityLog` reads 50 entries at a time (`activityService.getActivityLog(scope, limit)`, again one extra entry to detect "more") and "Show 50 more" raises the limit. `navigation.ts` gives these addresses a title, a title bar path, and loads the workspace or project for them. (3) The labels of a project use the `ActionMenu` (Edit, Delete) like the task list.
- Phase 4 step 4b, search (written and verified 2026-10-31; design approved by the developer the same day: one box in the top bar, text of documents included): `SearchBox` (`src/features/search/`) sits in the top bar and is also reached with Ctrl+K. `useSearch` waits 200 ms after the last key and throws away answers that arrive late. `searchService` cleans the text (at least 2 and at most 80 characters, spaces collapsed), turns it into a LIKE pattern with `%`, `_` and `\` escaped, runs four queries at once (`searchRepository`: workspaces by name; projects by name or description; tasks by title or description; documents by title or text; at most 6 each) and builds a short snippet when the match is in a document's text. Parameters are numbered in the order they first appear. SQLite's LIKE ignores case only for the letters A to Z, so an accented letter must match exactly (a known limit). No table or migration was added, and no index is used (the data of one person is small); a full-text index (FTS5) is an option if search ever becomes slow. Not part of the search: notes, checklist items, labels, activity. The task list of a project has three choices (status, priority, label; written 2026-10-31, awaiting verification): `taskService.filterTasks` applies them in memory and `TaskList` keeps the choices while the page is open; the label choice offers only labels that some task carries. Search box verified by the developer 2026-10-31.
- Phase 4 step 4c, validation review (verified 2026-10-31). What was checked: every text box has a character limit in the screen (`maxLength`) and the same limit in its service, and the database refuses empty names (`CHECK`), unknown statuses, priorities, colors, kinds, and badly formed deadlines; unknown ids give "no longer exists" messages; backup files are checked completely (step 4a). Gap found and fixed: names, titles, and notes were refused only when empty after `trim()`, so text made only of zero-width characters (invisible on screen) was accepted. `hasVisibleText` (`src/lib/text.ts`) now decides in the eight services. Also fixed: the search box had no `id` or `name` (browser inspector warning). Left as it is, on purpose: duplicate workspace or project names are allowed (only labels must be unique per project); line breaks pasted into one-line boxes are removed by the browser; the database `CHECK` still tests with `trim()` only, so the service is the guard for invisible text. Not found: any place where the screen accepts input the service does not check.
- Design adjustments (verified by the developer 2026-10-31): the checklist item uses a pencil `IconButton` (new icon `pencil`) for Edit, and a note's Edit and Delete are one `ActionMenu`, like the task list.
- Phase 4 step 4d, local reminders (verified by the developer 2026-11-01; design approved by the developer the same day: only while the app is open, settings in the web view's storage). `useReminderChecks` (started in `AppShell`) calls `reminderService.checkReminders` at start and every minute. It is due when reminders are on, the clock is at or after the chosen time, and today's reminder was not handled yet (`isReminderDue`); it then reads the tasks assigned to the local profile in active projects (`getMyTasks`), keeps those not done and due today or overdue, and shows ONE notification (`buildReminderMessage`) through `src/lib/notifications.ts`, the only file that uses `@tauri-apps/plugin-notification`. The day is marked as handled before the tasks are read, so a failure is not repeated every minute (a task created later the same day is not announced until the next day). The settings (on or off, time `HH:MM`) and the last handled day are in `localStorage` (`src/lib/reminderSettings.ts`), so they are not in the database and not in backups. Reasons for not using a scheduled notification: the plugin documentation names no desktop scheduling, so the app checks itself; a reminder while the app is closed would need a tray icon and a start-with-Windows option (Future). Windows limits, from the plugin page (read 2026-10-31): notifications work only for installed apps, and in development they show the name and icon of PowerShell. Clicking a notification does not open Avenqor. A new capability, `notification:default`, was added (it compiled and works, verified 2026-11-01). In the installed program the notification shows the name Avenqor (reported 2026-11-01).
- Installer look (verified by the developer 2026-11-01: pictures, install, uninstall, reinstall; Agreed as a 1.0 item 2026-10-30): `tauri.conf.json` `bundle > windows > nsis` sets `headerImage` (`src-tauri/installer/header.bmp`, 150x57), `sidebarImage` (`sidebar.bmp`, 164x314), `installerIcon` and `uninstallerIcon` (`icons/icon.ico`), and `installMode: currentUser`. The pictures were drawn from the logo files with Pillow (the wordmark on white; the A and the wordmark in white on the accent color) and checked by eye in the Claude workspace only, not in the installer. The option names and the recommended sizes are from the Tauri configuration reference (read 2026-11-01). Only the NSIS installer is customized; the MSI installer (WiX) has its own picture settings and is left as it is. Not set on purpose: languages (English only), a Start menu folder, and install hooks.
- Release preparation (2026-11-01). Version: `1.0.0` in `package.json`, `Cargo.toml`, `tauri.conf.json`, and both lock files (Cargo and the Windows installers need three numbers, so "1.0" is written 1.0.0). Database folder: stays Roaming (decided by the developer). Code signing (optional, Proposed): unsigned installers make Windows SmartScreen show "Windows protected your PC" with a "More info, Run anyway" step, and reputation builds with downloads. Options from Microsoft's page (read 2026-11-01): Azure Artifact Signing (about 10 USD a month, individuals only in the USA and Canada, organizations in the USA, Canada, EU, and UK, so likely not available to an individual in Indonesia); an OV certificate from a certificate authority (about 150 to 300 USD a year, worldwide, the key must be on a hardware token or HSM); EV no longer skips SmartScreen since 2024; self-signing does not help public users. Tauri signs through `bundle > windows > certificateThumbprint` or `signCommand`. Decided 2026-11-01: no signing for now, because the developer does not want to spend money. The installer run from the developer's own build showed no SmartScreen warning, but a file downloaded from GitHub carries the "downloaded from the internet" mark and is likely to show one; the README explains "More info, Run anyway".

### Security state

- A Content Security Policy (CSP, rules that limit what the page may load) is set: `csp` for release builds and `devCsp` for development. Both only allow the app's own files, the Tauri connection, and (in development) the Vite dev server. The page loaded without CSP errors in the dev Console and in the release build (reported by the developer, 2026-10-22).
- `style-src` allows inline styles (`'unsafe-inline'`), which weakens the policy slightly. It is kept so dynamic styles such as progress-bar widths work. To be reviewed when the design needs it.
- The `opener` plugin and its permission were removed. The permissions that remain are listed above; the frontend can send SQL (`sql:allow-execute`), so all input is checked in the services, and it can read or write only the files the person picks in the system file windows (backups).
- Backup files are treated as untrusted input and fully validated before anything is changed (step 4a).

## Glossary

- **Tauri command**: a Rust function the frontend is allowed to call.
- **Capability**: a Tauri permission file listing what the frontend may do.
- **Repository**: code that is the only gateway to stored data.
- **Migration**: a numbered, versioned change to the database structure, applied in order, so existing user data survives upgrades.
- **Transaction**: a group of database changes that either all succeed or all fail.
