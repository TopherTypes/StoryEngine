/**
 * Document Viewer
 * Displays text documents
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import type { DocumentArtefact, Story } from '../../../types'

interface DocumentViewerProps {
  artefact: DocumentArtefact
  story: Story
  onClose: () => void
}

export function DocumentViewer({ artefact, story, onClose }: DocumentViewerProps) {
  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)

  useEffect(() => {
    // Mark as read when opened
    recordArtefactRead(artefact.id)
  }, [artefact.id, recordArtefactRead])

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
        <h2
          className="font-semibold truncate"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          {artefact.title}
        </h2>
        <button
          onClick={onClose}
          className="text-lg hover:opacity-75 transition-opacity"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          {artefact.body}
        </div>
      </div>
    </div>
  )
}
