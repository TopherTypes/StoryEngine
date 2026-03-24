/**
 * Email Thread View
 * Displays all messages in an email thread
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import type { EmailArtefact, Story } from '../../../types'

interface EmailThreadProps {
  threadId: string
  emails: EmailArtefact[]
  story: Story
  onBack: () => void
}

export function EmailThread({ threadId, emails, story, onBack }: EmailThreadProps) {
  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)

  // Mark all emails in thread as read
  useEffect(() => {
    emails.forEach((email) => {
      recordArtefactRead(email.id)
    })
  }, [threadId, emails, recordArtefactRead])

  const firstEmail = emails[0]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{
          backgroundColor: '#2a2a2a',
          borderColor: story.theme.accentColor || '#555555',
        }}
      >
        <div className="flex-1 min-w-0">
          <button
            onClick={onBack}
            className="text-sm hover:opacity-75 transition-opacity mb-1"
            style={{ color: story.theme.primaryColor || '#0066cc' }}
          >
            ← Back
          </button>
          <h2
            className="font-semibold truncate"
            style={{ color: story.theme.textColor || '#ffffff' }}
          >
            {firstEmail.subject}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        {emails.map((email, index) => (
          <div
            key={email.id}
            className="px-4 py-4 border-b"
            style={{
              borderColor: story.theme.accentColor || '#333333',
              backgroundColor: index % 2 === 0 ? '#1a1a1a' : '#141414',
            }}
          >
            {/* From/Date */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b"
              style={{
                borderColor: story.theme.accentColor || '#333333',
              }}>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: story.theme.textColor || '#ffffff' }}
                >
                  {email.sender}
                </p>
                <p
                  className="text-xs"
                  style={{ color: story.theme.accentColor || '#888888' }}
                >
                  To: {email.recipients.join(', ')}
                </p>
              </div>
              <p
                className="text-xs text-right"
                style={{ color: story.theme.accentColor || '#888888' }}
              >
                {email.timestamp
                  ? new Date(email.timestamp).toLocaleString()
                  : 'No date'}
              </p>
            </div>

            {/* Body */}
            <div
              className="text-sm whitespace-pre-wrap break-words mb-3"
              style={{ color: story.theme.textColor || '#cccccc' }}
            >
              {email.body}
            </div>

            {/* Attachments */}
            {email.hasAttachment && (
              <div
                className="text-xs pt-3 border-t"
                style={{
                  borderColor: story.theme.accentColor || '#333333',
                  color: story.theme.accentColor || '#888888',
                }}
              >
                📎 Has attachment(s)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
