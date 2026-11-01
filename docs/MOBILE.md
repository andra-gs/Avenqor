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
| M2 | Separate desktop-only code: title bar, window permissions, window settings | Desktop still works exactly as before (the 1.0 behavior is the reference) |
| M3 | Mobile layout: navigation, one-column pages, touch sizes | The main screens are usable on the phone |
| M4 | Data features on the phone: backup export and import, reminders, search | Each one works with real data |
| M5 | A signed Android package (APK) that can be installed without the USB cable | Installed and tested on the phone |
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
