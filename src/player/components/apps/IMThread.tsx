/**
 * IM Thread View
 * Displays all messages in a conversation
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import type { IMArtefact, Story } from '../../../types'

interface IMThreadProps {
  conversationId: string
  messages: IMArtefact[]
  story: Story
  onBack: () => void
}

export function IMThread({ conversationId, messages, story, onBack }: IMThreadProps) {
  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)

  // Mark all messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      recordArtefactRead(msg.id)
    })
  }, [conversationId, messages, recordArtefactRead])

  const getParticipantName = (participantId: string): string => {
    const participant = story.imParticipants.find((p) => p.id === participantId)
    return participant?.displayName || participant?.name || participantId
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
        <button
          onClick={onBack}
          className="text-sm hover:opacity-75 transition-opacity mb-1"
          style={{ color: story.theme.primaryColor || '#0066cc' }}
        >
          ← Back
        </button>
        <h2
          className="font-semibold"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          Conversation
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        {messages.map((msg) => {
          const senderName = getParticipantName(msg.senderId)

          return (
            <div
              key={msg.id}
              className="px-4 py-3 border-b flex gap-3"
              style={{
                borderColor: story.theme.accentColor || '#333333',
              }}
            >
              {/* Sender avatar/indicator */}
              <div
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                style={{
                  backgroundColor: story.theme.primaryColor || '#0066cc',
                  color: '#ffffff',
                }}
              >
                {senderName.charAt(0).toUpperCase()}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: story.theme.textColor || '#ffffff' }}
                  >
                    {senderName}
                  </p>
                  {msg.timestamp && (
                    <p
                      className="text-xs"
                      style={{ color: story.theme.accentColor || '#888888' }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <p
                  className="text-sm whitespace-pre-wrap break-words"
                  style={{ color: story.theme.textColor || '#cccccc' }}
                >
                  {msg.body}
                </p>
                {msg.hasAttachment && (
                  <p
                    className="text-xs mt-2"
                    style={{ color: story.theme.accentColor || '#888888' }}
                  >
                    📎 Has attachment(s)
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
