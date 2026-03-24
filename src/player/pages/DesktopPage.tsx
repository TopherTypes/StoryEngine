/**
 * Desktop page - main container for the player experience
 * Displays faux-desktop with windows, taskbar, and desktop icons
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { useUIStore } from '../stores/uiStore'
import { Desktop } from '../components/shell/Desktop'
import { Taskbar } from '../components/shell/Taskbar'
import { WindowManager } from '../components/shell/WindowManager'
import { PlaceholderApp } from '../components/apps/PlaceholderApp'
import type { Story } from '../../types'

interface DesktopPageProps {
  story: Story
}

export function DesktopPage({ story }: DesktopPageProps) {
  const playerState = usePlayerStore((state) => state.playerState)
  const closeApp = useUIStore((state) => state.closeApp)

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

  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'email':
      case 'im':
      case 'calendar':
      case 'files':
        return <PlaceholderApp appName={appId.toUpperCase()} />
      default:
        return <PlaceholderApp appName={appId} />
    }
  }

  const handleAppClose = (appId: string) => {
    closeApp(appId)
  }

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundColor: story.theme.backgroundColor || '#1a1a1a',
        color: story.theme.textColor || '#ffffff',
        fontFamily: story.theme.fontFamily || 'system-ui, -apple-system, sans-serif',
        fontSize: `${story.theme.fontSize.normal}px`,
      }}
    >
      {/* Desktop background and icons */}
      <Desktop story={story} />

      {/* Window manager renders open windows */}
      <WindowManager
        story={story}
        renderAppContent={renderAppContent}
        onAppClose={handleAppClose}
      />

      {/* Taskbar at bottom */}
      <Taskbar story={story} />
    </div>
  )
}
