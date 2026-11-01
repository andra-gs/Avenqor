import { DEFAULT_PROFILE_NAME } from "../lib/appInfo";
import { ValidationError } from "../lib/errors";
import { getInitials, hasVisibleText } from "../lib/text";
import { ensureLocalProfile, getProfile, updateDisplayName } from "../repositories/profileRepository";
import type { LocalProfile } from "../types/profile";

export const PROFILE_NAME_MAX_LENGTH = 40;

// The id of the local profile. The profile is created on first use.
export function getLocalProfileId(): Promise<string> {
  return ensureLocalProfile(crypto.randomUUID(), DEFAULT_PROFILE_NAME, new Date().toISOString());
}

export async function getLocalProfile(): Promise<LocalProfile> {
  const profile = await getProfile(await getLocalProfileId());
  if (!profile) throw new Error("The local profile could not be read.");
  return { displayName: profile.displayName, initials: getInitials(profile.displayName, 2) };
}

export async function renameLocalProfile(nameInput: string): Promise<void> {
  const name = nameInput.trim();
  if (!hasVisibleText(name)) throw new ValidationError("Enter a display name.");
  if (name.length > PROFILE_NAME_MAX_LENGTH) {
    throw new ValidationError(`The name can have at most ${PROFILE_NAME_MAX_LENGTH} characters.`);
  }
  const changed = await updateDisplayName(await getLocalProfileId(), name);
  if (!changed) throw new ValidationError("The local profile no longer exists.");
}
