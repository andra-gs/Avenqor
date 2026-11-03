# Mobile version (Android first)

Last updated: 2026-11-01

This document is the separate record for the mobile version of Avenqor: decisions, setup, plan, open questions, and test results. The desktop documents ([ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md), [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)) stay the record of the Windows application. Status labels are explained in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).

> **Status (2026-11-01): nothing is built yet.** The decisions below are **Agreed**; everything else in this file is **Proposed** or "to verify". No Android command has been run, so no statement here claims that Avenqor already runs on a phone.

## Decisions (Agreed by the developer, 2026-11-01)

| Decision | Choice |
|---|---|
| Order of work after 1.0 | The mobile version comes first. The Documents and Whiteboard update comes later. |
| Technology | **Tauri 2 mobile**: the same React, TypeScript, and SQLite code as the desktop app, packaged for Android. No rewrite in another framework. |
| Repository | **One repository** for desktop and mobile. A separate repository was considered and not chosen. |
| First platform | **Android.** iOS later: it needs a Mac and a paid Apple developer account, so it is not part of the first mobile release. |
| Test device | The developer's own Android phone, connected by a USB cable. |
| Repository name | **Avenqor** (Agreed 2026-11-01), replacing `project-manager`, because "desktop" would be wrong now that the repository holds the mobile app too. GitHub redirects the old links. `CLAUDE.md` section 2 was changed to match. The rename itself is done in the GitHub settings by the developer. |

Why one repository (Claude's reasoning, approved with the decision): the services, repositories, validation, backup format, and database migrations are shared, so a second repository would copy them and the two copies could drift apart.

## What stays the same

- The database, the six migrations, the schema, and the services and repositories. The activity history is still written by triggers.
- The backup file format (JSON, format version 1, schema version 6). It is the bridge between the PC and the phone until synchronization exists (Phase 6, Future).
- The design tokens, the base components, and the rule "screens compose, hooks fetch".

## What must change for a phone (Proposed; to verify while building)

| Area | Desktop today | Mobile need |
|---|---|---|
| Window | Custom title bar, window buttons, minimum size 960x600 | None of these exist on a phone. The title bar and window code must run on desktop only. |
| Navigation | Sidebar (collapsible) and a top bar with a search box | Bottom navigation or a menu; the search box needs a place on a small screen |
| Layout | Multi-column pages made for 960 px and wider | One column, larger touch targets, scrolling lists. The Figma file has a "Mobile Dashboard" reference. |
| Drag and drop on the board | Mouse drag with HTML5 drag events | Touch dragging may not work with these events. The arrow buttons already exist as the fallback; a touch drag is a later improvement |
| Keyboard shortcuts | `Ctrl+K` for search | Not available; a button replaces it |
| Backup files | Windows "Save as" and "Open" windows | The Android file picker and sharing; needs checking with the dialog and fs plugins |
| Reminders | Daily check while the app is open | Android can schedule notifications; needs the notification permission (Android 13 and later asks the person). To verify with the notification plugin |
| Settings storage | `localStorage` (reminder settings, last backup) | Still works in the web view; to verify |
| Database location | `%APPDATA%\io.github.andra-gs.avenqor` | The app's private storage on the phone; to verify with the SQL plugin |
| Installer | NSIS installer | An Android package (APK, later maybe AAB) signed with a key that must never be lost |

## To verify first (the "spike")

The Tauri plugins used today are SQL, dialog, fs, and notification. Whether each works on Android was **not verified**: the plugin overview page of the Tauri documentation could not be read reliably (read 2026-11-01), so support must be checked on each plugin's own page and then by running it. Also to check:

- the security policy (CSP) and the `ipc` connection setting in `tauri.conf.json`, which were written for Windows;
- how a permission file (capability) can be limited to one platform, so that the window permissions stay desktop-only;
- how the `dragDropEnabled: false` window setting and `decorations: false` behave on Android, or whether they must be set per platform;
- how the Android web view handles the hash routing, fonts, and `Intl` date formatting used by the app.

## Setup on the developer's Windows computer (from the Tauri documentation, read 2026-11-01; not yet run)

Source: <https://v2.tauri.app/guides/prerequisites/> (the Android section).

1. Install **Android Studio**.
2. In Android Studio, open the SDK Manager and install: Android SDK Platform, Android SDK Platform-Tools, NDK (Side by side), Android SDK Build-Tools, and Android SDK Command-line Tools. Use the newest versions that the manager offers.
3. Set `NDK_HOME` (command from the documentation, in Windows PowerShell):

```powershell
$VERSION = Get-ChildItem -Name "$env:LocalAppData\Android\Sdk\ndk" | Select-Object -Last 1
[System.Environment]::SetEnvironmentVariable("NDK_HOME", "$env:LocalAppData\Android\Sdk\ndk\$VERSION", "User")
```

4. Set `JAVA_HOME` and `ANDROID_HOME`. The documentation page, as it could be read, gave these only for Linux. For Windows the usual values are `$env:LocalAppData\Android\Sdk` for `ANDROID_HOME` and the `jbr` folder inside the Android Studio installation for `JAVA_HOME`. These two Windows values are **not verified**; Claude will check them against the real folders when the developer runs the check commands.
5. Add the Rust targets for Android:

```powershell
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

6. Restart PowerShell and Visual Studio Code so the variables are seen.
7. On the phone: turn on Developer options (tap "Build number" in Settings, About phone, seven times), turn on **USB debugging**, connect the cable, and accept the "Allow USB debugging" question on the phone. (Standard Android steps, not from the Tauri documentation.)

## Plan (Proposed)

Each step is small, tested by the developer, and recorded in [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) and here.

| Step | Goal | Result to check |
|---|---|---|
| M0 | Set up the Android tools (above) and check them with a few commands | The tools are found; the phone is listed |
| M1 | The spike: add the Android project to the repository and run the **unchanged** app on the phone | Record exactly what works and what breaks (database, plugins, layout) |
| M2 | Separate desktop-only code: title bar, window permissions, window settings | Desktop still works exactly as before (the 1.0 behavior is the reference). **Passed 2026-11-02** (see below) |
| M3 | Mobile layout: navigation, one-column pages, touch sizes | The main screens are usable on the phone. **First part written 2026-11-03, not yet tested** (see below) |
| M4 | Data features on the phone: backup export and import, reminders, search | Each one works with real data. **Passed 2026-11-03** (reported by the developer, see below) |
| M5 | A signed Android package (APK) that can be installed without the USB cable | Installed and tested on the phone. **Gradle signing change written 2026-11-03, not yet tested** (see below) |
| M6 | Release (for example as a GitHub Release, like 1.0) | Download and install work |

The desktop release stays the source of truth: every change for mobile must keep the Windows app working, which is verified with `npm run build` and a run of the desktop app before each commit.

## Open questions

- Version numbering for mobile: the same number as desktop (for example 1.1.0 for both), or separate numbers. Not decided.
- How the phone and the PC exchange data before synchronization exists: backup files only (the current idea), with a clear explanation in the app.
- Whether the phone gets every feature of the desktop version in the first mobile release, or a smaller set. Not decided; to settle after the spike.
- Android signing key: where it is stored and backed up (losing it prevents updates of an installed app).

## Known limitations (expected)

- Data on the phone and on the PC is separate. There is no synchronization before Phase 6, and the app must not suggest otherwise.
- iOS is not part of the first mobile release.

## Test results

Each test is recorded with the date and the command used. All results below were reported by the developer.

**M0, Android tools (2026-11-01, Windows PowerShell): passed.**

| Check | Command | Result |
|---|---|---|
| Phone seen by adb | `& "$env:LocalAppData\Android\Sdk\platform-tools\adb.exe" devices` | First `unauthorized`, then `device` after the developer accepted "Allow USB debugging" on the phone |
| Rust targets | `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android` | All four "up to date" |
| `NDK_HOME` | `$env:NDK_HOME` | Set (NDK 30.0.16248370) |
| `JAVA_HOME`, `ANDROID_HOME` | set with `SetEnvironmentVariable`, then `$env:JAVA_HOME`, `$env:ANDROID_HOME` | `C:\Program Files\Android\Android Studio\jbr` and `%LocalAppData%\Android\Sdk`. These two Windows values are now confirmed on his computer |
| Java | `java -version` in `JAVA_HOME` | OpenJDK 25.0.4 |
| Other tools | `node -v`, `npm -v`, `rustc -V`, `npm ls @tauri-apps/cli` | Node 24.22.0, npm 11.19.1, rustc 1.99.1, Tauri CLI 2.12.3 |

**Watch in M1 (not verified):** Java 25 is very new. Whether the Gradle version that Tauri generates accepts it is unknown; if the build fails on the Java version, the likely fix is a different JDK for Gradle. The app identifier contains hyphens (`io.github.andra-gs...`), and Android package names do not allow them; how Tauri handles this is also unknown.

**M1, spike, first attempt (2026-11-01 to 2026-11-02): not finished, cancelled by the developer.**

| Step | Command | Result |
|---|---|---|
| Create the Android project | `npm run tauri android init` | Passed. Created `src-tauri/gen/`. The app identifier became `io.github.andra_gs.avenqor` (hyphen turned into underscore, so the hyphen concern did not happen). The generated `.gitignore` already excludes local files (`local.properties`, `build`, `.gradle`, keystores). |
| Run on the phone | `npm run tauri android dev` (phone: Infinix X669C, target `aarch64-linux-android`) | Rust compile **passed** (`Finished dev profile` in 46m 35s; Cargo also added 42 packages to `Cargo.lock`, including the notification plugin and its dependencies). Gradle 9.6.1 and Android SDK Platform 36 were downloaded. With Java 25 Gradle did start, so the Java version was not the blocker. Many deprecation warnings from the Android Gradle plugin 9 (tauri plugins and the generated project). The Kotlin compiler daemon failed ("Daemon compilation failed: null") and fell back to compiling without the daemon, which is slow. After about 59 minutes the build was at 44% and still moving (`mergeExtDexArm64Debug`, `tauri-plugin-fs`). The developer cancelled it, so **no result on the phone yet**: whether the app opens, and whether the database, dialog, fs, and notification plugins work on Android, is still unknown. |
| Clean up | `git restore package-lock.json src-tauri/Cargo.lock` | `git status --short` showed only `?? src-tauri/gen/` |

Next: repeat `android dev`, saving the full output to a file (`npm run tauri android dev 2>&1 | Tee-Object -FilePath android-dev.log`).

**M1, second attempt (2026-11-02): the app installs and opens on the phone, but the screen stays white in dev mode.**

- `npm run tauri android dev` built and installed the app (`Streamed Install: Success`, `MainActivity` started) on an Infinix X669C. Android System WebView 155 loaded. So the Rust and Android side works.
- Opening `http://192.168.1.3:1420` in Chrome on the same phone works (the page took about 50 seconds to load: 176 requests, 6.9 MB). This shows the network and the Vite server are fine.
- Inspecting the WebView (`chrome://inspect/#devices`, group "WebView in io.github.andra_gs.avenqor", page `http://tauri.localhost/`): several script requests fail after about 30 seconds with `net::ERR_CONNECTION_REFUSED` or status 500. `react-dom/client` and `react-router` failed in both runs; others differed between runs (`useTaskLabels.ts`, `@tauri-apps/plugin-notification`, `@tauri-apps/api/window`, `projectService.ts`, `database.ts`). Without `react-dom/client`, React cannot draw, which explains the white screen. The logcat line `custom protocol timed out: timed out waiting on channel` matches the 30 seconds.
- The developer's terminal printed nothing about these failures. The real cause is **not known**. Working guess (unverified): in dev mode the app fetches about 170 separate files through Tauri's internal proxy, and on this phone some, mostly the large ones, time out.
- A page reload did not change the result.
- Separate finding: in a normal browser the window buttons (close, maximize) still appear and fail with `Cannot read properties of undefined (reading 'metadata')`. This is expected, because there is no Tauri window there, and it is part of M2 (desktop-only code).

Next: build a package with the page bundled inside (no dev server): `npm run tauri android build -- --debug --apk --target aarch64` (options not yet verified for CLI 2.12.3), then install it with `adb`.

**M1, third attempt (2026-11-02): passed. The app runs on the phone.**

- Command: `npm run tauri android build -- --debug --apk --target aarch64` (the options were accepted by CLI 2.12.3). Result: one APK, `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`. It was installed on the phone with `adb install -r`.
- With the page bundled inside the package (no dev server), the app opens and shows the Dashboard. So the white screen was a dev-mode problem, not an app problem.
- **Database check (developer, on the phone):** created one workspace ("Test"), closed the app, opened it again: the workspace was still there. So the SQL plugin, the six migrations, and persistence work on Android (at least for this basic case).
- Not tested yet on the phone: the dialog and fs plugins (backup export and import), notifications, task and project screens, drag and drop.
- The phone screen is 720 x 1612 pixels in portrait. In **landscape the app looks normal**, so the problems below depend on the screen width: the layout assumes a desktop-sized window (minimum 960 x 600) and is squeezed into a narrow screen.

**What the developer saw (portrait) and wants changed** (the list is Agreed as the developer's requests; the way to fix each is Proposed):

| # | Observation | Wanted on mobile |
|---|---|---|
| 1 | The custom title bar (window title and buttons) appears | Not needed; hide it on mobile |
| 2 | The search box does not shrink, so it pushes the profile out of the screen | The top bar must fit the width |
| 3 | A closed sidebar still takes space (a narrow strip stays) | Hide it completely; keep the button that opens it |
| 4 | On every page the content can be zoomed out, as if the page is wider than the screen | The page must fit the screen width (no sideways overflow) |
| 5 | The "New Project" button on the Dashboard | Remove it on mobile |
| 6 | Many cards do not adapt to the screen width | Cards must resize to the screen |

These are the work of steps M2 (desktop-only code) and M3 (mobile layout). Items 2, 4, and 6 are probably caused by minimum widths in the layout; this is a guess until the layout code is read.

**M2, desktop-only code (written 2026-11-02, branch `mobile-m2`; NOT yet tested).**

- `src/lib/platform.ts` (new): `IS_ANDROID` (the web view's user agent contains "Android") and `HAS_DESKTOP_WINDOW`. Whether the Android web view really says "Android" is not verified until it runs on the phone.
- `src/components/layout/AppShell.tsx`: the title bar is drawn only when `HAS_DESKTOP_WINDOW` is true. Because the title bar is not drawn on a phone, the window API (`src/lib/windowControls.ts`) is not called there.
- `src-tauri/capabilities/`: the four window permissions moved from `default.json` to the new `desktop.json`, limited to Windows, macOS, and Linux. `default.json` keeps the rest (database, backup files, notifications).
- Not changed yet: the window settings in `tauri.conf.json` (`decorations`, `minWidth`, `dragDropEnabled`). What they do on Android is still to verify.
- Tests (reported by the developer, 2026-11-03): the desktop app still shows the title bar as before; on the phone the title bar is gone. **M2 passed.**

**M3, mobile layout, first part (written 2026-11-03, branch `mobile-m3`; NOT yet tested).** Design choice (Agreed by the developer, 2026-11-03): **bottom navigation** (option A), not a slide-in menu. The layout switches by screen **width**: below 768 px (Tailwind `md`) the phone layout is used, from 768 px up the desktop layout, which is unchanged (the desktop window minimum is 960 px). A phone held sideways is about 800 px wide, so it gets the desktop layout, as the developer saw before.

| # | Observation (from M1) | What was changed (Proposed fix, to verify on the phone) |
|---|---|---|
| 2 | Search box pushes the profile out | On a phone the top bar has two rows: title and avatar on top, the search box full width below. The profile name is hidden (avatar only). The result list is as wide as the box. `SearchBox.tsx`, `TopBar.tsx` |
| 3 | Closed sidebar still takes space | The sidebar is not shown on a phone (`Sidebar.tsx`). The new `BottomNav.tsx` replaces it: Dashboard, My Tasks, Calendar, Documents, and **Menu**. The new Menu page (`src/pages/MenuPage.tsx`, route `/menu`) lists the workspaces, Settings, and Help. Because the sidebar is gone, there is no "open" button to keep |
| 4 | Pages wider than the screen (zoom out) | Fixed column counts were the likely cause (`grid-cols-3`, `grid-cols-4`, `grid-cols-2` in Dashboard, Workspace, and Recent Projects) together with the 288 px search box and its 448 px result list. They are now one or two columns on a phone. Not yet checked: the Calendar month grid, Documents, Task page, Board, Settings |
| 5 | "New Project" on the Dashboard | Hidden on a phone (`DashboardPage.tsx`) |
| 6 | Cards do not fit | Same changes as row 4, plus smaller page padding on a phone (`AppShell.tsx`) |

Also: `index.html` has `viewport-fit=cover`; the top bar and bottom bar use `env(safe-area-inset-*)` so they stay clear of the phone's status bar and navigation bar. In the M1 photo the status bar covered the title; **whether `env(safe-area-inset-*)` works in this Android web view is not verified.** The search box no longer shows "Ctrl+K" on Android (`HAS_KEYBOARD_SHORTCUTS` in `src/lib/platform.ts`). A new token `--layout-bottomnav-height` is in `tokens.css`.

Tests still to run: (1) desktop: `npm run build`, then `npm run tauri dev`: every screen looks exactly as in 1.0 (title bar, sidebar, top bar, Dashboard with the New Project button, Workspace page); (2) phone: build, install, check the six observations.

**M3, first part: results (developer, 2026-11-03, phone) and the second part (written 2026-11-03, NOT yet tested).**

Results of the first part: title bar gone, search box fits, no sidebar and the bottom navigation works, pages cannot be zoomed out sideways, no "New Project" button, cards fit, the title is not covered by the status bar (so `env(safe-area-inset-top)` works in this web view). Problems found, and the changes written for them:

| Problem | Change (Proposed fix, to verify) |
|---|---|
| Bottom navigation icons sit too high and the labels are hidden behind the phone's own navigation bar | The bar had a fixed height and its bottom padding (the phone's navigation bar height) was taken out of that height. Now the fixed-height row sits inside a box that carries the padding (`BottomNav.tsx`) |
| The page can be zoomed in | `maximum-scale=1.0, user-scalable=no` in `index.html`. Trade-off: people who need to enlarge the page cannot. The developer asked for it |
| Task rows: the title is not visible (deadline, priority, status, and the action button take the whole row; the action button also sticks out of the card) | `ListRow` has a new option `stackOnPhone`: below 768 px the badges go under the title and may wrap. Used in the project task list and the My Tasks list. From 768 px up nothing changes |
| Edit buttons should be a pencil icon | `Button` has a new option `iconOnlyOnPhone`: on a phone only the pencil is shown (the text stays as the accessible name and tooltip). Used for Edit Workspace, Edit project, Edit task, and Edit document. **Desktop keeps the text.** Applying the pencil on desktop too is a design decision for the developer. The three-dots menu of each task row (Edit, Mark done, Delete) is unchanged |

Still open: the phone's navigation bar should hide when idle (immersive mode). This needs a change in the generated Android file `MainActivity.kt` under `src-tauri/gen/android/`, which is not in Git yet and which Claude has not seen. Next: the developer shows that file, and decides whether `src-tauri/gen/` is committed (the generated `.gitignore` already leaves out local files). Pages not yet seen on the phone: Documents, Board, Task details, Settings, Menu.

**M3, third part (written 2026-11-03, NOT yet tested): the developer's second round of findings (2026-11-03).**

Result: the first fixes worked for most items; the desktop app has no problem. New findings and the changes written for them:

| Problem | Change (Proposed fix, to verify) |
|---|---|
| Task rows: when deadline, priority, and status are long, the action button (three dots) wraps to the next line, and its menu opens empty | Likely cause (not proven): the menu opens to the left of its button, so a button that wraps to the left edge opens the menu off the screen. Now the button stays at the right end of the title line and the badges go under it (`ListRow` option `actions`, used in `TaskList.tsx`). On desktop the gap between the badges and the button grew by 4 px |
| Edit and create windows, and the confirmation window, are too large | `Dialog.tsx`: on a phone smaller padding, a width of the screen minus 1.5 rem, and a maximum height of the screen with scrolling. From 768 px up the same as before (the height limit and scrolling are new there too). Not verified what exactly was too large; a photo of one window would settle it |
| The phone's navigation bar should hide when idle | `MainActivity.kt` (generated Android file) changed so the navigation bar is hidden and appears again on a swipe from the edge. `src-tauri/gen/` is added to Git (Agreed by the developer, 2026-11-03), so this change is tracked |

**M3, results of the third part (developer, 2026-11-03, phone): passed, with one bug found by Claude in the photos.**

- Passed: the phone's navigation bar hides when idle (`MainActivity.kt`, tracked in Git together with `src-tauri/gen/`); the bottom navigation sits at the bottom with its labels visible; the task rows and their menu work; the edit and create windows and the confirmation window fit the screen.
- Photos seen: Task Details, Settings, Documents, and Menu fit the screen and look usable. Not yet seen: Board, the rest of Settings (Data and reminders), the Workspace and Project pages, the Calendar with the new bottom bar.
- **Bug (Claude's mistake, fixed in the next commit, not yet re-tested):** the Menu page showed the title "Page not found". The Menu entry had been added to the list used by the desktop title bar but not to the list used by the top bar (`getPageHeading` in `src/app/navigation.ts`).
- Small wording left for later: on the phone some texts still say "this computer" ("Stored on this computer only") and name the "Edit task" button, which is only a pencil there.

**M3, Board page (photo seen 2026-11-03; fix written, NOT yet tested).** The Board works on the phone: the columns scroll sideways (the next column peeks in), each card has its arrow buttons to move it, and the tasks are readable. Problem: the project name wrapped onto two lines because the "Project overview" and "New Task" buttons took the space. Change: on a phone the title has its own line and the two buttons sit under it (`BoardPage.tsx`); from 768 px up the same as before. Dragging a card by touch was not tried. The photos sent for this round showed the Menu title as "Page not found" again, so they were probably taken before the fixed build was installed; the fix still needs a re-test.

**M4, data features on the phone (developer, 2026-11-03): passed, as reported.** The developer tested on the phone, with the debug APK, and reported that backup export works, backup import works, the reminders work, and search works. The report gives no further detail (for example where the exported file is saved, whether a notification permission question appeared, or whether a full restore that replaces data was run), so those points are not recorded as verified. The earlier worry (Android file addresses and the file permissions written for Windows) did not cause a visible problem in these tests.

Also confirmed by the developer on 2026-11-03: the Menu page shows its title "Menu". Still to re-test: the Board header fix (commit b2c281d); a touch drag of board cards; the Workspace, Project, and Calendar pages and the lower part of Settings on the phone.

**M5, signed release package (written 2026-11-03, branch `mobile-m5`; NOT yet tested).**

Source: <https://v2.tauri.app/distribute/sign/android/> (read 2026-11-03). The page gives the `keytool` command, the file `src-tauri/gen/android/keystore.properties` (keys `password`, `keyAlias`, `storeFile`), and a `signingConfigs` block for `app/build.gradle.kts`. It says to keep the key store and `keystore.properties` private and out of public source control. The page does not give the APK build command.

- **What the signing key means (important):** Android only installs an update over an installed app when both are signed with the **same key**. Whoever holds this key decides who can update Avenqor. If the key is lost, nobody can update an installed copy; they must uninstall (and lose the local data unless they made a backup) and install a new app. So the key file and its password must be backed up in at least two places and must never be committed.
- **Change in `src-tauri/gen/android/app/build.gradle.kts`:** the signing configuration from the Tauri page, with one difference: it is only created when `keystore.properties` exists. The page's version would stop every build, debug included, on a computer without the file. Without the file a release build is not signed (and cannot be installed). Whether this works with the Android Gradle plugin version used here (9.x, with the older settings Tauri writes) is not verified.
- **Where the key lives (Proposed):** the `.jks` file outside the repository (for example `D:\Avenqor-keys\avenqor-release.jks`), plus `src-tauri/gen/android/keystore.properties` (already ignored by Git) with the password. In `storeFile` use forward slashes (`D:/Avenqor-keys/...`), because a backslash is an escape character in properties files.
- **Build command (Proposed, not verified):** `npm run tauri android build -- --apk --target aarch64` (release is the default; the earlier command had `--debug`). Tauri prints the path of the APK.
- **Decisions (Agreed by the developer, 2026-11-03):** the release APK supports `aarch64` only; the mobile app uses the **same version number as the desktop app** (one version in `tauri.conf.json` serves both, so the next release, for example 1.1.0, applies to both).

**M5, first release build (developer, 2026-11-03): the build works, the package is NOT signed.** Command: `npm run tauri android build -- --apk --target aarch64`. The output (from the developer's log): the TypeScript check (`tsc`) and the production build of the page passed (190 modules); the Rust part for Android took 19 minutes the first time; Gradle finished with `app-universal-release-unsigned.apk` at `src-tauri/gen/android/app/build/outputs/apk/universal/release/`. The word "unsigned" in the file name means the signing configuration was **not** applied, so this file cannot be installed on a phone. Possible causes, not yet told apart: `keystore.properties` was not created or is in the wrong folder, the build ran on another branch, or the Gradle setting is not picked up by this Gradle plugin version. To check next: the branch, the two files, and whether `build.gradle.kts` contains the signing lines. Fallback if the Gradle setting is the problem: sign the finished APK with the `apksigner` tool of the Android SDK.
