/**
 * Hook for auto-saving player state to IndexedDB
 * Debounces saves to avoid excessive writes
 */

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { savePlayerProgress } from '../storage/playerDB'

const SAVE_DEBOUNCE_MS = 5000 // Save every 5 seconds max

export function useAutoSaveProgress() {
  const playerState = usePlayerStore((state) => state.playerState)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!playerState) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await savePlayerProgress(playerState)
      } catch (err) {
        console.error('Failed to save player progress:', err)
      }
    }, SAVE_DEBOUNCE_MS)

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [playerState])
}
