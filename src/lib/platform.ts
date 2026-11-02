// Which kind of device the app runs on. Used only to decide WHAT is shown (for example, the custom window
// title bar exists on desktop only). How wide the layout is depends on the screen width, not on this file.

// The Android web view always names "Android" in its user agent text. Other platforms (Windows now, iOS later)
// need their own check when that work begins.
export const IS_ANDROID = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

// Desktop-only parts (window title bar and window buttons) are shown when this is true.
export const HAS_DESKTOP_WINDOW = !IS_ANDROID;
