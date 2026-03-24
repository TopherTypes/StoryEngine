/**
 * Story Loading Utilities for Player
 * Handles loading stories from various sources for GitHub Pages deployment
 */

import type { Story } from '../../types'

/**
 * Load story from IndexedDB (same-domain authoring tool)
 */
export async function loadStoryFromIndexedDB(storyId: string): Promise<Story | null> {
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('StoryEngineAuthoring', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['authoringProjects'], 'readonly')
      const store = transaction.objectStore('authoringProjects')
      const request = store.get(storyId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  } catch (err) {
    console.error('Failed to load story from IndexedDB:', err)
    return null
  }
}

/**
 * Load story from URL (e.g., from GitHub Pages static assets)
 */
export async function loadStoryFromURL(url: string): Promise<Story | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch story: ${response.statusText}`)
    }
    return await response.json()
  } catch (err) {
    console.error('Failed to load story from URL:', err)
    return null
  }
}

/**
 * Try to load story from multiple sources in order
 */
export async function loadStoryFromAnySource(
  storyId: string,
  storyUrl?: string
): Promise<Story | null> {
  // 1. Try URL first (if provided)
  if (storyUrl) {
    const story = await loadStoryFromURL(storyUrl)
    if (story) return story
  }

  // 2. Try IndexedDB (same-domain authoring tool)
  const story = await loadStoryFromIndexedDB(storyId)
  if (story) return story

  // 3. Try as URL directly (in case storyId is actually a URL)
  if (storyId.startsWith('http')) {
    return await loadStoryFromURL(storyId)
  }

  return null
}

/**
 * Export story to JSON for distribution
 * Can be used to create story files for GitHub Pages
 */
export function exportStoryToJSON(story: Story): string {
  return JSON.stringify(story, null, 2)
}

/**
 * Create a story export blob for download
 */
export function createStoryExportBlob(story: Story): Blob {
  const json = exportStoryToJSON(story)
  return new Blob([json], { type: 'application/json' })
}

/**
 * Parse story from JSON string
 */
export function parseStoryFromJSON(json: string): Story {
  return JSON.parse(json) as Story
}
