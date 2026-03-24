import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../common/Button'
import { PreviewControls } from './PreviewControls'
import { PreviewPlayer } from './PreviewPlayer'
import { ConditionInspector } from './ConditionInspector'
import { createDefaultGameState } from '../../utils/releaseEngine'
import type { Story } from '../../types'

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  story: Story
}

export function PreviewModal({ open, onOpenChange, story }: PreviewModalProps) {
  const [gameState, setGameState] = useState(createDefaultGameState())
  const [forceUnlockedIds, setForceUnlockedIds] = useState<Set<string>>(new Set())

  if (!open) return null

  const handleTimeChange = (time: number) => {
    setGameState((prev) => ({ ...prev, elapsedMinutes: time }))
  }

  const handleRestart = () => {
    setGameState(createDefaultGameState())
    setForceUnlockedIds(new Set())
  }

  const handleForceUnlock = (artefactId: string) => {
    setForceUnlockedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(artefactId)) {
        newSet.delete(artefactId)
      } else {
        newSet.add(artefactId)
      }
      return newSet
    })
  }

  // Calculate max time from artefacts
  const maxTime = Math.max(
    60,
    ...story.artefacts
      .map((a) => a.releaseAtTime || 0)
      .filter((t) => t > 0)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Preview: {story.title || 'Untitled'}</h2>
            <p className="text-sm text-gray-600 mt-1">Test your story in real-time</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-1 h-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Controls */}
          <PreviewControls
            currentTime={gameState.elapsedMinutes}
            maxTime={maxTime}
            onTimeChange={handleTimeChange}
            onRestart={handleRestart}
          />

          {/* Main preview area */}
          <div className="flex-1 flex gap-4 p-4 bg-gray-50 overflow-hidden">
            {/* Player view */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
              <PreviewPlayer story={story} gameState={gameState} forceUnlockedIds={forceUnlockedIds} />
            </div>

            {/* Inspector sidebar */}
            <div className="w-80 flex flex-col gap-4">
              <ConditionInspector
                story={story}
                gameState={gameState}
                onForceUnlock={handleForceUnlock}
              />

              {/* Info panel */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs space-y-2">
                <p className="font-medium text-gray-900">Preview Tips</p>
                <ul className="text-gray-600 space-y-1">
                  <li>• Drag slider to jump to any time</li>
                  <li>• Click "Unlock" to override locks</li>
                  <li>• Orange ring = force unlocked</li>
                  <li>• Click "Restart" to reset</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close Preview</Button>
        </div>
      </div>
    </div>
  )
}
