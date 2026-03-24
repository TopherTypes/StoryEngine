/**
 * Desktop page - main container for the player experience
 * Will be enhanced in Phase 2 with actual shell components
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import type { Story } from '../../types'

interface DesktopPageProps {
  story: Story
}

export function DesktopPage({ story }: DesktopPageProps) {
  const playerState = usePlayerStore((state) => state.playerState)

  useEffect(() => {
    // Full screen if possible
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen might be blocked, that's okay
      })
    }
  }, [])

  if (!playerState) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{
        backgroundColor: story.theme.backgroundColor || '#1a1a1a',
      }}>
        <p style={{ color: story.theme.textColor || '#ffffff' }}>
          Initializing...
        </p>
      </div>
    )
  }

  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{
        backgroundColor: story.theme.backgroundColor || '#1a1a1a',
        color: story.theme.textColor || '#ffffff',
        fontFamily: story.theme.fontFamily || 'system-ui, -apple-system, sans-serif',
        fontSize: `${story.theme.fontSize.normal}px`,
      }}
    >
      {/* Placeholder for desktop shell - will be replaced in Phase 2 */}
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <p className="text-2xl mb-4">Desktop Shell Loading...</p>
          <p className="text-gray-400">Player state initialized</p>
        </div>
      </div>
    </div>
  )
}
