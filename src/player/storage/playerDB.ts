/**
 * IndexedDB layer for player sessions
 * Stores player progress and session data separately from authoring tool
 */

import type { PlayerGameState } from '../../types'

const DB_NAME = 'StoryEnginePlayer'
const DB_VERSION = 1

const STORES = {
  SESSIONS: 'playerSessions',
  PROGRESS: 'playerProgress',
}

let db: IDBDatabase | null = null

/**
 * Initialize Player IndexedDB
 */
export async function initializePlayerDB(): Promise<IDBDatabase> {
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

      // Create sessions store (tracks login sessions)
      if (!database.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionStore = database.createObjectStore(STORES.SESSIONS, {
          keyPath: 'id',
        })
        sessionStore.createIndex('storyId', 'storyId', { unique: false })
        sessionStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create progress store (tracks player state)
      if (!database.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = database.createObjectStore(STORES.PROGRESS, {
          keyPath: 'storyId',
        })
        progressStore.createIndex('lastPlayedAt', 'lastPlayedAt', {
          unique: false,
        })
      }
    }
  })
}

// ==================== SESSION OPERATIONS ====================

export interface PlayerSession {
  id: string
  storyId: string
  playerId: string
  startTime: number
  createdAt: number
  isActive: boolean
}

export async function createSession(
  storyId: string,
  playerId: string
): Promise<PlayerSession> {
  const database = await getDB()
  const session: PlayerSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    storyId,
    playerId,
    startTime: Date.now(),
    createdAt: Date.now(),
    isActive: true,
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SESSIONS], 'readwrite')
    const store = transaction.objectStore(STORES.SESSIONS)
    const request = store.add(session)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(session)
  })
}

export async function getActiveSession(
  storyId: string
): Promise<PlayerSession | null> {
  const database = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SESSIONS], 'readonly')
    const store = transaction.objectStore(STORES.SESSIONS)
    const index = store.index('storyId')
    const request = index.getAll(storyId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const sessions = request.result as PlayerSession[]
      const active = sessions.find((s) => s.isActive)
      resolve(active || null)
    }
  })
}

// ==================== PROGRESS OPERATIONS ====================

export async function savePlayerProgress(
  playerState: PlayerGameState
): Promise<void> {
  const database = await getDB()

  // Convert Sets to Arrays for storage
  const storable = {
    ...playerState,
    openedArtefactIds: Array.from(playerState.openedArtefactIds),
    readArtefactIds: Array.from(playerState.readArtefactIds),
    viewedImages: Array.from(playerState.viewedImages),
    playedAudio: Array.from(playerState.playedAudio),
    visitedApps: Array.from(playerState.visitedApps),
    visitedFolders: Array.from(playerState.visitedFolders),
    unlockedArtefactIds: Array.from(playerState.unlockedArtefactIds),
    unlockedPasswords: Array.from(playerState.unlockedPasswords.entries()),
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROGRESS], 'readwrite')
    const store = transaction.objectStore(STORES.PROGRESS)
    const request = store.put(storable)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function loadPlayerProgress(
  storyId: string
): Promise<PlayerGameState | null> {
  const database = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROGRESS], 'readonly')
    const store = transaction.objectStore(STORES.PROGRESS)
    const request = store.get(storyId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const data = request.result
      if (!data) {
        resolve(null)
        return
      }

      // Restore Sets from Arrays
      const restored: PlayerGameState = {
        ...data,
        openedArtefactIds: new Set(data.openedArtefactIds),
        readArtefactIds: new Set(data.readArtefactIds),
        viewedImages: new Set(data.viewedImages),
        playedAudio: new Set(data.playedAudio),
        visitedApps: new Set(data.visitedApps),
        visitedFolders: new Set(data.visitedFolders),
        unlockedArtefactIds: new Set(data.unlockedArtefactIds),
        unlockedPasswords: new Map(data.unlockedPasswords),
      }

      resolve(restored)
    }
  })
}

export async function deletePlayerProgress(storyId: string): Promise<void> {
  const database = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PROGRESS], 'readwrite')
    const store = transaction.objectStore(STORES.PROGRESS)
    const request = store.delete(storyId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// ==================== HELPER ====================

async function getDB(): Promise<IDBDatabase> {
  if (db) {
    return db
  }
  return initializePlayerDB()
}
