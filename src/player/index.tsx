/**
 * Player App main entry point
 * Manages login vs. desktop state
 */

import { useState, useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { LoginPage } from './pages/LoginPage'
import { DesktopPage } from './pages/DesktopPage'
import type { Story } from '../types'

interface PlayerAppProps {
  story: Story
}

export function PlayerApp({ story }: PlayerAppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const playerState = usePlayerStore((state) => state.playerState)

  // Check if there's already a logged-in state
  useEffect(() => {
    if (playerState) {
      setIsLoggedIn(true)
    }
  }, [playerState])

  if (!isLoggedIn) {
    return <LoginPage story={story} onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  return <DesktopPage story={story} />
}
