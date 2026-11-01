import { getCurrentWindow } from "@tauri-apps/api/window";

// The one place that talks to the application window (minimize, maximize, close). The title bar uses it.
// Each action needs its own permission in src-tauri/capabilities/default.json.

export function minimizeWindow(): Promise<void> {
  return getCurrentWindow().minimize();
}

export function toggleMaximizeWindow(): Promise<void> {
  return getCurrentWindow().toggleMaximize();
}

export function closeWindow(): Promise<void> {
  return getCurrentWindow().close();
}

// Calls `onChange` now and whenever the window is resized, with whether it is maximized.
// Returns a function that stops the watching.
export async function watchMaximized(onChange: (maximized: boolean) => void): Promise<() => void> {
  const appWindow = getCurrentWindow();
  onChange(await appWindow.isMaximized());
  return appWindow.onResized(async () => onChange(await appWindow.isMaximized()));
}
