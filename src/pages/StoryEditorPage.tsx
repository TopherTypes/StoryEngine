import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { Button } from '../components/common/Button'
import { useUIStore } from '../stores/uiStore'
import { useStoryStore } from '../stores/storyStore'
import { LeftNavigation } from '../components/editor/LeftNavigation'
import { SettingsTab } from '../components/editor/tabs/SettingsTab'
import { LibraryTab } from '../components/editor/tabs/LibraryTab'
import { TimelineTab } from '../components/editor/tabs/TimelineTab'
import { AssetManagerTab } from '../components/editor/tabs/AssetManagerTab'
import { EndingTab } from '../components/editor/tabs/EndingTab'
import { ValidateTab } from '../components/editor/tabs/ValidateTab'
import { PreviewModal } from '../components/preview/PreviewModal'

interface StoryEditorPageProps {
  storyId: string
  onClose: () => void
}

const TABS = {
  settings: <SettingsTab />,
  library: <LibraryTab />,
  timeline: <TimelineTab />,
  assets: <AssetManagerTab />,
  ending: <EndingTab />,
  validate: <ValidateTab />,
}

export function StoryEditorPage({ storyId, onClose }: StoryEditorPageProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const { activeTab } = useUIStore()
  const { loadStory, getCurrentStory } = useStoryStore()

  useEffect(() => {
    loadStory(storyId).catch((err) => {
      console.error('Failed to load story:', err)
      onClose()
    })
  }, [storyId, loadStory, onClose])

  const story = getCurrentStory()

  if (!story) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading story...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation */}
      <LeftNavigation onBack={onClose} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{story.description}</p>
            </div>
            <Button onClick={() => setPreviewOpen(true)} className="gap-2 whitespace-nowrap">
              <Play className="w-4 h-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {TABS[activeTab as keyof typeof TABS]}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} story={story} />
    </div>
  )
}
