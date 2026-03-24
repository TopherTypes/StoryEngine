/**
 * Player Progression Engine
 * Adapter layer between PlayerGameState and releaseEngine
 * Handles unlocking and progression logic
 */

import { evaluateRule, isArtefactUnlocked, getUnlockedArtefacts, getLockedReason } from '../../utils/releaseEngine'
import type { GameState } from '../../utils/releaseEngine'
import type { Story, Artefact, PlayerGameState } from '../../types'

/**
 * Convert PlayerGameState to GameState for release engine
 */
function playerStateToGameState(playerState: PlayerGameState): GameState {
  const elapsedMinutes = Math.floor((Date.now() - playerState.startTime) / 60000)

  return {
    elapsedMinutes,
    openedArtefactIds: playerState.openedArtefactIds,
    readArtefactIds: playerState.readArtefactIds,
    unlockedPasswordKeys: new Set(playerState.unlockedPasswords.keys()),
    openedApps: playerState.visitedApps,
    openedFolders: playerState.visitedFolders,
  }
}

/**
 * Get all unlocked artefacts for player at current state
 */
export function getUnlockedArtefactsForPlayer(
  story: Story,
  playerState: PlayerGameState
): Artefact[] {
  const gameState = playerStateToGameState(playerState)
  return getUnlockedArtefacts(story, gameState)
}

/**
 * Check if a specific artefact is unlocked
 */
export function isArtefactUnlockedForPlayer(
  artefact: Artefact,
  playerState: PlayerGameState
): boolean {
  const gameState = playerStateToGameState(playerState)
  return isArtefactUnlocked(artefact, gameState)
}

/**
 * Get locked reason for display
 */
export function getLockedReasonForPlayer(
  artefact: Artefact,
  playerState: PlayerGameState
): string | null {
  const gameState = playerStateToGameState(playerState)
  return getLockedReason(artefact, gameState)
}

/**
 * Get elapsed minutes for player
 */
export function getElapsedMinutesForPlayer(playerState: PlayerGameState): number {
  return Math.floor((Date.now() - playerState.startTime) / 60000)
}

/**
 * Check if player can view an artefact (including password consideration)
 */
export function canViewArtefact(
  artefact: Artefact,
  playerState: PlayerGameState
): boolean {
  // First check if time/conditions unlock it
  if (!isArtefactUnlockedForPlayer(artefact, playerState)) {
    return false
  }

  // Then check if it's password locked and not yet unlocked
  if (artefact.locked && artefact.lockPassword) {
    const passwordKey = `${artefact.id}_password`
    if (!playerState.unlockedPasswords.has(passwordKey)) {
      return false
    }
  }

  return true
}

/**
 * Check if ending conditions are met
 */
export function isEndingTriggered(
  story: Story,
  playerState: PlayerGameState
): boolean {
  if (!story.ending || !story.ending.triggerConditions) {
    return false
  }

  const gameState = playerStateToGameState(playerState)

  // All trigger conditions must be met (AND logic)
  return story.ending.triggerConditions.every((rule) => evaluateRule(rule, gameState))
}

/**
 * Get artefacts grouped by type for app display
 */
export function getArtefactsByType(
  story: Story,
  playerState: PlayerGameState,
  type: string
): Artefact[] {
  const unlockedArtefacts = getUnlockedArtefactsForPlayer(story, playerState)
  return unlockedArtefacts.filter((a) => a.type === type)
}
