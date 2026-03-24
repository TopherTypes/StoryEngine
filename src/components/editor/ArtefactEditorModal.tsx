import { useState } from 'react'
import { Modal } from '../common/Modal'
import { ArtefactForm } from './forms/ArtefactForm'
import { Button } from '../common/Button'
import type { Artefact, ArtefactType } from '../../types'

interface ArtefactEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Artefact
  onSave: (artefact: Artefact) => void
  threads?: { id: string; subject: string }[]
  conversations?: { id: string; participants: string[] }[]
  senders?: { id: string; name: string; email: string }[]
  participants?: { id: string; name: string }[]
  isSubmitting?: boolean
}

const ARTEFACT_TYPES: { value: ArtefactType; label: string; description: string }[] = [
  { value: 'email', label: 'Email', description: 'Email message in a thread' },
  { value: 'im', label: 'Instant Message', description: 'Message in a conversation' },
  { value: 'calendar', label: 'Calendar Event', description: 'Calendar event or meeting' },
  { value: 'document', label: 'Document', description: 'Text document or file' },
  { value: 'image', label: 'Image', description: 'Image file with caption' },
  { value: 'audio', label: 'Audio', description: 'Audio file or recording' },
]

export function ArtefactEditorModal({
  open,
  onOpenChange,
  initialData,
  onSave,
  threads = [],
  conversations = [],
  senders = [],
  participants = [],
  isSubmitting = false,
}: ArtefactEditorModalProps) {
  const [selectedType, setSelectedType] = useState<ArtefactType | null>(initialData?.type || null)

  const handleClose = () => {
    onOpenChange(false)
    setSelectedType(null)
  }

  const handleSave = (data: Artefact) => {
    onSave(data)
    handleClose()
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={initialData ? 'Edit Artefact' : 'Create New Artefact'}
      description={initialData ? 'Update artefact details' : 'Choose a type and fill in the details'}
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {!selectedType && !initialData ? (
          // Type selector for new artefacts
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARTEFACT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">{type.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        ) : selectedType ? (
          // Form for selected type
          <ArtefactForm
            type={selectedType}
            initialData={initialData}
            onSubmit={handleSave}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
            threads={threads}
            conversations={conversations}
            senders={senders}
            participants={participants}
          />
        ) : null}
      </div>
    </Modal>
  )
}
