import { useState, useEffect } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { StoryEditorPage } from './pages/StoryEditorPage'
import { PlayerApp } from './player'
import { useStoryStore } from './stores/storyStore'
import { loadStoryFromAnySource } from './player/utils/storyLoader'
import type { Story } from './types'

export default function App() {
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)
  const [playerMode, setPlayerMode] = useState(false)
  const [playingStory, setPlayingStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const stories = useStoryStore((state) => state.stories)
  const loadStories = useStoryStore((state) => state.loadStories)

  // Check URL for mode and storyId/storyUrl on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    const storyId = params.get('storyId')
    const storyUrl = params.get('storyUrl')

    if (mode === 'player' && (storyId || storyUrl)) {
      setPlayerMode(true)
      loadAndPlayStory(storyId || '', storyUrl || undefined)
    }
  }, [])

  const loadAndPlayStory = async (storyId: string, storyUrl?: string) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // Try to load story from various sources
      let story = await loadStoryFromAnySource(storyId, storyUrl)

      if (!story && stories.size === 0) {
        // If not found, try loading from IndexedDB (authoring tool)
        await loadStories()
        story = stories.get(storyId) || null
      }

      if (story) {
        setPlayingStory(story)
        setPlayerMode(true)
      } else {
        const errorMsg = storyUrl
          ? `Story not found at ${storyUrl}`
          : `Story "${storyId}" not found`
        console.error(errorMsg)
        setLoadError(errorMsg)
        setIsLoading(false)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load story'
      console.error('Failed to load story for player:', err)
      setLoadError(errorMsg)
      setIsLoading(false)
    }
  }

  // Player app mode
  if (playerMode && playingStory) {
    return <PlayerApp story={playingStory} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Loading story...</p>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="max-w-md p-6 bg-slate-800 rounded-lg border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Story</h1>
          <p className="text-gray-300 mb-4">{loadError}</p>
          <p className="text-sm text-gray-400 mb-4">
            Make sure you're using the correct story ID or URL.
          </p>
          <button
            onClick={() => {
              window.location.href = window.location.pathname
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Authoring app mode
  if (editingStoryId) {
    return <StoryEditorPage storyId={editingStoryId} onClose={() => setEditingStoryId(null)} />
  }

  return <DashboardPage onEditStory={(id) => setEditingStoryId(id)} />
}
