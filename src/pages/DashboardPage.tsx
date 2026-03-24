import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStoryStore } from '../stores/storyStore'
import { useUIStore } from '../stores/uiStore'
import type { Story } from '../types'
import { Button } from '../components/common/Button'
import { StoryCard } from '../components/dashboard/StoryCard'
import { CreateStoryModal } from '../components/dashboard/CreateStoryModal'

export function DashboardPage() {
  const { stories, deleteStory, loadStories } = useStoryStore()
  const { isCreateModalOpen, openCreateModal, closeCreateModal, showToast } = useUIStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadStories().catch((err) => {
      console.error('Failed to load stories:', err)
      showToast('error', 'Failed to load stories')
    })
  }, [loadStories, showToast])

  const storyList = Array.from(stories.values()).sort((a, b) => b.modified - a.modified)

  const handleDelete = async (storyId: string) => {
    setConfirmDelete(storyId)
  }

  const confirmDeleteStory = async () => {
    if (!confirmDelete) return

    try {
      setIsDeleting(true)
      await deleteStory(confirmDelete)
      showToast('success', 'Story deleted successfully')
      setConfirmDelete(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete story'
      showToast('error', message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (story: Story) => {
    // Navigate to editor (Phase 3)
    console.log('Edit story:', story.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
              <p className="text-gray-600 mt-1">Create and manage your ARG stories</p>
            </div>
            <Button size="lg" onClick={openCreateModal}>
              + New Story
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {storyList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No stories yet</p>
            <p className="text-gray-500 mt-1">Create your first story to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storyList.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateStoryModal open={isCreateModalOpen} onOpenChange={closeCreateModal} />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete Story?</h3>
            <p className="text-gray-600 mt-2">This action cannot be undone. All artefacts and assets will be deleted.</p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmDeleteStory}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
