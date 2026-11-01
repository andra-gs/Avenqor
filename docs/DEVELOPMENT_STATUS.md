# Development Status

Last updated: 2026-10-31

This file is the project's memory between sessions. It must be updated before every coding session ends, and it records only what was actually done and checked.

## Current state

- **Phase:** Phases 0 to 4 are **complete** (verified by the developer; Phase 4 closing check with the release program reported 2026-11-01). The work was merged into `main` by the developer through pull requests #1 and #2 (verified on GitHub 2026-11-01: `main` contains the tip of `phase-3-kanban`). Release preparation for version 1.0.0 is in progress on the branch `release-1.0`.
- **Application code:** on `main` and `release-1.0`: the app frame, design tokens, and working workspaces, projects, tasks (with checklists, notes, and labels), Kanban board with drag and drop, Calendar, My Tasks, project documents, local activity history, search, task filters, backup and restore, and deadline reminders, on a local SQLite database (`avenqor.db`, schema version 6, eleven tables). Version number: 1.0.0 (`package.json`, `Cargo.toml`, `tauri.conf.json`, and both lock files), set 2026-11-01 and not yet built. **Git repository:** `https://github.com/andra-gs/project-manager` (public).
- The desktop app starts in development mode and builds a Windows release on the developer's computer (details below).
- Implemented (verified by the developer): workspaces, projects, tasks with checklists, notes, and labels, Kanban board (buttons), Calendar, My Tasks, project documents, local activity history, custom title bar, Dashboard on real data, local profile. See the MVP table in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md). Status labels are explained there too.

### Environment note

The documents were drafted in a Claude workspace, which cannot reach the Windows development computer. Results from the development computer are **reported by the developer** (copied from their PowerShell output), not run by Claude. Claude directly verified only the contents of the GitHub repository (by cloning it) and the documentation files.

## Completed

| Item | Date |
|---|---|
| Created the six documentation files: `CLAUDE.md`, `README.md`, `docs/PROJECT_OVERVIEW.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, this file | 2026-10-20 |
| Added section 18 "Documentation System" to `CLAUDE.md`. Sections 1 to 17 were carried over from the Project copy | 2026-10-20 |
| Pushed the documentation to GitHub (`main`, commit `e979d69`). Confirmed by comparing the remote and local commit IDs | 2026-10-20 |
| Phase 0, step 1: verified the Windows prerequisites on the development computer (details below) | 2026-10-21 |
| Phase 0, step 2: created the project with `create-tauri-app` 4.7.5 (template `react-ts`, npm) in a temporary folder, renamed it from `tauri-temp` to `project-manager`, and copied it into the repository without overwriting existing files | 2026-10-21 |
| Committed and pushed the scaffold (`e523852`) | 2026-10-21 |
| Phase 0, step 3: `npm install` and `npm run tauri dev` worked | 2026-10-21 |
| Decisions 2026-10-23: working product name **Avenqor** (later Agreed, 2026-10-25; trademark checks not recorded); brand notes saved as `docs/BRAND.md` (identity only); color palette and logo not applied while the logo is being reconsidered; app `identifier` change postponed until before Phase 2 | 2026-10-23 |
| Documentation review (2026-10-31, by Claude): all documents re-read against the repository and updated (folder layout, routes, permissions, 11 tables, status of 4a); `README.md` rewritten for users and programmers; `docs/screenshots/README.md` lists the screenshots the developer must take; wording of the wrong-version backup messages changed | 2026-10-31 |
| Phase 0, step 4: `npm run tauri build` produced a Windows release build and two installers | reported 2026-10-22 |

## Verification performed

### Documentation (2026-10-20, by Claude)

| Check | Method | Result |
|---|---|---|
| Existing repository | Listed the working folder and ran `git status` | Empty workspace, no `.git`, no `docs/` folder. Nothing was overwritten |
| Project copy of `CLAUDE.md` | Read through the Claude Project's file tool | Matched the attached copy |
| `CLAUDE.md` structure | Listed all `## ` headings | Sections 1 to 18 present, in order |
| Links between documents | Script checked local links | First run: 3 of 15 pointed to this file before it existed (expected). Re-run after creating it: 17 links checked, none broken |
| No invented tables | Searched all files for `CREATE TABLE` | None found |
| No false "implemented" claims | Searched for "Implemented" | Appears only in the label definition and in the statement that nothing is implemented |
| Prerequisites and tool commands | Read the official pages: Tauri prerequisites, `create-tauri-app` README, Tauri SQL plugin | Documented in the README and `ARCHITECTURE.md`. These were **read, not executed** |

### Phase 0 prerequisites on the development computer (reported by the developer, 2026-10-21)

| Item | Result | Status |
|---|---|---|
| Operating system | Windows 10 Pro, version 10.0.19045 | OK. The Tauri docs say WebView2 is included from Windows 10 version 1803. WebView2 itself was **not** checked directly, but the app window rendered |
| Git | `git status`: on `main`, up to date with `origin/main`, working tree clean | OK |
| Node.js | `node -v`: v24.22.0 | OK. Worked with Vite 8.3.4 in development and build |
| npm | `npm -v`: 11.19.1 | OK after the fix below |
| Rust | `rustc --version`: 1.99.1 (58cf8f9c3 2026-10-13) | OK. The Tauri SQL plugin docs ask for Rust 1.90 or newer |
| Cargo | `cargo --version`: 1.99.1 | OK |
| Rust toolchain | `rustup show`: `stable-x86_64-pc-windows-msvc`, active and default | OK. This is the MSVC toolchain that Tauri requires |
| Microsoft C++ Build Tools | Visual Studio Build Tools 2026 was installed, but the C++ component was missing. After adding the "Desktop development with C++" workload, `vswhere` (with `-requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`) returned `C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools` | OK. Rust and Tauri compiled successfully against it |

Fixes applied on the development computer:

1. `npm` was blocked in PowerShell: "running scripts is disabled on this system". Fixed with `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. After that, `npm -v` worked in PowerShell. Before the fix it worked in Git Bash.
2. The C++ workload was added through Visual Studio Installer (Modify, then "Desktop development with C++").

### Phase 0 project checks (reported by the developer unless stated)

| Check | Method | Result |
|---|---|---|
| Scaffold | `npm create tauri-app@latest tauri-temp -- --template react-ts`, identifier `io.github.andra-gs.project-manager`, package manager npm | Project created in `D:\tauri-temp`. No `.git` folder inside it |
| Rename | Searched all files for `tauri[-_]temp` before and after | Six occurrences replaced (package name, Cargo package and library names, `productName`, window title, `main.rs` call). None left. `package.json` and `tauri.conf.json` start with `{`, so no BOM |
| Copy into repository | `robocopy D:\tauri-temp <repo> /E /XF README.md /XC /XN /XO` | 37 files copied, 1 skipped (template `README.md`). `git status` showed only new files and no modified tracked files, so nothing was overwritten |
| Tracked files | Claude cloned `origin/main` (commit `e523852`) and ran `git ls-files` | Layout matches the scaffold. `src-tauri/Cargo.lock` is tracked. `package-lock.json` is not yet tracked |
| Dependencies | `npm install` | 27 packages added, 28 audited, 0 vulnerabilities (about 2 minutes) |
| Development mode | `npm run tauri dev` | Vite v8.3.4 ready at `http://localhost:1420/`. Rust compiled in the `dev` profile in 18m 19s (first build). `project-manager.exe` started. The developer saw the "Project Manager Desktop" window showing the template page |
| Release build | `npm run tauri build` | `tsc && vite build` succeeded (19 modules). Rust `release` profile compiled in 33m 57s. Produced an MSI installer (2.04 MiB) and an NSIS installer (1.39 MiB). The build downloaded the WiX and NSIS tools from GitHub |
| Git hygiene | `git status` after the development run | Only `package-lock.json` listed (untracked). `node_modules`, `dist`, and `src-tauri/target` did not appear |

## Not verified

Phase 1 items still open (branch `phase-1-ui`):

- Inline style attributes, which the design will need later for dynamic progress bars, are untested.
- Scrolling was verified on the Dashboard (2026-10-24). The layout on 1366x768 and 1920x1080 screens was not reported.
- The accent-token proof was repeated on the Dashboard and the step 6 screens (2026-10-24). It is still to be done once on the remaining screens built in step 7.
- The empty states (no projects, no activity, unknown workspace or project) exist, but only the workspace "Content Creator" (no projects) shows one.
- Claude's workspace cannot run npm or reach the npm registry, so Claude itself ran no build; all build results come from the developer.
- Production (release) rendering of Tailwind styles and the bundled font was not reported separately; only the dev run after step 2 was.

Earlier items:

- The two installers were built but never installed or run.
- The window content was seen only by the developer. No screenshot has been reviewed.
- Whether a build works without internet access is untested. The first build downloaded the WiX and NSIS tools.
- Claude has not read `tsconfig*.json`.
- Sections 1 to 17 of `CLAUDE.md` were not compared character by character with the Project copy. Only the headings were checked.
- The Figma file was inspected only through its structure (metadata). Screenshots could not be downloaded, so exact visual details were not compared.

## Test results

No automated tests exist and no test framework is installed. Commands actually run, with results:

| Date | Command | Result |
|---|---|---|
| 2026-10-21 | `npm install` | Passed, 0 vulnerabilities |
| 2026-10-21 | `npm run tauri dev` | Passed: Vite started, Rust compiled, window opened |
| reported 2026-10-22 | `npm run tauri build` | Passed: TypeScript check and Vite build succeeded, MSI and NSIS installers produced |
| reported 2026-10-22 | `npm run tauri dev` on branch `phase-1-ui` | Passed: Rust compiled, window opened and showed the placeholder heading and text |
| reported 2026-10-22 | `npm run tauri build` on branch `phase-1-ui` | Passed: `tsc` and Vite build succeeded, MSI and NSIS installers produced; the release build showed the same page as dev |
| reported 2026-10-23 | `npm install tailwindcss @tailwindcss/vite @fontsource-variable/dm-sans`, then `npm run tauri dev` | Passed without errors; the accent line showed the token color |
| reported 2026-10-23 | change `--color-accent` in `src/styles/tokens.css` | Passed: the colored line changed without editing another file; value restored afterwards |
| reported 2026-10-23 | `npm run build` | Reported as successful without errors |
| reported 2026-10-23 | `npm install react-router@7`, `npm run tauri dev` | Passed: sidebar, top bar, all menu items and workspaces clickable, title changes, active item uses the accent color |
| reported 2026-10-23 | change `--color-accent` again | Passed: name, active item, and avatar changed together; restored afterwards |
| reported 2026-10-23 | resize window to minimum and full screen | Passed: no problem reported. Scrolling was not tested |
| reported 2026-10-23 | `npm run build`, `npm run tauri build`, run `project-manager.exe` | Passed: every page opens in the release build |
| reported 2026-10-23 | `npm run tauri dev` (step 4) | Passed: buttons, badges, three progress bars shown; hover and focus outline work; changing `--color-accent` changed the button, badge, first progress bar, and sidebar highlight |
| reported 2026-10-23 | `npm run build` (step 4) | Passed: `tsc` and Vite build (50 modules) without errors |
| reported 2026-10-23 | `npm run tauri dev` (step 4b) | Passed: toggle button, tooltips, drag left and right, automatic collapse and expand when resizing, keyboard toggle with Tab and Enter |
| reported 2026-10-23 | `npm run build` (step 4b) | Passed without errors |
| reported 2026-10-24 | `npm run tauri dev` (step 5) | Passed: five Dashboard sections shown; workspace card opens the workspace page; the sidebar closes when the window is made small, and page content scrolls; changing the accent color changed the Dashboard together with the sidebar; no errors |
| reported 2026-10-24 | `npm run build` (step 5) | Reported without errors |
| reported 2026-10-24 | `npm run tauri dev` (step 6) | Passed: workspace stats (4 projects, 103 tasks, 54 completed, 4 members), project cards, activity; project page (72%, 18 of 25); empty workspace message; 960x600 with sidebar open and collapsed; accent change on all three pages; no errors |
| reported 2026-10-24 | `npm run build` (step 6) | **Failed**: `src/pages/WorkspacePage.tsx:25:9 - error TS6133: 'activeProjects' is declared but its value is never read.` Fixed by showing `activeProjects` in the "Projects" stat |
| reported 2026-10-24 | `npm run tauri build` (after step 6) | Passed: `tsc` and Vite build, release profile compiled in 15m 00s, MSI (2.05 MiB) and NSIS (1.42 MiB) installers produced. Whether the release program was started and the pages checked was not reported |
| reported 2026-10-24 | `npm run tauri dev` (step 7) | Passed: Settings and Help open and are readable at the minimum size; accent change shows on the sidebar; no problems reported |
| reported 2026-10-24 | `npm run build` (step 7) | Passed: `tsc` and Vite build (74 modules) without errors. The JavaScript file name differs from the earlier build (`index-CN5xRskZ.js`), so it contains the step 7 code |
| reported 2026-10-24 | release program `project-manager.exe` | All pages opened and the layout was fine, but Settings and Help still showed the old placeholder text. Likely cause (Claude's reading, not confirmed): the installers had been built before step 7 was pulled, so the program was older code. To be confirmed by rebuilding |
| reported 2026-10-24 | `npm run tauri build`, then `project-manager.exe` (closing check) | Passed: Settings and Help show their real content in the release program |
| reported 2026-10-25 | `npm run tauri dev` after the Avenqor rename (step 1a) | Passed: no errors |
| reported 2026-10-25 | `npm run tauri dev` after adding the SQL plugin (step 1b) | Passed: compiled, all pages look the same, no errors |
| reported 2026-10-25 | `Get-ChildItem -Recurse -Filter avenqor.db $env:APPDATA` | Found `C:\Users\<user>\AppData\Roaming\io.github.andra-gs.avenqor\avenqor.db`, 4096 bytes, created 2026-10-25 06:08. The empty database file is created at startup, as expected |
| reported 2026-10-25 | `npm install`, `npm run tauri dev` (Phase 2 step 2a), Settings page | Passed: the Database line read `Connected · schema version 1 · 5 tables · foreign keys on` |
| reported 2026-10-25 | `npm run build` (Phase 2 step 2a) | Passed: `tsc` and Vite build (80 modules) without errors |
| reported 2026-10-25 | `npm run tauri dev` (Phase 2 step 2b), Settings | Passed: Database line `Connected · schema version 2 · 5 tables · foreign keys on`; created workspace "Test A" (1 member, shown in the sidebar); empty and spaces-only names rejected with a red message and not saved; field stops at 60 characters; rename updated list and sidebar; the workspace was still there after restarting the app; delete showed a confirmation, Cancel kept it, Delete removed it from the list and the sidebar |
| reported 2026-10-25 | `npm run build` (Phase 2 step 2b) | Passed: `tsc` and Vite build (88 modules) without errors |
| reported 2026-10-25 | `npm run tauri dev` (Phase 2 step 2c-1) | Passed: empty workspace page (0 projects, tasks, deadlines, 1 member); New Project with an empty name rejected; projects saved, shown as cards, and still there after restarting; Escape closes the New Project window and the delete confirmation. Finding: names and descriptions were cut to one line on the cards (fixed, see below) |
| reported 2026-10-25 | `sqlite3 "$env:APPDATA\io.github.andra-gs.avenqor\avenqor.db" "SELECT COUNT(*) FROM projects;"` | Not run: `sqlite3` is not installed on the development computer. The cascade delete (workspace to projects) is therefore not yet verified |
| reported 2026-10-25 | `npm run build` (Phase 2 step 2c-1) | Passed: `tsc` and Vite build (93 modules) without errors |
| reported 2026-10-25 | `npm run tauri dev` (step 2c-1b), Settings | Passed: project names and descriptions wrap onto more lines without breaking the layout. Database line with a workspace and 2 projects: `stored: 1 workspace, 2 projects, 0 tasks`; after deleting the workspace: `stored: 0 workspaces, 0 projects, 0 tasks`. This verifies that deleting a workspace deletes its projects (cascade) |
| reported 2026-10-25 | `npm run build` (step 2c-1b) | Passed: `tsc` and Vite build (93 modules) without errors |
| reported 2026-10-26 | `npm run tauri dev` (Phase 2 step 2c-2a) | Passed: the project page with no tasks (0%); empty-title task rejected; `Task 1` showed "Overdue · Oct 25", `Task 2` "Tomorrow", `Task 3` no badge; mark done, reopen, progress 33% and 67%; data still there after restarting; task delete with confirmation; workspace page card and stats; archive and restore; the Database line counts, the cascade project to tasks, and workspace deletion all as expected |
| reported 2026-10-26 | `npm run build` (Phase 2 step 2c-2a) | Passed: `tsc` and Vite build (101 modules) without errors |
| reported 2026-10-26 | `npm run tauri dev` (Phase 2 step 2c-2b) | Passed, all items as expected: renaming the local profile (shown in the top bar and greeting, validation, kept after restart); empty Dashboard with "New Project" disabled; two workspaces with a project each created from the Dashboard; real cards and links; "My Tasks" order and badges, done tasks leave the list; archive and restore of a project on the Dashboard; Archive and Delete buttons at the bottom left of the project page; Help page text |
| reported 2026-10-26 | `npm run build` (Phase 2 step 2c-2b) | Passed: `tsc` and Vite build (99 modules) without errors |
| reported 2026-10-26 | `npm run tauri dev` (Phase 2 step 2d) | Passed: edit project (name, description, validation, Cancel and Escape), edit task (title, priority, deadline, clearing and past deadlines, validation), a done task stays done, creating projects and tasks still works, edits kept after restarting |
| reported 2026-10-26 | `npm run build` (Phase 2 step 2d) | Passed: `tsc` and Vite build (99 modules) without errors |
| reported 2026-10-27 | Phase 2 closing check: `npm run tauri build`, release `project-manager.exe` with the existing database and with a renamed (fresh) `avenqor.db`, then restore of the backup | Reported by the developer as "all fine" (no details of individual items were given; the optional installer test was not confirmed separately) |
| reported 2026-10-27 | `npm run tauri dev` (Phase 3 step 3a, branch `phase-3-kanban`), board checks 1 to 8 | Passed, all as expected: Open board button, four columns with counts and empty messages, arrow buttons (disabled at the ends), positions kept after restart, progress follows Done, New Task adds to To Do, top bar title, deadline badges |
| reported 2026-10-27 | `npm run build` (Phase 3 step 3a) | Passed: `tsc` and Vite build (103 modules) without errors |
| reported 2026-10-28 | `npm run tauri dev` (Phase 3 step 3c, branch `phase-3-kanban`), Calendar checks 1 to 10 | Passed, all as expected: current month, Monday first, month arrows, Today, red/accent/grey deadline colors, "+N more", clicking a task opens its project, upcoming list contents and order, updates after changes, empty message, 960x600 layout, deadline badge on the right of the task row |
| reported 2026-10-28 | `npm run build` (Phase 3 step 3c) | Passed: `tsc` and Vite build (109 modules) without errors |
| reported 2026-10-28 | `npm run tauri dev` (Phase 3 step 3d, branch `phase-3-kanban`), My Tasks checks 1 to 9 | Passed, all as expected: Open filter default and order, row contents, all filter buttons, empty messages, row opens the project, archived project excluded, list updates after board changes, 960x600 layout |
| reported 2026-10-28 | `npm run build` (Phase 3 step 3d) | Passed: `tsc` and Vite build (113 modules) without errors |
| reported 2026-10-28 | `npm run tauri dev` (custom title bar, branch `phase-3-kanban`), checks 1 to 6, 8, 9 | Passed, all as expected: native bar gone, app-colored strip, path text and links, minimize/maximize/restore/close, dragging, double-click maximize, resizing from edges and minimum size, strip not responding while a dialog is open (expected), layout below unchanged. Check 7 (Windows 11 snap layout popup) could not be judged: the developer uses Windows 10 Pro |
| reported 2026-10-28 | `npm run build` (custom title bar) | Passed: `tsc` and Vite build (121 modules) without errors. The output pasted was from `npm run build`; the release program `project-manager.exe` check (item 10) was not reported separately |
| reported 2026-10-28 | `npm run tauri dev` (Phase 3 step 3e-1, task page), checks 1 to 11 | Passed except: (a) a very long description without spaces stretched the page to the right at the smallest window instead of wrapping (checks 2 and 9); (b) the developer asked for form messages to appear under the input with a highlight (check 3), for all forms. Both corrected the same day, see ARCHITECTURE.md; not yet re-tested. Other checks as expected, data kept after restart |
| reported 2026-10-28 | `npm run build` (Phase 3 step 3e-1) | Passed: `tsc` and Vite build (124 modules) without errors |
| reported 2026-10-28 | `npm run tauri dev` (corrections to step 3e-1), checks 1 to 5 | Passed: long title and description wrap at the smallest window; the empty-title message appears under the box with a red border in the task and project forms; workspace and display-name forms unchanged; sidebar changes as wanted. Developer's change request: descriptions need no message (a character counter at the lower left and a hard limit instead) and the deadline needs no message (auto-correct instead); implemented the same day, not yet re-tested |
| reported 2026-10-28 | `npm run build` (corrections to step 3e-1) | Passed: `tsc` and Vite build (124 modules) without errors |
| reported 2026-10-28 | `npm run tauri dev` (second round of corrections), checks 1 to 3 | Passed: description counters, empty-title message, deadline auto-correct. Developer's change request: counters on every name and description box (new and edit), at the lower right, shown only after 10 percent of the limit is typed; implemented the same day, not yet re-tested |
| reported 2026-10-28 | `npm run build` (second round of corrections) | Passed without errors (output not pasted) |
| reported 2026-10-28 | `npm run tauri dev` (counter change, then step 3e-2 with migration 3), checks 1 to 8 | Passed, all as expected: Database line `Connected · schema version 3 · 7 tables`; existing data intact; checklist (add, tick, edit, delete, order, limit and counter) and notes (add, newest first, edit, delete with confirmation, line breaks, long words) work; data kept after restart; deleting a task with items and notes causes no error; checklist progress does not change project progress; counters at the lower right of every limited box. Developer's change request: delete a checklist item with a small cross icon instead of a Delete button (too many Delete buttons on the page); done the same day, not yet re-tested |
| reported 2026-10-28 | `npm run build` (step 3e-2) | Passed: `tsc` and Vite build (134 modules) without errors |
| run by Claude 2026-10-28 | Python `sqlite3` in memory against migrations 1 to 4 and the SQL of `labelRepository.ts`; partial `tsc --noEmit` | SQL: duplicate names (any letter case) rejected in one project, allowed across projects, bad color rejected, linking is idempotent and refuses a label of another project, deletes of label, task, and project cascade correctly. `tsc`: no errors except missing-package noise and the known `database.ts(17,3)`. The app was not built or run in the Claude workspace (no npm registry), so the label screens are untested until the developer's run |
| reported 2026-10-29 | `npm run tauri dev` (step 3e-3 labels, migration 4), checks 1 to 10 | Passed, all as expected: Database line `Connected · schema version 4 · 9 tables`; cross button for checklist items; create, remove, and re-add labels on a task; duplicate, empty, and too-long names refused with a message; labels of other projects not offered; Labels section on the project page (counts, edit, delete with confirmation); badges on the task list and board cards; data kept after restart |
| reported 2026-10-29 | `npm run build` (step 3e-3) | Passed: `tsc` and Vite build (143 modules) without errors |
| reported 2026-10-29 | `npm run tauri dev` (step 3f documents, migration 5), checks 1 to 10 | Passed, all as expected: Database line `Connected · schema version 5 · 10 tables`; create, edit, delete, search, filters, project page section, long text, data kept after restart. Developer's change requests (done the same day, not yet re-tested): clicking the open document in the list closes it; the list box fits its content instead of stretching to the height of the document |
| reported 2026-10-29 | `npm run build` (step 3f) | Passed: `tsc` and Vite build (152 modules) without errors |
| reported 2026-10-29 | `npm run tauri dev` (step 3g activity history, migration 6, and the two document list changes), checks 1 to 10 | Passed, all as expected: Database line `Connected · schema version 6 · 11 tables`; activity entries for workspaces, projects, tasks, and documents on the Dashboard, project page, and workspace page; deletes handled as designed; data kept after restart |
| reported 2026-10-29 | `npm run build` (step 3g) | Passed: `tsc` and Vite build (155 modules) without errors |
| run by Claude 2026-10-29 | Python `sqlite3` in memory against migrations 1 to 6, the SQL of `activityRepository.ts`, and a Node script for `activityText.ts`; partial `tsc --noEmit` | SQL: one entry per change with the right values; updates of `updated_at` alone, checklist, notes, and labels give none; deleting a project removes its entries and leaves one "project deleted" entry; deleting a workspace removes all its entries; `PRAGMA foreign_key_check` empty; the three read queries return the right rows with the 20-entry limit. Text: sentences read as intended. `tsc`: no errors except missing-package noise and the known `database.ts(17,3)`. The app was not built or run in the Claude workspace, so the activity lists are untested until the developer's run |
| reported 2026-10-29 | `npm run tauri dev` (adjustments: no "Saved info" pop-up, task actions menu), checks 1 and 2 | Passed, all as expected: the pop-up no longer appears in text boxes; the three-dot menu on each task of the project page offers Edit, Mark done or Reopen, and Delete, and each works |
| reported 2026-10-29 | `npm run build` (actions menu) | Passed: `tsc` and Vite build (156 modules) without errors |
| reported 2026-10-29 | Phase 3 closing check with the release program `src-tauri\target\release\project-manager.exe` (built with `npm run tauri build`), checks 1 to 4 | Passed, all as expected: custom title bar (path, drag, maximize, minimize, restore, close), Settings Database line (schema version 6, 11 tables, existing data), one round through every area (project, task, board, checklist, note, label, document, Activity), all data kept after closing and reopening. Check 5 (fresh database file) was skipped by the developer, so a fresh database with migration 6 has not been tried in the release program (a fresh database through migrations 1 to 6 was run by Claude in an in-memory SQLite database) |
| reported 2026-10-30 | `npm run tauri dev` (step 3b drag and drop), checks 1 to 6 | Passed, all as expected: dragging between columns with highlight, saved status and progress, Activity entries, same-column drop ignored, drag by the title, click still opens the task, outside drops and dragged text ignored, arrow buttons, positions kept after restart |
| reported 2026-10-30 | `npm run build` (step 3b) | Passed: `tsc` and Vite build (160 modules) without errors |
| run by Claude 2026-10-30 | Node (`--experimental-strip-types`) on a scratch copy of `backupFormat.ts` plus Python `sqlite3` in memory against migrations 1 to 6, with data containing quotes, semicolons, SQL comment marks, line breaks, accents, Japanese text, and an emoji; partial `tsc --noEmit` | Restore SQL: a backup of one database restored into a different populated database and into an empty one gave rows identical to the backup in all 11 tables; `PRAGMA foreign_key_check` empty; no transaction left open; a failing statement at the end of the script (a bad color) rolled everything back and the old data stayed intact. Checker: file saved and read again equal; 15 damaged files each rejected with a clear message (wrong app, newer or older format or schema, missing list, unknown value, impossible date, empty title, missing reference, repeated row, number instead of text, NUL character, label on another project's task, duplicate label name, value 2 for a yes/no, text that is not JSON); an extra unknown field was accepted and ignored. `tsc`: no errors except missing-package noise and the known `database.ts(17,3)`. **Not verified here:** the Tauri plugins (dialog, fs) and the SQL plugin running a multi-statement script in one call; the Rust side was not compiled in the Claude workspace |
| reported 2026-10-30 | `npm run tauri dev` (step 4a backup and restore), checks 1 to 9 | Passed, all as expected: export with the Windows save window and the count message, readable JSON file, restore preview, safety backup required before "Replace all data", restore and reload, restoring the safety backup, rejection of bad files (not a backup, wrong `formatVersion`, broken JSON), Database line unchanged, data kept after restart. Developer's change request: the message for a wrong `formatVersion` suggested updating the app, which is misleading; reworded 2026-10-31 (the file may be edited, damaged, or not from Avenqor), not yet re-tested |
| reported 2026-10-30 | `npm run build` (step 4a) | Passed: `tsc` and Vite build (172 modules) without errors |
| reported 2026-10-31 | `npm run tauri dev` (step 4b search box and the three design adjustments), checks 1 to 4 | Passed, all as expected: every progress bar in the accent color; Activity summaries with 8 entries and the "View all activity" link and full list; label actions in the three-dot menu; search box (Ctrl+K, grouping, text of documents, keys, no result) |
| reported 2026-10-31 | `npm run build` (step 4b) | Passed: `tsc` and Vite build (180 modules) without errors |
| run by Claude 2026-10-31 | Node (`--experimental-strip-types`) on a scratch copy of `filterTasks` and `hasTaskFilters`; partial `tsc --noEmit` | Status, priority, and label choices combine correctly (3, 2, 2, 2, 1, 0 tasks for the six cases tried); no choice returns all. The filter bar on the project page was not run |
| reported 2026-10-31 | `npm run tauri dev` (step 4b task filters), checks 1 to 5 | Passed, all as expected: the three choices above the task list, they limit and combine, "Clear filters", empty messages, filters kept while editing, deleting, or marking done |
| reported 2026-10-31 | `npm run build` (step 4b task filters) | Passed: `tsc` and Vite build (180 modules) without errors |
| reported 2026-10-31 | Browser inspector (Issues) in the app | Message "A form field element should have an id or name attribute", pointing at the search box. Fixed 2026-10-31 (`id` and `name` added); not re-checked |
| run by Claude 2026-10-31 | Node (`--experimental-strip-types`) on a scratch copy of `hasVisibleText`; partial `tsc --noEmit` | Empty text, spaces, and zero-width characters give false; letters, Japanese text, and an emoji give true. `tsc`: no errors except the known noise. The services and screens were not run |
| reported 2026-10-31 | `npm run tauri dev` (step 4c validation fix, pencil icon for checklist, note action menu, search box id), checks 1 to 4 | Passed, all as expected; the inspector no longer shows the form-field issue |
| reported 2026-10-31 | `npm run build` (step 4c) | Passed: `tsc` and Vite build (180 modules) without errors |
| run by Claude 2026-10-31 | Node (`--experimental-strip-types`) on scratch copies of `isReminderDue`, `buildReminderMessage`, and `isValidReminderTime`; partial `tsc --noEmit` | The message counts due-today and overdue tasks that are not done (2 due today and 3 overdue for the sample, titles of today's tasks first, "and 2 more"); no message when nothing is due or the list is empty; the reminder is due only when enabled, at or after the chosen time, and not yet handled today; times such as `24:00`, `9:00`, `12:60`, and empty are invalid. `tsc`: no errors except the known noise. The Rust side (plugin, permission `notification:default`) could not be compiled in the Claude workspace, so the notification itself is untested |
| reported 2026-11-01 | `npm run tauri dev` (step 4d reminders), checks 1 to 6 | Passed, all as expected: the Reminders section in Settings; the test notification appeared ("Avenqor: reminders work"); the daily reminder with the right counts and titles; shown once per day; off switch; time box handling. The permission `notification:default` compiled and worked |
| reported 2026-11-01 | `npm run build` (step 4d) | Passed: `tsc` and Vite build (187 modules) without errors |
| reported 2026-11-01 | Phase 4 closing check with the release program `project-manager.exe` (`npm run tauri build`), checks 1 to 6 | Passed, all as expected: Database line `Connected · schema version 6 · 11 tables`; one round through every area; search; backup and restore, with the new wrong-version message; the notification shows the name Avenqor; data kept after closing and reopening. Check 7 (fresh database) skipped |
| run by Claude 2026-10-31 | Python `sqlite3` in memory against migrations 1 to 6 with the four search queries of `searchRepository.ts`; Node (`--experimental-strip-types`) on the pure functions of `searchService.ts` (`cleanSearchText`, `toLikePattern`, `makeSnippet`); partial `tsc --noEmit` | SQL: a match in a name, description, title, or text is found regardless of letter case; `50%` and `_menu` match only those characters after escaping; no match gives empty lists. Functions: text under 2 characters gives no search, spaces are collapsed, `%` and `_` are escaped, the snippet is cut with an ellipsis and is empty when the text is not in the body. `tsc`: no errors except the known noise. The app was not built or run in the Claude workspace, so the screens (search box, activity page, label menu, bar colors) are untested |
| run by Claude 2026-10-29 | Python `sqlite3` in memory against migrations 1 to 5 and the SQL of `documentRepository.ts`; partial `tsc --noEmit` | SQL: empty title, unknown type, and missing project rejected; list newest first without body; only active projects offered; update and delete report missing rows; deleting a project deletes its documents. `tsc`: no errors except missing-package noise and the known `database.ts(17,3)`. The app was not built or run in the Claude workspace, so the document screens are untested until the developer's run |
| reported 2026-10-24 | `npm run build` (step 6, after the fix) | Passed: `tsc` and Vite build (74 modules) without errors |

The TypeScript check (`tsc`) is part of `npm run build`, so it passed as part of the release build.

## Known issues and limitations

1. **Two copies of `CLAUDE.md`.** The Claude Project's copy does not contain section 18. The repository copy does. Decide which copy is the source of truth, and keep the other in sync.
2. **Name mismatch.** (The product name Avenqor was Agreed on 2026-10-25. The repository and folder names are separate and were not changed.) The GitHub repository is named `project-manager`, but `CLAUDE.md` says the repository and folder name is `project-manager-desktop`. Decide whether to rename the repository or update `CLAUDE.md`.
3. **Commit author email.** Commit `e523852` records the author email as `andranooryanto@gmail.con` (typo: `.con`), so GitHub does not link it to the account `andra-gs`. The developer was advised to change `user.email` for future commits and to leave the old commit unchanged, because rewriting history is not worth the risk. Whether the setting was changed is not confirmed.
4. **Template defaults (approved 2026-10-22, changed on branch `phase-1-ui`, verified by the developer 2026-10-22).** The `opener` plugin and its permission were removed. A strict `csp` and a development-only `devCsp` were added. The window is 1200x680, minimum 960x600, centered, so that it fits 1366x768 laptop screens. The sample page, the `greet` command, and the demo assets were removed and replaced by a placeholder page. `bundle.targets` stays `all` until release. The `style-src` policy allows inline styles (`'unsafe-inline'`), following the Tauri documentation example. This weakens the policy slightly and is to be reviewed when the design needs it.
5. **Focus outline cut off in the sidebar (found 2026-10-23, fix verified by the developer on 2026-10-23).** In icon-only mode the focus outline of the first menu item looked cut off at the top. Cause (Claude's diagnosis, not confirmed): the menu area scrolls, and a scrolling box hides anything drawn outside its edge, such as the outline. Fix: a small top padding inside that area (`pt-1.5` in `Sidebar.tsx`).
6. **Branches.** `phase-1-ui` and `phase-3-kanban` were merged into `main` (PR #1 and #2). Release preparation is on `release-1.0`; it is merged into `main` by the developer when the installer test passes.
7. **Database folder is Roaming (found 2026-10-25; decided for 1.0 by the developer on 2026-11-01: it stays in Roaming).** The plugin puts `avenqor.db` in `%APPDATA%` (Roaming), the app config folder. On a company or school computer with roaming profiles, Windows may copy that folder to a server at logon. For a personal computer this is harmless. Moving it to the Local folder would need a Rust-side path setting; it can be reconsidered after 1.0 (a change would need a data move, so it is not a small edit).
8. **Open decisions** are listed in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) (Open questions) and [ARCHITECTURE.md](ARCHITECTURE.md): the Avenqor trademark check, the scope of attachments and templates, and the release preparation items.
9. **New packages need a lockfile commit.** Claude's workspace cannot reach the npm registry or build Rust, so `package-lock.json` and `Cargo.lock` change only on the developer's computer after `npm install` and the first `npm run tauri dev`. They must be committed by the developer.
10. **Drag and drop in the release program (reported broken 2026-10-31, working the same day).** After a clean rebuild the release program drags cards correctly (reported by the developer). The cause was most likely an outdated compiled program, but this was not confirmed.

## Roadmap checklist

- [x] Documentation system
- [x] **Phase 0:** environment and project setup
  - [x] Verify Windows prerequisites
  - [x] Create the Tauri 2 + React + TypeScript project
  - [x] Confirm it starts in development mode
  - [x] Confirm it builds
- [x] **Phase 1:** UI foundation (complete 2026-10-24; merged into `main`)
  - [x] Step 1: clean the template and apply the approved defaults (verified by the developer 2026-10-22: dev and release builds load the page, minimum window size correct, no CSP error in the dev Console, `Cargo.lock` updated and pushed)
  - [x] Step 2: styling with Tailwind CSS, DM Sans font stored locally, design tokens (verified by the developer 2026-10-23: dev run without errors, accent token change took effect, packages committed)
  - [x] Step 3: layout, sidebar, and routing with placeholder pages (verified by the developer 2026-10-23, except scroll behavior at small sizes and the 1366x768 and 1920x1080 screens)
  - [x] Step 4: base components (button, card, badge, progress bar) (verified by the developer 2026-10-23 in development mode and with `npm run build`; not tested in a release build)
  - [x] Step 4b: collapsible sidebar (verified by the developer 2026-10-23 in development mode and with `npm run build`; one focus-outline problem found and fixed, see Known issues)
  - [x] Step 5: Dashboard with temporary mock data (verified by the developer 2026-10-24 in development mode and with `npm run build`)
  - [x] Step 6: Workspace and project overview screens with temporary mock data (verified by the developer 2026-10-24 in development mode and with `npm run build`)
  - [x] Step 7: Settings and Help screens (verified by the developer 2026-10-24 in development mode, with `npm run build`, and in a rebuilt release program)
  - [x] Proof: changing the accent color in the token file changes every screen (see `CLAUDE.md` section 19)
- [x] **Phase 2:** SQLite, schema and migrations, workspace, project, and task CRUD (complete 2026-10-27; merged into `main`)
  - [x] SQL plugin installed, database file created (verified 2026-10-25)
  - [x] Migrations 1 and 2, five tables, owner trigger (verified 2026-10-25)
  - [x] Workspaces: create, rename, delete (verified 2026-10-25)
  - [x] Projects: create, edit, archive, restore, delete (verified 2026-10-25 and 2026-10-26)
  - [x] Tasks: create, edit, mark done, reopen, delete (verified 2026-10-26)
  - [x] Dashboard, local profile, and progress on real data; mock data removed (verified 2026-10-26)
  - [x] Closing check: release build with the existing and with a fresh database file (reported by the developer 2026-10-27), documentation review (2026-10-27)
  - [x] Database location decision: Roaming folder kept for now, to be revisited before a public release (Agreed by the developer 2026-10-27; see Known issues 7)
- [x] **Phase 3:** Kanban, calendar, task details, documents, progress, activity (complete 2026-10-30; merged into `main`)
  - [x] 3a Kanban board with buttons to move tasks (verified 2026-10-27)
  - [x] 3b Drag and drop on the board (verified 2026-10-30 in development mode; the release program was not reported)
  - [x] 3c Calendar and deadlines (verified 2026-10-28)
  - [x] 3d My Tasks page (verified 2026-10-28)
  - [x] Custom title bar with path (verified 2026-10-28 in development mode and 2026-10-29 in the release program)
  - [x] 3e-1 Task page with description (verified 2026-10-28)
  - [x] 3e-2 Checklist and notes, migration 3 (verified 2026-10-28)
  - [x] 3e-3 Labels, migration 4 (verified 2026-10-29)
  - [x] 3f Project documents, migration 5 (verified 2026-10-29; two small adjustments below were made after the test)
  - [x] 3g Local activity history, migration 6 (verified 2026-10-29)
  - [x] Closing check with the release program (reported 2026-10-29; the optional fresh-database check was skipped)
- [x] **Phase 4:** backup and restore, search, validation, notifications, testing (complete 2026-11-01; merged into `main`)
  - [x] 4a Backup and restore (verified 2026-10-30; the wording of the wrong-version messages was changed afterwards, 2026-10-31, and not yet re-tested)
  - [x] 4b Search and filters (verified 2026-10-31: search box and the task filters)
  - [x] 4c Validation review (verified 2026-10-31)
  - [x] 4d Local notifications (verified 2026-11-01 in development mode; the notification with the Avenqor name needs an installed build, see release preparation)
- [ ] Phases 5 to 7: GitHub integration, online architecture, platform expansion and AI (Future)

## Next task (exact)

**0. Developer, done:** the Windows icon of `project-manager.exe` and the taskbar (reported 2026-10-31), drag and drop in the release program (reported 2026-10-31), and the new screenshots in `docs/screenshots/` (pushed 2026-10-31).

**1. Developer: test the installer look and the installer itself (written 2026-11-01; the developer will report later because the build is slow). Use the branch `release-1.0`, so the installer carries version 1.0.0.** The NSIS installer (`-setup.exe`) now has the Avenqor pictures: `src-tauri/installer/header.bmp` (150x57, the wordmark on white) and `sidebar.bmp` (164x314, the A and the wordmark on the accent color), the Avenqor icon for installer and uninstaller, and `installMode: currentUser` (installs for the current Windows user, no administrator window).

```powershell
git fetch origin
git checkout release-1.0
git pull origin release-1.0
npm run tauri build
```

The installer is in `src-tauri\target\release\bundle\nsis\`. If the first build fails with an NSIS or image error, copy the text to Claude. Check:

1. Run the setup file (do not delete your development data first). The first page shows the sidebar picture and the later pages the header picture. Tell Claude if a picture is cut off, blurry, or looks wrong. Windows may show a SmartScreen warning because the file is not signed; that is expected until a code-signing certificate exists.
2. Install: Avenqor appears in the Start menu with the right icon, and starts. A desktop shortcut is only there if the installer offers it.
3. The installed program shows the same data as before (same database folder), the notification name is Avenqor, and drag and drop works.
4. Settings > Apps (Windows): Avenqor is listed with its icon. Uninstall it from there: the uninstaller shows the pictures and an option about deleting the application data. FIRST copy your backup somewhere safe (Settings, Export backup). Test once with the option unticked (the data folder `%APPDATA%\io.github.andra-gs.avenqor` stays) and reinstall: the data is still there.
5. Optional: tick the option and check that the folder is deleted.

**2. After the installer test:** merge `release-1.0` into `main`, tag `v1.0.0`, and publish the installer (for example as a GitHub Release). Code signing is optional (see ARCHITECTURE.md, Release preparation); without it Windows SmartScreen warns on first run. Decided 2026-11-01: database folder stays Roaming; version 1.0.0; the developer reports that no one holds a registration of the name Avenqor in Indonesia or internationally (stated by the developer, not checked by Claude). Plans for documents as files and the Whiteboard are in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) (Future). Merging `phase-3-kanban` into `main` is the developer's to do, when ready.
