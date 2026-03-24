import { useState, useEffect } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { StoryEditorPage } from './pages/StoryEditorPage'
import { PlayerApp } from './player'
import { useStoryStore } from './stores/storyStore'
import type { Story } from './types'

export default function App() {
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)
  const [playerMode, setPlayerMode] = useState(false)
  const [playingStory, setPlayingStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const stories = useStoryStore((state) => state.stories)
  const loadStories = useStoryStore((state) => state.loadStories)

  // Check URL for mode and storyId on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    const storyId = params.get('storyId')

    if (mode === 'player' && storyId) {
      setPlayerMode(true)
      // Load the story
      loadAndPlayStory(storyId)
    }
  }, [])

  const loadAndPlayStory = async (storyId: string) => {
    setIsLoading(true)
    try {
      // First ensure stories are loaded
      if (stories.size === 0) {
        await loadStories()
      }

      const story = stories.get(storyId)
      if (story) {
        setPlayingStory(story)
        setPlayerMode(true)
      } else {
        console.error(`Story ${storyId} not found`)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Failed to load story for player:', err)
      setIsLoading(false)
    }
  }

  // Player app mode
  if (playerMode && playingStory) {
    return <PlayerApp story={playingStory} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // Authoring app mode
  if (editingStoryId) {
    return <StoryEditorPage storyId={editingStoryId} onClose={() => setEditingStoryId(null)} />
  }

  return <DashboardPage onEditStory={(id) => setEditingStoryId(id)} />
}
