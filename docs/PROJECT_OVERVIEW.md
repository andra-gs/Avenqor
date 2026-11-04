# Project Overview

Last updated: 2026-10-31

This document describes **what** the product is meant to be. For **how** it is built, see [ARCHITECTURE.md](ARCHITECTURE.md). For **where the work stands**, see [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md).

## Status labels used in this documentation

| Label | Meaning |
|---|---|
| **Agreed** | Confirmed requirement or decision (from `CLAUDE.md`). |
| **Proposed** | Suggested but not yet approved. |
| **Implemented** | Exists in the repository and has been verified to work. |
| **Future** | Planned for a later phase; not part of the current work. |

Features that the developer has tested on a real computer are marked **Implemented** in the table below. Everything else is **Agreed** or **Future**.

## Identity

- Working project name: **Project Manager Desktop** (from `CLAUDE.md`)
- Repository and folder name: `CLAUDE.md` says `project-manager-desktop`; the actual GitHub repository is `project-manager` (an open mismatch, see [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md), Known issues)
- Product name: **Avenqor** (**Agreed** by the developer on 2026-10-25; earlier name: Project Collaboration App). Whether trademark checks were done is not recorded; the check is a 1.0 item.

## Product goals (Agreed)

Build a practical project management application where users organize workspaces, projects, tasks, deadlines, documents, and progress in one place.

- The first release targets **Windows desktop** users.
- Core features work **locally**, with no rented server, cloud account, or permanent internet connection.
- The first version prioritizes **usability, data integrity, a clean interface, and a maintainable architecture** over the number of features.
- Long term, the product may become cross-platform (Windows, web, Android, iOS) and support collaboration between people on the same projects.

## Target users (Agreed)

- University students managing assignments and group projects.
- Programming students and software development teams.
- Independent programmers and developers.
- Content creators managing production workflows.
- Small teams that need a simple way to organize projects and tasks.

The application should be easy for beginners to understand while still being useful for people managing several projects.

## Core structure (Agreed)

```
Account → Workspace → Project → Tasks and related resources
```

A workspace groups related projects. Each project contains its own tasks, deadlines, documents, and activity.

Example: the workspace "Informatics Group" could contain the projects "Final Semester Project" and "Portfolio Website".

**Roles.** The eventual role model is Owner, Admin, Member, and Guest. The data model should be designed so these roles can be added when multi-user collaboration arrives. The offline MVP does **not** include a permission system, and must not pretend to have one.

## MVP scope (Agreed; status per row)

The roadmap in `CLAUDE.md` places the MVP features in these phases.

| ID | Feature | Planned phase | Status |
|---|---|---|---|
| A | **Dashboard**: workspace summary, recent projects, my tasks, upcoming deadlines, project progress, recent activity | Phase 1 (interface), Phase 2 (real data) | Agreed; interface and real data verified by the developer 2026-10-26 (local activity history verified 2026-10-29; the upcoming-deadline list is on the Calendar page, not on the Dashboard) |
| B | **Workspace management**: create, view, edit, delete; list projects in a workspace | Phase 2 | Implemented (create, rename, delete, project list; verified by the developer 2026-10-25 and 2026-10-27) |
| C | **Project management**: create, view, edit, archive or delete; description, status, progress; members as a data model only | Phase 2 | Implemented (create, edit, archive, restore, delete, calculated progress; verified 2026-10-26; members exist only as data) |
| D | **Task management**: title, description, status, priority, deadline, labels, assignee or local responsibility field, subtasks, checklists, notes | Phase 2 (create and edit), Phase 3 (details, checklists) | Implemented, except subtasks (create, edit, mark done, reopen, delete; verified 2026-10-26). Task page with description, status, and properties verified 2026-10-28 (step 3e-1). Checklists and notes verified 2026-10-28 (step 3e-2); labels verified 2026-10-29 (step 3e-3, migration 4; filtering by label comes in Phase 4); nested subtasks are not planned for the MVP |
| E | **Kanban board**: columns To Do, In Progress, Review, Done; move tasks; changes saved to SQLite | Phase 3 | Implemented: board page, move with buttons (verified 2026-10-27), and drag and drop between columns (verified 2026-10-30), saved to SQLite |
| F | **Calendar and deadlines**: calendar view, upcoming list, overdue versus upcoming | Phase 3 | Implemented (month grid, upcoming list, overdue versus upcoming; verified by the developer 2026-10-28) |
| G | **Project documents**: notes, requirements, meeting notes, API references, UI/UX decisions | Phase 3 | Verified by the developer 2026-10-29 (step 3f, migration 5): plain-text documents of five types per project, a Documents page with search by title and filters, and a Documents section on each project page. Attachments and search inside the text are Future (Phase 4 or later) |
| H | **Progress and activity**: completion statistics computed from stored data, local activity history | Phase 3 | Implemented: progress is calculated from real task data (verified 2026-10-26); local activity history (step 3g, migration 6) verified 2026-10-29, shown as Activity on the Dashboard, project page, and workspace page |
| I | **Templates**: reusable project or task templates, where practical | Not scheduled in the roadmap | Agreed, not started |
| J | **Backup and restore**: JSON export and validated import, format version, no silent overwrite | Phase 4 | Implemented (step 4a, verified by the developer 2026-10-30): export of all data to a JSON file, validated restore that replaces all data after a mandatory safety backup. Merge mode and automatic or encrypted backups are not planned for 1.0 |
| K | **Local notifications**: deadline reminders once the core is stable | Phase 4 ("where appropriate") | Implemented (step 4d, verified by the developer 2026-11-01): one daily reminder for your tasks that are due today or overdue, only while the app is open; settings kept in the web view's storage |

Search and filters (search box in the top bar and task filters on the project page verified 2026-10-31), error handling and validation, and testing are also listed for Phase 4.

### Rules that shape the MVP

- Progress must be **derived from stored data**, not arbitrary percentages.
- There is **no real-time collaborative editing** in the offline version.
- Local data on one computer is **not shared** with other computers.
- Attachments are not part of the current documents. Importing files into documents is planned after 1.0 (see "Documents as files and folders"); the scope of templates is not decided.

## Deferred (Agreed: do not prioritize)

Real-time cross-device sync, cloud accounts and authentication, online chat and live presence, full multi-user collaboration, AI assistant integration, complex enterprise permissions, large-scale analytics, and anything requiring paid infrastructure.

## Future roadmap (Future)

| Phase | Goal |
|---|---|
| 5 | **GitHub integration**: connect a repository to a project; show repository information, commits, pull requests, and review status where the API allows. Needs internet access and secure authentication. Tokens must never be committed. |
| 6 | **Online architecture**: authentication, backend API, cloud database, synchronization, conflict handling, offline-to-online data migration, shared workspaces. |
| 7 | **Platform expansion and AI**: evaluate web, Android, and iOS options; add AI-assisted features only when justified. |

Tauri does not automatically produce a complete mobile application. The Android version was chosen after 1.0 and is planned in [MOBILE.md](MOBILE.md); iOS is later and needs a Mac.

## Version 1.0 and the plans after it (Future; details Agreed 2026-10-30)

**Order of work (Agreed 2026-10-30; decided 2026-11-01).** Release 1.0 is published. The developer chose the **mobile version first** (Android, Tauri 2 mobile, in the same repository; see [MOBILE.md](MOBILE.md)). The Documents and Whiteboard update comes after it. Nothing in the two sections below is built yet, and the details may still change when that work starts.

**Scope of 1.1 (Agreed 2026-11-04):** the Android version (64-bit ARM APK, signed, outside the Play Store) in the same release as the unchanged Windows program, with one shared version number. Status: prepared on the branch `release-1.1.0` (2026-11-04); not Implemented as a release until the files are built, published, and installed from the download. Details and test results: [MOBILE.md](MOBILE.md).

**Scope of 1.0 (Agreed 2026-10-30):** Phase 4 complete (backup and restore, search and filters, validation review, local notifications); drag and drop on the Kanban board (step 3b); release preparation (a tested installer, the database folder stays in Roaming (decided 2026-11-01), the name Avenqor (the developer reports no registration was found in Indonesia or internationally, 2026-11-01, not checked by Claude), version 1.0.0, customizing the installer and uninstaller). **Not in 1.0:** GitHub integration (Phase 5) and online features (Phase 6).

**Installer and uninstaller look (Agreed as a 1.0 item 2026-10-30; verified by the developer 2026-11-01).** Tauri's NSIS installer (the `-setup.exe`) can be customized in `tauri.conf.json` under `bundle > windows > nsis`: header and sidebar pictures (`headerImage` 150x57 px, `sidebarImage` 164x314 px), installer and uninstaller icons, a separate header picture for the uninstaller, the language list, the Start Menu folder, and a hooks file (`installerHooks`) or a full custom template for more. The MSI installer has fewer options (banner and dialog pictures). The pages and layout of the NSIS wizard cannot be redesigned freely without a custom template, which is more work. (Source: the Tauri `NsisConfig` reference, read 2026-10-30.)

### Documents as files and folders (Future)

- Documents become **files** with a format and are shown as a **tree of folders and files** like a GitHub repository, **separated by workspace**.
- Creating a project **automatically creates a folder** with the project's name inside its workspace. Only that folder is automatic.
- One compact "New" button offers **New folder** and **New file**. Folders may contain folders, and files may sit directly at the top level of a workspace.
- Formats: `.md`, `.txt`, `.html`, and others. **`.md` has two modes: editing the raw text and a rendered preview.** Other text formats have raw text editing only.
- Files can be **imported from the computer**. PDF and image files have **preview only**. Imported files are stored **inside the SQLite database** (BLOB), so there is one data file and backups stay simple. A limit of **10 MB per file** with a clear message (Agreed). Trade-offs noted: the database grows, JSON backups become large, and large files are slower to read through the SQL plugin; `CLAUDE.md` asks to avoid large binaries in the database unless there is a clear reason, and the developer's reason is a single data file.
- Today's documents (step 3f) are **migrated to `.txt` files** in their project's folder, and each file **keeps its type as a tag** (Notes, Requirements, Meeting notes, API reference, UI/UX decision).
- Deleting a project **does not delete its folder**: it stays as an ordinary folder in the workspace with all its contents. When the project is renamed, the folder name follows while it is still linked. Moving a project to another workspace **moves the folder and its contents**. Deleting a workspace deletes all its folders and files, after a confirmation that names the number of files.
- Open for later: how `.html` is shown (as code, or rendered, which needs a security decision), and how the SQL plugin copes with 10 MB files (to be tested before building).

### Whiteboard (Future)

A simple whiteboard in the spirit of Miro or FigJam.

- **One whiteboard per workspace.** The canvas is **unlimited** (pan in any direction) if technically possible, has a **square grid background** (one cell like a spreadsheet), and can be **zoomed** in and out.
- **Sticky-note widgets** (text), resizable with a **minimum of 2x2 cells**, draggable. They can be connected to other widgets with **arrow lines or "cables"** (right-angled arrow lines).
- **Flowchart items** are a separate kind of item from sticky notes, inspired by the software Flowgorithm: the basic shapes (start/end oval, input/output parallelogram, process box, decision diamond, loop) joined with right-angled cables with arrowheads.
- **Icon items** for the target audience (students, programmers, networking): server, database, PC, laptop, phone, router, switch, firewall, cloud, user, folder, code (Agreed list; may grow).
- **Links in a widget:** typing `@` and a project or task name shows suggestions and creates a link that opens that page. When the task or project is deleted, the link becomes plain grey text.
- Also wanted: **undo/redo, selecting several widgets at once, and widget colors**.
- Stored in the **database** (positions, sizes, content) and included in backups. **Export to an image is postponed**, to be done later if hard.
- Open for later: the canvas library (a technical decision with long-term consequences, to be explained and approved before building), and how many whiteboard features fit a first version.

## Design reference (Agreed)

Figma concept: <https://www.figma.com/design/K22NNL2AkbZKjRDMzPXn7c>

Direction: clean, modern desktop interface; light theme; DM Sans typography; indigo accent; sidebar navigation; clear spacing and hierarchy.

Screens in the Figma file: Dashboard, Workspace, Project Board, Project Overview and GitHub, Mobile Dashboard, Calendar and Deadlines, Task Details, Project Documents, Local Data and Backup. The GitHub and Mobile screens are references for **future** phases, not MVP work.

**Note:** the Figma file was inspected only through its structure (frames and names); screenshots could not be downloaded in Claude's workspace. Since 2026-10-22 the design is a reference, not a binding specification, and each deviation is mentioned when it happens.

## Open questions (Proposed or undecided)

These need a decision before the related work starts.

- Trademark: the developer reports (2026-11-01) that no registration of the name Avenqor was found in Indonesia or internationally. Not checked by Claude and not legal advice; a formal search may still be wise before commercial use.
- The scope of templates (feature I).
- Whether file attachments are supported: planned only through the Documents update after 1.0.

Decided since this document was first written: the product name (Avenqor), Tailwind CSS (used), database access (the Tauri SQL plugin, see [ARCHITECTURE.md](ARCHITECTURE.md)), and the local profile (one profile stored in the database).

## MVP success criteria (Agreed)

The MVP is successful when it runs as a Windows desktop application; core project and task features work offline; data persists locally in SQLite; the interface follows the Figma direction; users can organize workspaces, projects, tasks, deadlines, and documents; data can be exported and restored safely; no rented server is required; the code is understandable and maintainable; and future online features can be added without rewriting the whole application.
