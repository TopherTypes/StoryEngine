/**
 * Hook for tracking elapsed time during player session
 */

import { useEffect, useState } from 'react'
import { usePlayerStore } from '../stores/playerStore'

export function useSessionTime(): number {
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0)
  const playerState = usePlayerStore((state) => state.playerState)

  useEffect(() => {
    if (!playerState) return

    // Calculate initial elapsed time
    const updateElapsed = () => {
      const now = Date.now()
      const startTime = playerState.startTime
      const elapsed = Math.floor((now - startTime) / 60000)
      setElapsedMinutes(elapsed)
    }

    updateElapsed()

    // Update every minute
    const interval = setInterval(updateElapsed, 60000)

    return () => clearInterval(interval)
  }, [playerState])

  return elapsedMinutes
}

/**
 * Hook for getting current session time (for debugging/display)
 */
export function useCurrentSessionTime(): string {
  const [sessionTime, setSessionTime] = useState<string>('')
  const playerState = usePlayerStore((state) => state.playerState)

  useEffect(() => {
    if (!playerState) return

    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setSessionTime(`${hours}:${minutes}`)
    }

    updateTime()

    // Update every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [playerState])

  return sessionTime
}
