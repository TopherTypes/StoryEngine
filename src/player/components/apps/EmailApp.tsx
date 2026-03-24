/**
 * Email App
 * Displays inbox with email threads
 */

import { useMemo, useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useProgressionEngine } from '../../hooks/useProgressionEngine'
import { getEmailThreads } from '../../engine/artefactResolver'
import { EmailThread } from './EmailThread'
import type { Story, EmailArtefact } from '../../../types'

interface EmailAppProps {
  story: Story
}

export function EmailApp({ story }: EmailAppProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const playerState = usePlayerStore((state) => state.playerState)
  const recordAppVisited = usePlayerStore((state) => state.recordAppVisited)
  const { getByType } = useProgressionEngine(story)

  // Track app visit on mount
  useMemo(() => {
    recordAppVisited('email')
  }, [recordAppVisited])

  const emailThreads = useMemo(() => {
    if (!playerState) return new Map()
    return getEmailThreads(story, playerState)
  }, [story, playerState])

  const sortedThreadIds = useMemo(() => {
    return Array.from(emailThreads.keys()).sort((a, b) => {
      const aThread = emailThreads.get(a)
      const bThread = emailThreads.get(b)
      if (!aThread || !bThread) return 0

      // Sort by most recent email in thread
      const aLatest = aThread[aThread.length - 1]
      const bLatest = bThread[bThread.length - 1]

      const aTime = aLatest?.timestamp ? new Date(aLatest.timestamp).getTime() : 0
      const bTime = bLatest?.timestamp ? new Date(bLatest.timestamp).getTime() : 0

      return bTime - aTime // Most recent first
    })
  }, [emailThreads])

  // If a thread is selected, show the thread view
  if (selectedThreadId) {
    const thread = emailThreads.get(selectedThreadId)
    if (thread) {
      return (
        <EmailThread
          threadId={selectedThreadId}
          emails={thread}
          story={story}
          onBack={() => setSelectedThreadId(null)}
        />
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: '#2a2a2a',
          borderColor: story.theme.accentColor || '#555555',
        }}
      >
        <h2
          className="font-semibold"
          style={{ color: story.theme.primaryColor || '#0066cc' }}
        >
          Inbox ({sortedThreadIds.length})
        </h2>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-auto">
        {sortedThreadIds.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: story.theme.textColor || '#999999' }}
          >
            <p>No emails</p>
          </div>
        ) : (
          sortedThreadIds.map((threadId) => {
            const emails = emailThreads.get(threadId)
            if (!emails || emails.length === 0) return null

            const firstEmail = emails[0] as EmailArtefact
            const lastEmail = emails[emails.length - 1] as EmailArtefact
            const timestamp = lastEmail.timestamp || ''

            return (
              <button
                key={threadId}
                onClick={() => setSelectedThreadId(threadId)}
                className="w-full px-4 py-4 text-left border-b hover:bg-white hover:bg-opacity-5 transition-colors flex flex-col gap-1"
                style={{
                  borderColor: story.theme.accentColor || '#333333',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold flex-1 truncate"
                    style={{ color: story.theme.textColor || '#ffffff' }}
                  >
                    {firstEmail.sender}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: story.theme.accentColor || '#888888' }}
                  >
                    {timestamp
                      ? new Date(timestamp).toLocaleDateString()
                      : 'No date'}
                  </span>
                </div>
                <p
                  className="text-sm truncate"
                  style={{ color: story.theme.textColor || '#cccccc' }}
                >
                  {firstEmail.subject}
                </p>
                {emails.length > 1 && (
                  <p
                    className="text-xs"
                    style={{ color: story.theme.accentColor || '#888888' }}
                  >
                    {emails.length} messages
                  </p>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
