/**
 * Ending Evaluator
 * Checks if story ending conditions have been met
 */

import { evaluateRule } from '../../utils/releaseEngine'
import type { GameState } from '../../utils/releaseEngine'
import type { Story, PlayerGameState } from '../../types'

/**
 * Convert PlayerGameState to GameState
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
 * Check if all ending trigger conditions are met
 */
export function checkEndingConditions(
  story: Story,
  playerState: PlayerGameState
): boolean {
  if (!story.ending || !story.ending.triggerConditions || story.ending.triggerConditions.length === 0) {
    return false
  }

  const gameState = playerStateToGameState(playerState)

  // All trigger conditions must be met (AND logic)
  return story.ending.triggerConditions.every((rule) => evaluateRule(rule, gameState))
}

/**
 * Get ending variant if there are multiple
 */
export function getEndingVariant(story: Story, playerState: PlayerGameState) {
  if (!story.ending?.variants || story.ending.variants.length === 0) {
    return null
  }

  const gameState = playerStateToGameState(playerState)

  // Find first variant whose conditions are met
  for (const variant of story.ending.variants) {
    const conditionsMet = variant.triggerConditions.every((rule) => evaluateRule(rule, gameState))
    if (conditionsMet) {
      return variant
    }
  }

  return null
}
