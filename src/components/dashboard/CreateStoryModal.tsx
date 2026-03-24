import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { useStoryStore } from '../../stores/storyStore'
import { useUIStore } from '../../stores/uiStore'

interface CreateStoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStoryModal({ open, onOpenChange }: CreateStoryModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createStory } = useStoryStore()
  const { showToast } = useUIStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Story title is required')
      return
    }

    try {
      setIsLoading(true)
      await createStory({
        title: title.trim(),
        description: description.trim(),
        author: author.trim(),
      })
      showToast('success', 'Story created successfully!')
      onOpenChange(false)
      setTitle('')
      setDescription('')
      setAuthor('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create story'
      setError(message)
      showToast('error', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('')
      setDescription('')
      setAuthor('')
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title="Create New Story" description="Fill in the details to create a new story">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-900">Story Title *</label>
          <Input
            type="text"
            placeholder="Enter story title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Description</label>
          <Textarea
            placeholder="Brief description of your story"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Author</label>
          <Input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Story'}
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
