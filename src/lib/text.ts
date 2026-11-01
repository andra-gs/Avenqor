// Adds an "s" to a word when the count is not 1. Enough for the English words used in the interface.
export function pluralize(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

// Two-letter (or one-letter) initials for avatars.
export function getInitials(name: string, length = 1): string {
  return name.trim().slice(0, length).toUpperCase();
}

// True when the text has at least one character a person can see. Plain trim() does not remove
// zero-width characters, so a title made only of them would look empty on screen but pass a length check.
export function hasVisibleText(text: string): boolean {
  return /[^\s\u200B-\u200D\u2060\uFEFF]/.test(text);
}
