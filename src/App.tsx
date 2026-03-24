import { useEffect } from 'react'
import { useStoryStore } from './stores/storyStore'

export default function App() {
  const { loadStories } = useStoryStore()

  useEffect(() => {
    // Load initial data on mount
    loadStories().catch((err) => console.error('Failed to load stories:', err))
  }, [loadStories])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">StoryEngine - Authoring Tool</h1>
        <p className="mt-2 text-gray-600">Phase 1: Foundation Setup Complete</p>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900">Project Status</h2>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>✅ Vite + React + TypeScript configured</li>
            <li>✅ TypeScript types defined (Story, Artefact, all 6 types)</li>
            <li>✅ Zod validation schemas created</li>
            <li>✅ IndexedDB initialized and CRUD operations ready</li>
            <li>✅ Zustand stores (story, asset, ui, preview) created</li>
            <li>✅ Utility functions (ID generation, defaults)</li>
            <li>⏳ Next: Phase 2 - Dashboard & Story Management</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
