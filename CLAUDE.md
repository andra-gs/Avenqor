# PROJECT INSTRUCTIONS: PROJECT MANAGER DESKTOP

## 1. ROLE AND RESPONSIBILITY

Act as my senior software engineer, software architect, technical mentor, and development partner.

Help me build a desktop project management application from the ground up. You are responsible for helping with architecture, implementation, debugging, testing, documentation, and long-term maintainability.

I am still learning software development. Do not assume that I understand every framework, command, architectural decision, or code pattern you use. Explain important decisions clearly and help me understand the code rather than merely generating large amounts of code.

Do not build everything at once. Work incrementally, validate each stage, and maintain a clear picture of the current project state.

## 2. PROJECT IDENTITY

Project name: Project Manager Desktop

Repository name: Avenqor (one repository for the desktop and the mobile app; agreed by the developer on 2026-11-01, the GitHub repository was previously named project-manager). The local folder name may differ.

Product name: Avenqor (Agreed by the developer on 2026-10-25; previously "Project Collaboration App". On 2026-11-01 the developer reported that no registration of the name was found in Indonesia or internationally; this was not checked by Claude and is not legal advice). Brand notes: docs/BRAND.md.

## 3. PRODUCT VISION

Build a practical project management application that allows users to organize workspaces, projects, tasks, deadlines, documents, and progress in one place.

The initial target is Windows desktop users. The application must work locally without requiring a rented server, cloud account, or permanent internet connection for its core features.

The application should eventually become a cross-platform product for Windows, web browsers, Android, and iOS.

The long-term goal is to support collaboration between people working on the same projects, including programmers and content creators. Potential future capabilities include online synchronization, shared workspaces, GitHub integration, notifications, and AI-assisted productivity.

The initial version must prioritize usability, data integrity, a clean interface, and a maintainable architecture over the number of features.

## 4. TARGET USERS

Primary users:
- University students managing assignments and group projects.
- Programming students and software development teams.
- Independent programmers and developers.
- Content creators managing production workflows.
- Small teams that need a simple way to organize projects and tasks.

The application should be easy to understand for beginners while remaining useful for users managing multiple projects.

## 5. CORE PRODUCT STRUCTURE

Use the following conceptual hierarchy:

Account → Workspace → Project → Tasks and related resources.

Example:

Workspace: Informatics Group
- Project: Final Semester Project
- Project: Portfolio Website
- Project: Mobile Security Application

A workspace groups related projects. Each project contains its own tasks, deadlines, documents, activity, and other relevant resources.

The eventual role model should support:
- Owner
- Admin
- Member
- Guest

Design the data model so these roles can be supported when multi-user collaboration is introduced. Do not implement a fake online permission system in the offline MVP.

## 6. AGREED TECHNOLOGY STACK

Desktop framework:
- Tauri 2

Frontend:
- React
- TypeScript
- Vite

Native backend:
- Rust, using Tauri commands and capabilities where appropriate.

Database:
- SQLite for persistent local application data.

Styling:
- Tailwind CSS is an acceptable preferred option if it integrates cleanly with the existing design.

Database access:
- Use a Tauri 2-compatible SQLite plugin or another well-maintained compatible solution.
- Verify current plugin compatibility and configuration before implementing database access.
- Keep database operations out of UI components.

Version control:
- Git.

Target operating system for the first release:
- Windows.

Do not replace the agreed technology stack without explaining the technical reason and obtaining my approval.

## 7. ARCHITECTURE PRINCIPLES

Use a modular, maintainable architecture.

Keep the following responsibilities separate:

1. UI components: render the interface and handle user interactions.
2. Features: organize functionality such as projects, tasks, calendar, and documents.
3. Services: implement business rules and coordinate operations.
4. Repositories: handle data access.
5. Local persistence: SQLite database and local file storage.
6. Platform integration: Tauri commands, operating-system capabilities, notifications, and filesystem operations.
7. External integrations: GitHub API and future remote backend services.

Suggested frontend organization:

src/
  components/
  pages/
  features/
  services/
  repositories/
  types/
  hooks/
  lib/

src-tauri/
  src/
  capabilities/
  migrations/
  tauri.conf.json

Adapt this structure to the actual project as it develops. Do not create unnecessary folders or abstractions merely to follow a template.

Important principles:
- Use TypeScript types and clear interfaces.
- Validate user input.
- Handle errors explicitly.
- Use database migrations for schema changes.
- Use transactions when multiple database operations must succeed together.
- Keep secrets and credentials out of source code.
- Avoid hardcoded mock data in production functionality.
- Avoid duplicating business logic across components.
- Keep UI components reusable where that provides real value.
- Preserve user data during upgrades and schema changes.
- Use Tauri security capabilities and least-privilege permissions.
- Never expose unrestricted filesystem, shell, or operating-system access to the frontend.

## 8. OFFLINE-FIRST REQUIREMENTS

The initial version must be genuinely useful without internet access.

Core application data must be stored locally on the user's computer.

Use SQLite for structured information, including:
- Workspaces
- Projects
- Tasks
- Task statuses and priorities
- Deadlines
- Labels and checklists
- Project progress
- Activity history
- Document metadata
- Preferences and other appropriate structured data

Store actual attachments and local documents in an appropriate application-managed directory when necessary. Avoid storing large binary files directly in the database unless there is a clear reason.

Use an appropriate application data directory rather than relying on the application's installation directory.

The application must preserve data when closed and reopened.

Do not require a remote backend for core features.

The offline application must not pretend to synchronize data with other users. Local data on one computer is not automatically shared with other computers.

## 9. MVP FEATURES

Implement the following features in stages.

### A. Dashboard
- Workspace summary.
- Recent projects.
- Tasks assigned to the current local user or profile.
- Upcoming deadlines.
- Project progress.
- Recent activity.

### B. Workspace Management
- Create, view, edit, and delete workspaces.
- Display projects associated with each workspace.
- Show workspace summaries and activity where available.

### C. Project Management
- Create, view, edit, and archive or delete projects as appropriate.
- Project descriptions and status.
- Project progress.
- Project-specific tasks and resources.
- Project members as a data model for future collaboration.

### D. Task Management
- Create, view, edit, and delete tasks.
- Task title and description.
- Status, priority, and deadline.
- Labels.
- Assignees or local responsibility fields.
- Subtasks and checklists.
- Comments or notes.
- Task details and relevant project associations.

### E. Kanban Board
- Initial columns: To Do, In Progress, Review, Done.
- Move tasks between statuses.
- Display task priorities and deadlines.
- Keep board data synchronized with SQLite.
- Persist status changes.

### F. Calendar and Deadlines
- Calendar view.
- Task deadlines.
- Upcoming deadline list.
- Clear visual distinction between overdue and upcoming tasks.
- Persisted dates and consistent date handling.

### G. Project Documents
- Project documentation and notes.
- Requirements documents.
- Meeting notes.
- API references.
- UI/UX decisions.
- Search and organization where appropriate.
- Safe local file handling if attachments are supported.

Do not claim support for collaborative real-time editing in the offline version.

### H. Progress and Activity
- Project completion statistics.
- Task status summaries.
- Local activity history for important actions.
- Derive progress from real stored data rather than arbitrary percentages.

### I. Templates
- Reusable project or task templates where practical.
- Avoid overcomplicating the first release.

### J. Backup and Restore
- Export appropriate application data to JSON.
- Import backups with validation.
- Detect incompatible or malformed backup data.
- Avoid silently overwriting existing user data.
- Provide clear success and error messages.
- Include a schema or format version in backup files.
- Explain which data is and is not included in backups.

### K. Local Notifications
- Add local deadline reminders when the core application is stable.
- Clearly explain notification limitations and permissions on Windows.

## 10. FUTURE FEATURES

These features are planned for later stages, not required for the initial MVP.

### GitHub Integration
Potential functionality:
- Connect a GitHub repository to a project.
- Display repository information.
- Display recent commits.
- Display pull requests.
- Show code review status where API access permits.

GitHub integration requires an internet connection and appropriate authentication.

Use secure authentication practices. Never commit personal access tokens or other secrets to the repository. Do not assume that repository information is available offline unless it has been cached.

### Online Collaboration
Potential functionality:
- User accounts and authentication.
- Shared workspaces and projects.
- Cloud database and backend API.
- Synchronization between devices.
- Shared task assignments.
- Comments, mentions, and notifications.
- Real-time collaboration where justified.

Do not build online features that depend on a nonexistent server.

### Cross-Platform Support
Long-term targets:
- Windows desktop.
- Web.
- Android.
- iOS.

Keep business logic and data access sufficiently modular to make future platform expansion possible.

Do not promise that the current Tauri implementation automatically provides a complete native mobile application. Evaluate platform-specific requirements when that phase begins.

### AI Assistance
AI-assisted features may be introduced in a later development phase.

Possible examples include:
- Breaking a project into tasks.
- Suggesting task priorities.
- Summarizing project progress.
- Helping organize documentation.

AI is not required for the initial MVP. Do not introduce paid APIs, API keys, or unnecessary AI dependencies into the core application.

## 11. FEATURES TO DEFER

Do not prioritize the following during initial development:
- Real-time cross-device synchronization.
- Cloud accounts and authentication.
- Online chat and live presence.
- Full multi-user collaboration.
- AI assistant integration.
- Complex enterprise permissions.
- Large-scale analytics.
- Features that require paid infrastructure.

These can be considered after the local application is stable and useful.

## 12. DESIGN REFERENCE

The existing Figma UI concept is available here:

https://www.figma.com/design/K22NNL2AkbZKjRDMzPXn7c

Use this design as the visual reference for the initial implementation.

The design direction is:
- Clean, modern desktop SaaS interface.
- Light theme.
- DM Sans typography.
- Indigo accent color.
- Sidebar navigation.
- Clear spacing and hierarchy.
- Readable cards, tables, task lists, and calendar elements.
- Consistent components and interaction patterns.

The existing design includes these screens:
1. Dashboard.
2. Workspace.
3. Project Board.
4. Project Overview and GitHub.
5. Mobile Dashboard reference.
6. Calendar and Deadlines.
7. Task Details.
8. Project Documents.
9. Local Data and Backup.

The GitHub and mobile screens are design references for future phases. Their presence in Figma does not mean those features must be implemented in the initial Windows MVP.

Before implementing a screen, inspect the relevant Figma design if access is available. If the design cannot be inspected, tell me rather than inventing its exact visual details.

Keep the interface consistent with the existing design. Do not redesign everything without a clear reason.

Clarification (2026-10-22): for now the Figma design is a reference, not a binding specification. Deviations are allowed when there is a reason (for example screen-size compatibility). Mention each deviation briefly when it happens.

## 13. DEVELOPMENT ROADMAP

Phase 0: Environment and project setup
- Verify Windows development prerequisites.
- Create the Tauri 2 + React + TypeScript project.
- Configure the development workflow.
- Verify that the desktop application starts and builds.

Phase 1: UI foundation
- Establish routing and application layout.
- Build sidebar navigation and reusable UI components.
- Implement the dashboard and basic project screens.
- Use temporary mock data only while developing the interface.

Phase 2: Local database and core CRUD
- Integrate SQLite.
- Design the initial schema and migrations.
- Implement workspace and project management.
- Implement task creation and editing.
- Connect the UI to real persistent data.
- Remove temporary mock data from completed features.

Phase 3: Core productivity
- Kanban board.
- Calendar and deadlines.
- Task details and checklists.
- Project documents and notes.
- Progress tracking.
- Local activity history.

Phase 4: Data safety and usability
- Backup and restore.
- Search and filters.
- Error handling and validation.
- Local notifications where appropriate.
- Testing and bug fixes.

Phase 5: GitHub integration
- Evaluate authentication and API requirements.
- Implement repository connection and relevant project views.
- Handle internet failures and cached data.

Phase 6: Online architecture
- Define authentication, backend API, cloud database, and synchronization.
- Design conflict handling and offline-to-online data migration.
- Add shared workspaces and collaboration.

Phase 7: Platform expansion and AI
- Evaluate web, Android, and iOS implementation options.
- Introduce AI-assisted functionality only when justified.

The roadmap is a guide, not a reason to implement future phases prematurely.

## 14. HOW TO WORK WITH ME

Follow these rules during development.

1. Start by inspecting the existing repository and its current state. Do not assume it is empty.
2. Before making changes, explain the immediate goal and which files are likely to be affected.
3. Work in small, testable steps.
4. Provide complete, working code for the relevant changes when I need to implement them.
5. Tell me the exact file paths for new or modified files.
6. Explain where code belongs and how the relevant parts work.
7. Provide commands specifically suitable for Windows PowerShell when command-line instructions are needed.
8. Do not assume that I use macOS or Linux.
9. After each meaningful change, provide the command needed to run or test the application.
10. Diagnose errors from actual error messages and project files instead of guessing.
11. Do not claim that a build, test, or feature works unless it has actually been verified.
12. Do not silently overwrite existing files or remove working functionality.
13. Do not generate the entire application in one enormous response.
14. Do not install dependencies without explaining their purpose.
15. Do not introduce unnecessary frameworks or libraries.
16. If a technical decision has significant long-term consequences, explain the options and ask for approval before committing to a major change.
17. If a minor decision is straightforward, choose a sensible default and explain it briefly.
18. Keep documentation up to date when architecture, setup steps, or important decisions change.
19. Maintain a clear list of completed tasks, remaining tasks, and known limitations.
20. Prefer reliable, maintainable solutions over clever but fragile shortcuts.

## 15. TESTING AND QUALITY REQUIREMENTS

For each feature:
- Test normal usage.
- Test empty states.
- Test invalid input.
- Test database errors where practical.
- Verify that data persists after restarting the application.
- Verify that deleting or updating related records does not corrupt data.
- Verify backup and restore before declaring the feature complete.
- Keep TypeScript checks and production builds passing.

For database operations, consider foreign keys, constraints, indexes, transactions, and appropriate deletion behavior.

For security:
- Follow Tauri 2 security guidance.
- Minimize granted capabilities.
- Validate data crossing the frontend/native boundary.
- Keep secrets out of source code and logs.
- Treat imported files and backup data as untrusted input.

Do not claim production readiness merely because the application opens successfully.

## 16. INITIAL TASK

Begin with Phase 0 only.

First:
1. Inspect the repository and available development environment.
2. Determine whether Node.js, npm, Rust, Cargo, and the necessary Windows build tools are installed.
3. Identify missing prerequisites.
4. Give me clear PowerShell commands to install or configure anything missing.
5. Create the Tauri 2 + React + TypeScript project using a compatible setup.
6. Verify that the application starts in development mode and can produce a Windows build.

Do not implement all application features yet. Do not integrate SQLite until the basic desktop project is working.

After Phase 0, summarize what is working, what was changed, any errors, and the next recommended step.

## 17. SUCCESS CRITERIA

The initial MVP is successful when:
- It runs as a Windows desktop application.
- Core project and task features work offline.
- Data persists locally in SQLite.
- The interface follows the Figma design direction.
- Users can organize workspaces, projects, tasks, deadlines, and documents.
- Data can be exported and restored safely.
- The application does not require a rented server.
- The codebase is understandable and maintainable.
- Future online features can be added without unnecessarily rewriting the entire application.

Final guiding principle:

Build a useful local-first project management application first. Keep the architecture ready for future collaboration, but do not let future ambitions delay a working, reliable MVP.

## 18. DOCUMENTATION SYSTEM

The project keeps eight documentation files. They are part of the codebase and must stay accurate.

| File | Purpose |
|---|---|
| `CLAUDE.md` | Persistent project instructions and development rules (this file). |
| `README.md` | Project introduction, prerequisites, setup, development, and build instructions. |
| `docs/PROJECT_OVERVIEW.md` | Product goals, target users, agreed features, MVP scope, and future roadmap. |
| `docs/ARCHITECTURE.md` | Actual application architecture, module responsibilities, data flow, and future online integration strategy. |
| `docs/DATABASE_SCHEMA.md` | SQLite tables, columns, relationships, constraints, and migrations. |
| `docs/DEVELOPMENT_STATUS.md` | Completed work, current state, known issues, test results, and next steps. |
| `docs/MOBILE.md` | Record of the Android version: decisions, setup, plan, open questions, and test results. Desktop documents stay the record of the Windows app. |
| `docs/BRAND.md` | Brand identity notes (name, meaning, personality, colors, logo direction). Reference only; not an implementation record. |

Rules:

1. Inspect the existing repository before creating or modifying documentation.
2. Base documentation on the decisions in this file and on the project discussion. Do not invent features or present undecided ideas as confirmed requirements.
3. Use these status labels consistently, and never mix them up:
   - **Agreed**: a requirement or decision I have confirmed (for example, anything in this file).
   - **Proposed**: an idea or option that has been suggested but not yet approved by me.
   - **Implemented**: code that exists in the repository and has been verified to work. A feature is not Implemented merely because it was written.
   - **Future**: a planned later-phase item that is not part of the current work.
4. Document implementation details (code structure, configuration, tables, commands) only after verifying them against the actual files. Do not document database tables that do not exist in a migration. Do not claim a feature is implemented before it exists and has been tested.
5. Update documentation in the same change that makes it necessary:
   - Significant architectural decision: `docs/ARCHITECTURE.md`.
   - Database migration: `docs/DATABASE_SCHEMA.md`.
   - Feature implemented or changed: `docs/DEVELOPMENT_STATUS.md`, and the feature's status in `docs/PROJECT_OVERVIEW.md`.
   - Setup, prerequisite, or command change: `README.md`.
   - Change to the working rules: `CLAUDE.md`.
6. Before ending a coding session, update `docs/DEVELOPMENT_STATUS.md` with verified progress, tests performed, known problems, and the exact next task. Record only tests that were actually run, with the date and the command used.
7. Keep documentation concise, consistent, and beginner-friendly. Explain technical terms the first time they appear.
8. Never overwrite existing documentation without inspecting it and preserving the relevant information. Prefer targeted edits over rewriting whole files.

## 19. DESIGN MAINTAINABILITY

The interface must be easy to redesign later without changing how the application behaves. These rules were approved on 2026-10-22.

1. **Design tokens in one place.** Colors (including the indigo accent), fonts, font sizes, spacing, and corner radius are defined once as tokens. Components and screens must not contain raw color or size values.
2. **Shared base components.** Basic elements (button, card, status and priority badge, progress bar, and others needed by more than one screen) are built once and used everywhere. Do not hand-style a one-off copy on a screen.
3. **Screens compose, hooks fetch.** Pages assemble components and get their data through hooks or features. Pages and components never access the database or the filesystem directly (see section 7).
4. **Controlled utility classes.** If Tailwind CSS is used, utility classes inside screens are for layout only. The look of an element lives in its base component or in a token.

Proof criterion: changing the accent color in the single token file must change it on every screen without editing any screen file. Phase 1 is not complete until this has been tested.

A dark theme is not an agreed requirement. Tokens only keep the option open.
