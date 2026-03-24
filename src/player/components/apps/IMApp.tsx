/**
 * IM App
 * Displays conversations list
 */

import { useMemo, useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useProgressionEngine } from '../../hooks/useProgressionEngine'
import { getIMConversations } from '../../engine/artefactResolver'
import { IMThread } from './IMThread'
import type { Story, IMArtefact, IMParticipant } from '../../../types'

interface IMAppProps {
  story: Story
}

export function IMApp({ story }: IMAppProps) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)

  const playerState = usePlayerStore((state) => state.playerState)
  const recordAppVisited = usePlayerStore((state) => state.recordAppVisited)

  // Track app visit on mount
  useMemo(() => {
    recordAppVisited('im')
  }, [recordAppVisited])

  const conversations = useMemo(() => {
    if (!playerState) return new Map()
    return getIMConversations(story, playerState)
  }, [story, playerState])

  const sortedConvIds = useMemo(() => {
    return Array.from(conversations.keys()).sort((a, b) => {
      const aConv = conversations.get(a)
      const bConv = conversations.get(b)
      if (!aConv || !bConv) return 0

      // Sort by most recent message
      const aLatest = aConv[aConv.length - 1]
      const bLatest = bConv[bConv.length - 1]

      const aTime = aLatest?.timestamp ? new Date(aLatest.timestamp).getTime() : 0
      const bTime = bLatest?.timestamp ? new Date(bLatest.timestamp).getTime() : 0

      return bTime - aTime // Most recent first
    })
  }, [conversations])

  const getParticipantName = (participantId: string): string => {
    const participant = story.imParticipants.find((p) => p.id === participantId)
    return participant?.displayName || participant?.name || participantId
  }

  // If a conversation is selected, show the thread view
  if (selectedConvId) {
    const messages = conversations.get(selectedConvId)
    if (messages) {
      return (
        <IMThread
          conversationId={selectedConvId}
          messages={messages}
          story={story}
          onBack={() => setSelectedConvId(null)}
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
          Messages ({sortedConvIds.length})
        </h2>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        {sortedConvIds.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: story.theme.textColor || '#999999' }}
          >
            <p>No conversations</p>
          </div>
        ) : (
          sortedConvIds.map((convId) => {
            const messages = conversations.get(convId)
            if (!messages || messages.length === 0) return null

            const firstMsg = messages[0] as IMArtefact
            const lastMsg = messages[messages.length - 1] as IMArtefact

            // Get participant names
            const participantNames = story.imParticipants
              .map((p) => p.displayName || p.name)
              .filter(Boolean)
              .join(', ')

            return (
              <button
                key={convId}
                onClick={() => setSelectedConvId(convId)}
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
                    {participantNames || 'Unknown'}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: story.theme.accentColor || '#888888' }}
                  >
                    {lastMsg.timestamp
                      ? new Date(lastMsg.timestamp).toLocaleDateString()
                      : 'No date'}
                  </span>
                </div>
                <p
                  className="text-sm truncate"
                  style={{ color: story.theme.textColor || '#cccccc' }}
                >
                  {lastMsg.body.slice(0, 50)}...
                </p>
                {messages.length > 1 && (
                  <p
                    className="text-xs"
                    style={{ color: story.theme.accentColor || '#888888' }}
                  >
                    {messages.length} messages
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
