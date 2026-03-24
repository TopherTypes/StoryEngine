/**
 * Default values for player state initialization
 */

import type { PlayerGameState } from '../../types'

export function createDefaultPlayerState(
  storyId: string,
  playerId: string,
  startTime: number
): PlayerGameState {
  return {
    storyId,
    playerId,
    startTime,
    currentSessionTime: Date.now(),
    totalElapsedMinutes: 0,
    paused: false,

    unlockedArtefactIds: new Set(),
    openedArtefactIds: new Set(),
    readArtefactIds: new Set(),
    viewedImages: new Set(),
    playedAudio: new Set(),

    visitedApps: new Set(),
    visitedFolders: new Set(),
    currentLocation: '/',

    unlockedPasswords: new Map(),

    endingTriggered: false,

    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    totalPlayTime: 0,
    completionPercentage: 0,
  }
}
