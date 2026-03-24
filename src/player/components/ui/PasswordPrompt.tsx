/**
 * Password Prompt Modal
 * Displays password entry UI for locked content
 */

import { useState } from 'react'
import { validatePassword, recordPasswordUnlock } from '../../engine/passwordValidator'
import type { Artefact, Story } from '../../../types'

interface PasswordPromptProps {
  artefact: Artefact
  story: Story
  onCorrect: () => void
  onCancel: () => void
}

export function PasswordPrompt({ artefact, story, onCorrect, onCancel }: PasswordPromptProps) {
  const [passwordAttempt, setPasswordAttempt] = useState('')
  const [error, setError] = useState('')

  const lockPassword = (artefact as any).lockPassword
  const lockHint = (artefact as any).lockHint

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword(passwordAttempt, lockPassword)) {
      setError('Incorrect password')
      setPasswordAttempt('')
      return
    }

    // Password is correct
    onCorrect()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-lg p-6 max-w-sm mx-4"
        style={{
          backgroundColor: story.theme.backgroundColor || '#2a2a2a',
          border: `2px solid ${story.theme.primaryColor || '#0066cc'}`,
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{
          color: story.theme.primaryColor || '#0066cc',
        }}>
          This content is locked
        </h2>

        {lockHint && (
          <p className="mb-4 text-sm" style={{
            color: story.theme.textColor || '#cccccc',
          }}>
            Hint: {lockHint}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{
              color: story.theme.textColor || '#cccccc',
            }}>
              Password:
            </label>
            <input
              type="password"
              value={passwordAttempt}
              onChange={(e) => {
                setPasswordAttempt(e.target.value)
                setError('')
              }}
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#1a1a1a',
                borderColor: error ? '#ff6666' : story.theme.accentColor || '#555555',
                color: story.theme.textColor || '#ffffff',
                '--tw-ring-color': story.theme.primaryColor || '#0066cc',
              } as React.CSSProperties}
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2 rounded text-sm" style={{
              backgroundColor: '#3a0000',
              color: '#ff6666',
            }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded border hover:opacity-75 transition-opacity"
              style={{
                borderColor: story.theme.accentColor || '#555555',
                color: story.theme.textColor || '#ffffff',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: story.theme.primaryColor || '#0066cc',
                color: '#ffffff',
              }}
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
