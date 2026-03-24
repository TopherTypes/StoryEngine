import { useState } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { StoryEditorPage } from './pages/StoryEditorPage'

export default function App() {
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)

  if (editingStoryId) {
    return <StoryEditorPage storyId={editingStoryId} onClose={() => setEditingStoryId(null)} />
  }

  return <DashboardPage onEditStory={(id) => setEditingStoryId(id)} />
}
