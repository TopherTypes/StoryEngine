/**
 * Ending Screen
 * Displays story ending when trigger conditions are met
 */

import { usePlayerStore } from '../../stores/playerStore'
import { clearSession } from '../../storage/sessionManager'
import type { Story } from '../../../types'

interface EndingScreenProps {
  story: Story
  onRestart: () => void
}

export function EndingScreen({ story, onRestart }: EndingScreenProps) {
  const playerState = usePlayerStore((state) => state.playerState)
  const resetGame = usePlayerStore((state) => state.resetGame)

  const ending = story.ending

  const handleRestart = async () => {
    if (playerState) {
      await clearSession(playerState.storyId)
    }
    resetGame()
    onRestart()
  }

  const handleContinue = () => {
    // Just close the ending screen, allow exploration to continue
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div
        className="max-w-2xl w-full rounded-lg overflow-hidden"
        style={{
          backgroundColor: story.theme.backgroundColor || '#2a2a2a',
          border: `3px solid ${story.theme.primaryColor || '#0066cc'}`,
        }}
      >
        {/* Ending Content */}
        <div className="p-8">
          {/* Title */}
          <h1
            className="text-4xl font-bold mb-6 text-center"
            style={{ color: story.theme.primaryColor || '#0066cc' }}
          >
            {ending.title}
          </h1>

          {/* Image */}
          {ending.imageUrl && (
            <img
              src={ending.imageUrl}
              alt={ending.title}
              className="w-full max-h-64 object-cover rounded mb-6"
            />
          )}

          {/* Body Text */}
          <div
            className="mb-8 whitespace-pre-wrap text-lg leading-relaxed"
            style={{ color: story.theme.textColor || '#ffffff' }}
          >
            {ending.body}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            {ending.allowRestart && (
              <button
                onClick={handleRestart}
                className="px-8 py-3 rounded font-semibold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: story.theme.primaryColor || '#0066cc',
                  color: '#ffffff',
                }}
              >
                Restart
              </button>
            )}

            {ending.allowContinueAfter && (
              <button
                onClick={handleContinue}
                className="px-8 py-3 rounded font-semibold border-2 hover:opacity-75 transition-opacity"
                style={{
                  borderColor: story.theme.primaryColor || '#0066cc',
                  color: story.theme.primaryColor || '#0066cc',
                }}
              >
                Continue Exploring
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
