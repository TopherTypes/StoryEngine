/**
 * Session management for player app
 * Handles login validation, session initialization, and resumption
 */

import type { Story, PlayerGameState } from '../../types'
import { createDefaultPlayerState } from '../utils/playerDefaults'
import {
  createSession,
  getActiveSession,
  loadPlayerProgress,
  savePlayerProgress,
  deletePlayerProgress,
} from './playerDB'

/**
 * Validate login credentials against story config
 */
export function validateCredentials(
  username: string,
  password: string,
  story: Story
): boolean {
  if (!story.login.requireCredentials) {
    return true
  }

  // Case-insensitive username, case-sensitive password
  return (
    username.toLowerCase() === story.login.username.toLowerCase() &&
    password === story.login.password
  )
}

/**
 * Initialize a new player session
 */
export async function initializeSession(
  story: Story
): Promise<{ session: any; playerState: PlayerGameState }> {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const session = await createSession(story.id, playerId)

  const playerState = createDefaultPlayerState(story.id, playerId, session.startTime)

  await savePlayerProgress(playerState)

  return { session, playerState }
}

/**
 * Attempt to resume an existing session
 */
export async function resumeSession(
  story: Story
): Promise<{ playerState: PlayerGameState; isResumed: boolean } | null> {
  const session = await getActiveSession(story.id)
  if (!session) {
    return null
  }

  const playerState = await loadPlayerProgress(story.id)
  if (!playerState) {
    return null
  }

  // Recalculate elapsed time based on when session started
  const elapsedMinutes = Math.floor((Date.now() - session.startTime) / 60000)

  // Update the player state with fresh elapsed time
  const resumedState: PlayerGameState = {
    ...playerState,
    startTime: session.startTime,
    totalElapsedMinutes: elapsedMinutes,
    lastPlayedAt: Date.now(),
  }

  return { playerState: resumedState, isResumed: true }
}

/**
 * Clear session and progress
 */
export async function clearSession(storyId: string): Promise<void> {
  await deletePlayerProgress(storyId)
}
