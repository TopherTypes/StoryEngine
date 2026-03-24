/**
 * Hook for accessing progression engine
 * Provides unified interface to rule evaluation and unlocking logic
 */

import { useMemo } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import type { Story } from '../../types'
import {
  getUnlockedArtefactsForPlayer,
  isArtefactUnlockedForPlayer,
  getLockedReasonForPlayer,
  getElapsedMinutesForPlayer,
  canViewArtefact,
  isEndingTriggered,
  getArtefactsByType,
} from '../engine/playerProgressionEngine'

export function useProgressionEngine(story: Story) {
  const playerState = usePlayerStore((state) => state.playerState)

  // Get unlocked artefacts - memoized for performance
  const unlockedArtefacts = useMemo(() => {
    if (!playerState) return []
    return getUnlockedArtefactsForPlayer(story, playerState)
  }, [story, playerState])

  // Get elapsed minutes
  const elapsedMinutes = useMemo(() => {
    if (!playerState) return 0
    return getElapsedMinutesForPlayer(playerState)
  }, [playerState])

  // Check if ending is triggered
  const endingTriggered = useMemo(() => {
    if (!playerState) return false
    return isEndingTriggered(story, playerState)
  }, [story, playerState])

  // Helper functions
  const isArtefactUnlocked = (artefactId: string) => {
    if (!playerState) return false
    const artefact = story.artefacts.find((a) => a.id === artefactId)
    if (!artefact) return false
    return isArtefactUnlockedForPlayer(artefact, playerState)
  }

  const getLockedReason = (artefactId: string) => {
    if (!playerState) return null
    const artefact = story.artefacts.find((a) => a.id === artefactId)
    if (!artefact) return null
    return getLockedReasonForPlayer(artefact, playerState)
  }

  const canView = (artefactId: string) => {
    if (!playerState) return false
    const artefact = story.artefacts.find((a) => a.id === artefactId)
    if (!artefact) return false
    return canViewArtefact(artefact, playerState)
  }

  const getByType = (type: string) => {
    if (!playerState) return []
    return getArtefactsByType(story, playerState, type)
  }

  return {
    unlockedArtefacts,
    elapsedMinutes,
    endingTriggered,
    isArtefactUnlocked,
    getLockedReason,
    canView,
    getByType,
  }
}
