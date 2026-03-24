import { Clock, AlertCircle } from 'lucide-react'
import { useStoryStore } from '../../../stores/storyStore'
import type { Artefact } from '../../../types'

export function TimelineTab() {
  const currentStory = useStoryStore((state) => state.getCurrentStory())

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  // Group artefacts by release time
  const artefactsByTime = new Map<number | string, Artefact[]>()
  const hasConditions = new Set<string>()

  currentStory.artefacts.forEach((a) => {
    const key = a.releaseAtTime !== undefined ? a.releaseAtTime : 'immediate'
    if (!artefactsByTime.has(key)) {
      artefactsByTime.set(key, [])
    }
    artefactsByTime.get(key)!.push(a)

    if (a.releaseTriggers && a.releaseTriggers.length > 0) {
      hasConditions.add(a.id)
    }
  })

  // Sort by time
  const sortedTimes = Array.from(artefactsByTime.keys())
    .sort((a, b) => {
      if (a === 'immediate') return -1
      if (b === 'immediate') return 1
      return (a as number) - (b as number)
    })

  const typeColors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-800',
    im: 'bg-purple-100 text-purple-800',
    calendar: 'bg-green-100 text-green-800',
    document: 'bg-gray-100 text-gray-800',
    image: 'bg-yellow-100 text-yellow-800',
    audio: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Release Timeline</h3>
        <p className="text-sm text-gray-600">When each artefact becomes available to players</p>
      </div>

      {sortedTimes.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
          No artefacts yet
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTimes.map((time) => {
            const artefacts = artefactsByTime.get(time)!
            const timeLabel = time === 'immediate' ? 'Immediate' : `${time} minute${(time as number) !== 1 ? 's' : ''} in`

            return (
              <div key={time} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">{timeLabel}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{artefacts.length} item{artefacts.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {artefacts.map((a) => (
                    <div key={a.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{a.title}</p>
                          <p className="text-xs text-gray-600">{a.visibleTitle || '(no visible title)'}</p>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${typeColors[a.type]}`}>
                          {a.type}
                        </span>
                      </div>

                      {/* Badges for special states */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.locked && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">🔒 Locked</span>}
                        {hasConditions.has(a.id) && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⚡ Conditional</span>
                        )}
                        {a.hidden && <span className="text-xs bg-gray-300 text-gray-800 px-2 py-0.5 rounded">👁️ Hidden</span>}
                        {a.readOnly && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Read-only</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Total Artefacts</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{currentStory.artefacts.length}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Locked</p>
          <p className="text-xl font-bold text-red-600 mt-1">{currentStory.artefacts.filter((a) => a.locked).length}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Conditional</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{hasConditions.size}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Time Windows</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{sortedTimes.length}</p>
        </div>
      </div>
    </div>
  )
}
