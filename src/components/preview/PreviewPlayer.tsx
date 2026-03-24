import { Lock } from 'lucide-react'
import { getUnlockedArtefacts } from '../../utils/releaseEngine'
import type { Story, Artefact } from '../../types'
import type { GameState } from '../../utils/releaseEngine'

interface PreviewPlayerProps {
  story: Story
  gameState: GameState
  forceUnlockedIds: Set<string>
}

export function PreviewPlayer({ story, gameState, forceUnlockedIds }: PreviewPlayerProps) {
  // Merge game state with force-unlocked overrides
  const modifiedGameState = {
    ...gameState,
    openedArtefactIds: new Set([...gameState.openedArtefactIds, ...forceUnlockedIds]),
  }

  const unlocked = getUnlockedArtefacts(story, modifiedGameState)
  const typeColors: Record<string, string> = {
    email: 'border-blue-200 bg-blue-50',
    im: 'border-purple-200 bg-purple-50',
    calendar: 'border-green-200 bg-green-50',
    document: 'border-gray-200 bg-gray-50',
    image: 'border-yellow-200 bg-yellow-50',
    audio: 'border-pink-200 bg-pink-50',
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">AVAILABLE TO PLAYER ({unlocked.length})</p>
        {unlocked.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center text-gray-600 text-sm">
            Nothing available yet at this time
          </div>
        ) : (
          <div className="space-y-2">
            {unlocked.map((artefact) => (
              <div
                key={artefact.id}
                className={`border rounded-lg p-3 ${typeColors[artefact.type]} ${
                  forceUnlockedIds.has(artefact.id) ? 'ring-2 ring-orange-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {artefact.visibleTitle || artefact.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {artefact.type} · {artefact.visibleTitle ? `(${artefact.title})` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                    artefact.type === 'email'
                      ? 'bg-blue-200 text-blue-900'
                      : artefact.type === 'im'
                        ? 'bg-purple-200 text-purple-900'
                        : artefact.type === 'calendar'
                          ? 'bg-green-200 text-green-900'
                          : artefact.type === 'document'
                            ? 'bg-gray-300 text-gray-900'
                            : artefact.type === 'image'
                              ? 'bg-yellow-200 text-yellow-900'
                              : 'bg-pink-200 text-pink-900'
                  }`}>
                    {artefact.type}
                  </span>
                </div>

                {forceUnlockedIds.has(artefact.id) && (
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    <p className="text-xs text-orange-700 font-medium">⚙️ Force unlocked (testing)</p>
                  </div>
                )}

                {artefact.locked && (
                  <div className="mt-2 pt-2 border-t border-yellow-300">
                    <p className="text-xs text-yellow-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Password protected
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ending info if unlocked */}
      {story.ending && (
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-gray-600 mb-2">ENDING</p>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-medium text-purple-900">{story.ending.title}</p>
            <p className="text-sm text-purple-800 mt-1">{story.ending.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
