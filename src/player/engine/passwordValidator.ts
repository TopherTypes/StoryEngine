/**
 * Password Validator
 * Handles password validation and unlock tracking
 */

/**
 * Validate a password attempt against the correct password
 */
export function validatePassword(attempt: string, correctPassword: string): boolean {
  return attempt === correctPassword
}

/**
 * Generate a password key for tracking unlocks
 */
export function getPasswordKey(artefactId: string): string {
  return `${artefactId}_password`
}

/**
 * Check if a specific artefact password has been unlocked
 */
export function isPasswordUnlocked(
  artefactId: string,
  unlockedPasswords: Map<string, string>
): boolean {
  return unlockedPasswords.has(getPasswordKey(artefactId))
}

/**
 * Record a successful password unlock
 */
export function recordPasswordUnlock(
  artefactId: string,
  password: string
): { key: string; password: string } {
  return {
    key: getPasswordKey(artefactId),
    password,
  }
}
