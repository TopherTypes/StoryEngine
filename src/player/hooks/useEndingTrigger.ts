/**
 * Hook for monitoring and triggering ending conditions
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { isEndingTriggered } from '../engine/playerProgressionEngine'
import type { Story } from '../../types'

export function useEndingTrigger(story: Story) {
  const playerState = usePlayerStore((state) => state.playerState)
  const triggerEnding = usePlayerStore((state) => state.triggerEnding)
  const endingTriggered = usePlayerStore((state) => state.playerState?.endingTriggered ?? false)

  useEffect(() => {
    // Don't check if already triggered
    if (endingTriggered || !playerState) return

    // Check if ending conditions are met
    const shouldTrigger = isEndingTriggered(story, playerState)

    if (shouldTrigger && !endingTriggered) {
      triggerEnding()
    }
  }, [story, playerState, endingTriggered, triggerEnding])

  return endingTriggered
}
