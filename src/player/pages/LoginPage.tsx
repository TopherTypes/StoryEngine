/**
 * Login page for player app
 * Displays login form and handles credential validation
 */

import { useState } from 'react'
import type { Story } from '../../types'
import { validateCredentials, initializeSession, resumeSession } from '../storage/sessionManager'
import { usePlayerStore } from '../stores/playerStore'
import { useUIStore } from '../stores/uiStore'

interface LoginPageProps {
  story: Story
  onLoginSuccess: () => void
}

export function LoginPage({ story, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadStory = usePlayerStore((state) => state.loadStory)
  const resetUI = useUIStore((state) => state.resetUI)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate credentials
      if (!validateCredentials(username, password, story)) {
        setError('Invalid username or password')
        setIsLoading(false)
        return
      }

      // Try to resume existing session
      const resume = await resumeSession(story)

      if (resume) {
        // Resume existing session
        loadStory(story, resume.playerState)
      } else {
        // Initialize new session
        const { playerState } = await initializeSession(story)
        loadStory(story, playerState)
      }

      resetUI()
      onLoginSuccess()
    } catch (err) {
      setError('Failed to initialize game. Please try again.')
      console.error(err)
      setIsLoading(false)
    }
  }

  const handleSkipLogin = async () => {
    if (!story.login.requireCredentials) {
      setIsLoading(true)
      try {
        const resume = await resumeSession(story)
        if (resume) {
          loadStory(story, resume.playerState)
        } else {
          const { playerState } = await initializeSession(story)
          loadStory(story, playerState)
        }
        resetUI()
        onLoginSuccess()
      } catch (err) {
        setError('Failed to initialize game. Please try again.')
        console.error(err)
        setIsLoading(false)
      }
    }
  }

  const shouldShowForm = story.login.requireCredentials

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: story.theme.backgroundColor || '#1a1a1a',
    }}>
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{
            color: story.theme.primaryColor || '#ffffff',
          }}>
            {story.title}
          </h1>
          {story.login.message && (
            <p className="text-lg" style={{
              color: story.theme.textColor || '#cccccc',
            }}>
              {story.login.message}
            </p>
          )}
          {!shouldShowForm && (
            <p className="text-sm mt-4" style={{
              color: story.theme.accentColor || '#888888',
            }}>
              {story.description}
            </p>
          )}
        </div>

        {/* Login Form */}
        {shouldShowForm ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  borderColor: story.theme.accentColor || '#555555',
                  backgroundColor: '#2a2a2a',
                  color: story.theme.textColor || '#ffffff',
                  '--tw-ring-color': story.theme.primaryColor || '#0066cc',
                } as React.CSSProperties}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  borderColor: story.theme.accentColor || '#555555',
                  backgroundColor: '#2a2a2a',
                  color: story.theme.textColor || '#ffffff',
                  '--tw-ring-color': story.theme.primaryColor || '#0066cc',
                } as React.CSSProperties}
              />
            </div>

            {error && (
              <div
                className="p-3 rounded text-sm"
                style={{
                  backgroundColor: '#3a0000',
                  color: '#ff6666',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-2 px-4 rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: story.theme.primaryColor || '#0066cc',
                color: '#ffffff',
              }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {error && (
              <div
                className="p-3 rounded text-sm"
                style={{
                  backgroundColor: '#3a0000',
                  color: '#ff6666',
                }}
              >
                {error}
              </div>
            )}
            <button
              onClick={handleSkipLogin}
              disabled={isLoading}
              className="w-full py-2 px-4 rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: story.theme.primaryColor || '#0066cc',
                color: '#ffffff',
              }}
            >
              {isLoading ? 'Initializing...' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
