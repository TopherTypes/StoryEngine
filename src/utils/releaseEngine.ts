/**
 * Release Rule Evaluation Engine
 * Shared logic for determining what's available when
 * Can be used by both authoring tool (preview) and player app
 */

import type { ReleaseRule, Story, Artefact } from '../types'

export interface GameState {
  elapsedMinutes: number
  openedArtefactIds: Set<string>
  readArtefactIds: Set<string>
  unlockedPasswordKeys: Set<string>
  openedApps: Set<string>
  openedFolders: Set<string>
}

export function createDefaultGameState(): GameState {
  return {
    elapsedMinutes: 0,
    openedArtefactIds: new Set(),
    readArtefactIds: new Set(),
    unlockedPasswordKeys: new Set(),
    openedApps: new Set(),
    openedFolders: new Set(),
  }
}

/**
 * Evaluate a single release rule
 */
export function evaluateRule(rule: ReleaseRule, state: GameState): boolean {
  if (rule.type === 'time') {
    return state.elapsedMinutes >= rule.minutes
  }

  if (rule.type === 'artefact_opened') {
    return state.openedArtefactIds.has(rule.artefactId)
  }

  if (rule.type === 'artefact_read') {
    return state.readArtefactIds.has(rule.artefactId)
  }

  if (rule.type === 'password') {
    return state.unlockedPasswordKeys.has(rule.passwordKey)
  }

  if (rule.type === 'app_opened') {
    return state.openedApps.has(rule.appName)
  }

  if (rule.type === 'folder_opened') {
    return state.openedFolders.has(rule.appName)
  }

  if (rule.type === 'condition_group') {
    const results = rule.rules.map((r) => evaluateRule(r, state))
    if (rule.operator === 'AND') {
      return results.every((r) => r === true)
    } else {
      return results.some((r) => r === true)
    }
  }

  return false
}

/**
 * Check if an artefact is accessible to the player
 */
export function isArtefactUnlocked(artefact: Artefact, state: GameState): boolean {
  // Check release time
  if (artefact.releaseAtTime !== undefined && state.elapsedMinutes < artefact.releaseAtTime) {
    return false
  }

  // Check release triggers (conditions)
  if (artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
    const allConditionsMet = artefact.releaseTriggers.every((rule) => evaluateRule(rule, state))
    if (!allConditionsMet) {
      return false
    }
  }

  return true
}

/**
 * Get all unlocked artefacts in story at current game state
 */
export function getUnlockedArtefacts(story: Story, state: GameState): Artefact[] {
  return story.artefacts.filter((a) => isArtefactUnlocked(a, state))
}

/**
 * Get reason why an artefact is locked (for UI display)
 */
export function getLockedReason(artefact: Artefact, state: GameState): string | null {
  if (artefact.releaseAtTime !== undefined && state.elapsedMinutes < artefact.releaseAtTime) {
    const diff = artefact.releaseAtTime - state.elapsedMinutes
    return `Releases in ${diff} minute${diff !== 1 ? 's' : ''}`
  }

  if (artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
    const unmetConditions = artefact.releaseTriggers.filter((rule) => !evaluateRule(rule, state))
    if (unmetConditions.length > 0) {
      return `${unmetConditions.length} condition${unmetConditions.length !== 1 ? 's' : ''} not met`
    }
  }

  return null
}
