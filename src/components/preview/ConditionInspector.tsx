import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../common/Button'
import { isArtefactUnlocked, getLockedReason } from '../../utils/releaseEngine'
import type { Story, Artefact } from '../../types'
import type { GameState } from '../../utils/releaseEngine'

interface ConditionInspectorProps {
  story: Story
  gameState: GameState
  onForceUnlock: (artefactId: string) => void
}

export function ConditionInspector({ story, gameState, onForceUnlock }: ConditionInspectorProps) {
  const [expanded, setExpanded] = useState(false)

  const artefacts = story.artefacts
  const unlocked = artefacts.filter((a) => isArtefactUnlocked(a, gameState))
  const locked = artefacts.filter((a) => !isArtefactUnlocked(a, gameState))

  const typeColors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-800',
    im: 'bg-purple-100 text-purple-800',
    calendar: 'bg-green-100 text-green-800',
    document: 'bg-gray-100 text-gray-800',
    image: 'bg-yellow-100 text-yellow-800',
    audio: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <p className="font-medium text-gray-900">Condition Inspector</p>
          <p className="text-xs text-gray-600">
            {unlocked.length} available · {locked.length} locked
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 space-y-4 p-4 max-h-96 overflow-y-auto">
          {/* Unlocked */}
          {unlocked.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-700 mb-2">✓ UNLOCKED ({unlocked.length})</h4>
              <div className="space-y-2">
                {unlocked.map((a) => (
                  <div key={a.id} className="p-2 bg-green-50 rounded border border-green-200 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{a.title}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${typeColors[a.type]}`}>
                          {a.type}
                        </span>
                      </div>
                      {a.locked && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded whitespace-nowrap">
                          Password lock
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-700 mb-2">🔒 LOCKED ({locked.length})</h4>
              <div className="space-y-2">
                {locked.map((a) => (
                  <div key={a.id} className="p-2 bg-red-50 rounded border border-red-200 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-red-700 mt-1">{getLockedReason(a, gameState)}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${typeColors[a.type]}`}>
                          {a.type}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onForceUnlock(a.id)}
                        className="p-1 h-auto text-xs text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                      >
                        Unlock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {artefacts.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-4">No artefacts in story</p>
          )}
        </div>
      )}
    </div>
  )
}
