/**
 * Zustand store for player game state
 * Manages story data and player progress throughout the game session
 */

import { create } from 'zustand'
import type { Story, PlayerGameState } from '../../types'

interface PlayerStore {
  // State
  story: Story | null
  playerState: PlayerGameState | null
  isLoading: boolean
  error: string | null

  // Actions
  loadStory: (story: Story, playerState: PlayerGameState) => void
  updatePlayerState: (partial: Partial<PlayerGameState>) => void
  recordArtefactOpened: (artefactId: string) => void
  recordArtefactRead: (artefactId: string) => void
  recordPasswordUnlocked: (passwordKey: string, password: string) => void
  recordAppVisited: (appName: string) => void
  recordFolderVisited: (folderPath: string) => void
  recordImageViewed: (assetId: string) => void
  recordAudioPlayed: (assetId: string) => void
  triggerEnding: () => void
  resetGame: () => void

  // Getters
  getUnlockedArtefactIds: () => Set<string>
  isArtefactOpened: (artefactId: string) => boolean
  isArtefactRead: (artefactId: string) => boolean
  isPasswordUnlocked: (passwordKey: string) => boolean
  isAppVisited: (appName: string) => boolean
  isFolderVisited: (folderPath: string) => boolean
  getElapsedMinutes: () => number
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  story: null,
  playerState: null,
  isLoading: false,
  error: null,

  loadStory: (story, playerState) => {
    set({
      story,
      playerState,
      isLoading: false,
      error: null,
    })
  },

  updatePlayerState: (partial) => {
    set((state) => ({
      playerState: state.playerState
        ? {
            ...state.playerState,
            ...partial,
            lastPlayedAt: Date.now(),
          }
        : null,
    }))
  },

  recordArtefactOpened: (artefactId) => {
    set((state) => {
      if (!state.playerState) return state
      const openedSet = new Set(state.playerState.openedArtefactIds)
      openedSet.add(artefactId)
      return {
        playerState: {
          ...state.playerState,
          openedArtefactIds: openedSet,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordArtefactRead: (artefactId) => {
    set((state) => {
      if (!state.playerState) return state
      const readSet = new Set(state.playerState.readArtefactIds)
      readSet.add(artefactId)
      const openedSet = new Set(state.playerState.openedArtefactIds)
      openedSet.add(artefactId)
      return {
        playerState: {
          ...state.playerState,
          readArtefactIds: readSet,
          openedArtefactIds: openedSet,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordPasswordUnlocked: (passwordKey, password) => {
    set((state) => {
      if (!state.playerState) return state
      const unlockedMap = new Map(state.playerState.unlockedPasswords)
      unlockedMap.set(passwordKey, password)
      return {
        playerState: {
          ...state.playerState,
          unlockedPasswords: unlockedMap,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordAppVisited: (appName) => {
    set((state) => {
      if (!state.playerState) return state
      const visitedSet = new Set(state.playerState.visitedApps)
      visitedSet.add(appName)
      return {
        playerState: {
          ...state.playerState,
          visitedApps: visitedSet,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordFolderVisited: (folderPath) => {
    set((state) => {
      if (!state.playerState) return state
      const visitedSet = new Set(state.playerState.visitedFolders)
      visitedSet.add(folderPath)
      return {
        playerState: {
          ...state.playerState,
          visitedFolders: visitedSet,
          currentLocation: folderPath,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordImageViewed: (assetId) => {
    set((state) => {
      if (!state.playerState) return state
      const viewedSet = new Set(state.playerState.viewedImages)
      viewedSet.add(assetId)
      return {
        playerState: {
          ...state.playerState,
          viewedImages: viewedSet,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  recordAudioPlayed: (assetId) => {
    set((state) => {
      if (!state.playerState) return state
      const playedSet = new Set(state.playerState.playedAudio)
      playedSet.add(assetId)
      return {
        playerState: {
          ...state.playerState,
          playedAudio: playedSet,
          lastPlayedAt: Date.now(),
        },
      }
    })
  },

  triggerEnding: () => {
    set((state) => ({
      playerState: state.playerState
        ? {
            ...state.playerState,
            endingTriggered: true,
            endingTriggeredAt: Date.now(),
            lastPlayedAt: Date.now(),
          }
        : null,
    }))
  },

  resetGame: () => {
    set({
      story: null,
      playerState: null,
      error: null,
    })
  },

  getUnlockedArtefactIds: () => {
    const state = get()
    return state.playerState?.unlockedArtefactIds ?? new Set()
  },

  isArtefactOpened: (artefactId) => {
    const state = get()
    return state.playerState?.openedArtefactIds.has(artefactId) ?? false
  },

  isArtefactRead: (artefactId) => {
    const state = get()
    return state.playerState?.readArtefactIds.has(artefactId) ?? false
  },

  isPasswordUnlocked: (passwordKey) => {
    const state = get()
    return state.playerState?.unlockedPasswords.has(passwordKey) ?? false
  },

  isAppVisited: (appName) => {
    const state = get()
    return state.playerState?.visitedApps.has(appName) ?? false
  },

  isFolderVisited: (folderPath) => {
    const state = get()
    return state.playerState?.visitedFolders.has(folderPath) ?? false
  },

  getElapsedMinutes: () => {
    const state = get()
    if (!state.playerState) return 0
    return Math.floor((Date.now() - state.playerState.startTime) / 60000)
  },
}))
