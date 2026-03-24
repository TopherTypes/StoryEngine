import { useState } from 'react'
import { ArtefactTable } from '../ArtefactTable'
import { ArtefactEditorModal } from '../ArtefactEditorModal'
import { Button } from '../../common/Button'
import { Plus } from 'lucide-react'
import { useStoryStore } from '../../../stores/storyStore'
import type { Artefact } from '../../../types'

export function LibraryTab() {
  const currentStory = useStoryStore((state) => state.getCurrentStory())
  const updateArtefact = useStoryStore((state) => state.updateArtefact)
  const deleteArtefact = useStoryStore((state) => state.deleteArtefact)
  const addArtefact = useStoryStore((state) => state.addArtefact)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingArtefact, setEditingArtefact] = useState<Artefact | undefined>()

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  const handleEdit = (artefact: Artefact) => {
    setEditingArtefact(artefact)
    setEditorOpen(true)
  }

  const handleDelete = (artefactId: string) => {
    if (confirm('Delete this artefact? This cannot be undone.')) {
      deleteArtefact(artefactId)
    }
  }

  const handleDuplicate = (artefact: Artefact) => {
    // Create a copy with new ID and updated timestamp
    const newArtefact: Artefact = {
      ...artefact,
      id: `${artefact.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${artefact.title} (copy)`,
      created: Date.now(),
      modified: Date.now(),
    }
    addArtefact(newArtefact)
  }

  const handleSave = (artefact: Artefact) => {
    if (editingArtefact) {
      // Update existing
      updateArtefact(artefact.id, artefact)
    } else {
      // Add new
      addArtefact(artefact)
    }
    setEditingArtefact(undefined)
  }

  const handleCreateNew = () => {
    setEditingArtefact(undefined)
    setEditorOpen(true)
  }

  // Get unique email threads
  const emailThreads = Array.from(
    new Map(
      currentStory.artefacts
        .filter((a) => a.type === 'email')
        .map((a) => [
          (a as any).threadId,
          {
            id: (a as any).threadId,
            subject: (a as any).subject,
          },
        ])
    ).values()
  )

  // Get unique IM conversations
  const conversations = Array.from(
    new Map(
      currentStory.artefacts
        .filter((a) => a.type === 'im')
        .map((a) => {
          const conversationId = (a as any).conversationId
          return [
            conversationId,
            {
              id: conversationId,
              participants: [conversationId], // Simplified - could parse names from messages
            },
          ]
        })
    ).values()
  )

  // Get unique email senders
  const emailSenders = Array.from(
    new Map(
      currentStory.artefacts
        .filter((a) => a.type === 'email')
        .map((a) => {
          const sender = (a as any).sender
          return [
            sender,
            {
              id: sender,
              name: sender,
              email: `${sender}@example.com`,
            },
          ]
        })
    ).values()
  )

  // Get unique IM participants
  const imParticipants = Array.from(
    new Map(
      currentStory.artefacts
        .filter((a) => a.type === 'im')
        .map((a) => {
          const senderId = (a as any).senderId
          return [
            senderId,
            {
              id: senderId,
              name: senderId,
            },
          ]
        })
    ).values()
  )

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Artefact Library</h3>
        <Button onClick={handleCreateNew} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Artefact
        </Button>
      </div>

      <ArtefactTable artefacts={currentStory.artefacts} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />

      <ArtefactEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialData={editingArtefact}
        onSave={handleSave}
        threads={emailThreads}
        conversations={conversations}
        senders={emailSenders}
        participants={imParticipants}
      />
    </div>
  )
}
