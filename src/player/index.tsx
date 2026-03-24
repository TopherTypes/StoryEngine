/**
 * Player App main entry point
 * Manages login vs. desktop state and persistence
 */

import { useState, useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useAutoSaveProgress } from './hooks/useAutoSaveProgress'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoginPage } from './pages/LoginPage'
import { DesktopPage } from './pages/DesktopPage'
import { resumeSession } from './storage/sessionManager'
import type { Story } from '../types'

interface PlayerAppProps {
  story: Story
}

export function PlayerApp({ story }: PlayerAppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const playerState = usePlayerStore((state) => state.playerState)
  const loadStory = usePlayerStore((state) => state.loadStory)

  // Auto-save progress
  useAutoSaveProgress()

  // Check if there's an existing session to resume
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const resume = await resumeSession(story)
        if (resume) {
          loadStory(story, resume.playerState)
          setIsLoggedIn(true)
        }
      } catch (err) {
        console.error('Failed to check for existing session:', err)
      } finally {
        setIsChecking(false)
      }
    }

    checkExistingSession()
  }, [story, loadStory])

  // If currently logged in via playerState
  useEffect(() => {
    if (playerState) {
      setIsLoggedIn(true)
    }
  }, [playerState])

  const content = (() => {
    if (isChecking) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            backgroundColor: story.theme.backgroundColor || '#1a1a1a',
          }}
        >
          <p style={{ color: story.theme.textColor || '#ffffff' }}>
            Loading...
          </p>
        </div>
      )
    }

    if (!isLoggedIn) {
      return <LoginPage story={story} onLoginSuccess={() => setIsLoggedIn(true)} />
    }

    return <DesktopPage story={story} />
  })()

  return <ErrorBoundary story={story}>{content}</ErrorBoundary>
}
