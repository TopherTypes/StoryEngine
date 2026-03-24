/**
 * Hook for accessing player store
 */

import { usePlayerStore } from '../stores/playerStore'

export function usePlayerState() {
  return usePlayerStore()
}
