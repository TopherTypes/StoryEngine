/**
 * IndexedDB layer for StoryEngine
 * Handles initialization, CRUD operations for stories and assets
 */

import type { Story, Asset } from '../types'

const DB_NAME = 'StoryEngineAuthoring'
const DB_VERSION = 1

const STORES = {
  PROJECTS: 'authoringProjects',
  ASSETS: 'assets',
}

let db: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = database.createObjectStore(STORES.PROJECTS, { keyPath: 'id' })
        projectStore.createIndex('title', 'title', { unique: false })
        projectStore.createIndex('modified', 'modified', { unique: false })
      }

      if (!database.objectStoreNames.contains(STORES.ASSETS)) {
        const assetStore = database.createObjectStore(STORES.ASSETS, { keyPath: 'id' })
        assetStore.createIndex('projectId', 'projectId', { unique: false })
        assetStore.createIndex('type', 'type', { unique: false })
      }
    }
  })
}

// ==================== STORY OPERATIONS ====================

/**
 * Save a story to IndexedDB
 */
export async function saveStory(story: Story): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readwrite')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.put({
      ...story,
      modified: Date.now(),
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get a story by ID
 */
export async function getStory(storyId: string): Promise<Story | null> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.get(storyId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

/**
 * Get all stories
 */
export async function getAllStories(): Promise<Story[]> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * Delete a story by ID
 */
export async function deleteStory(storyId: string): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS, STORES.ASSETS], 'readwrite')

    // Delete the story
    const projectStore = transaction.objectStore(STORES.PROJECTS)
    projectStore.delete(storyId)

    // Delete all assets for this story
    const assetStore = transaction.objectStore(STORES.ASSETS)
    const assetIndex = assetStore.index('projectId')
    const deleteAssetsRequest = assetIndex.openCursor(IDBKeyRange.only(storyId))

    deleteAssetsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

// ==================== ASSET OPERATIONS ====================

/**
 * Save an asset to IndexedDB
 */
export async function saveAsset(asset: Asset): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSETS], 'readwrite')
    const store = transaction.objectStore(STORES.ASSETS)
    const request = store.put(asset)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get an asset by ID
 */
export async function getAsset(assetId: string): Promise<Asset | null> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSETS], 'readonly')
    const store = transaction.objectStore(STORES.ASSETS)
    const request = store.get(assetId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

/**
 * Get all assets for a project
 */
export async function getProjectAssets(projectId: string): Promise<Asset[]> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSETS], 'readonly')
    const store = transaction.objectStore(STORES.ASSETS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * Delete an asset by ID
 */
export async function deleteAsset(assetId: string): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSETS], 'readwrite')
    const store = transaction.objectStore(STORES.ASSETS)
    const request = store.delete(assetId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Clear all data from the database (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROJECTS, STORES.ASSETS], 'readwrite')

    transaction.objectStore(STORES.PROJECTS).clear()
    transaction.objectStore(STORES.ASSETS).clear()

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}
