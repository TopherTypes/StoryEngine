/**
 * Zustand store for UI state
 * Manages window states, active app, and transient UI elements
 */

import { create } from 'zustand'

export interface WindowState {
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
}

interface UIStore {
  // Window management
  openWindows: Map<string, WindowState>
  nextZIndex: number
  focusedAppId: string | null

  // Modal states
  showPasswordPrompt: boolean
  passwordPromptArtefactId: string | null

  // Window actions
  openApp: (appId: string) => void
  closeApp: (appId: string) => void
  minimizeApp: (appId: string) => void
  restoreApp: (appId: string) => void
  focusApp: (appId: string) => void
  isAppOpen: (appId: string) => boolean
  isAppMinimized: (appId: string) => boolean
  getOpenApps: () => string[]
  getVisibleApps: () => string[]

  // Password modal
  showPasswordPromptFor: (artefactId: string) => void
  closePasswordPrompt: () => void

  // Reset
  resetUI: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  openWindows: new Map(),
  nextZIndex: 1000,
  focusedAppId: null,
  showPasswordPrompt: false,
  passwordPromptArtefactId: null,

  openApp: (appId) => {
    set((state) => {
      const windows = new Map(state.openWindows)
      if (windows.has(appId)) {
        // If already open, just restore if minimized
        const windowState = windows.get(appId)!
        windowState.isOpen = true
        windowState.isMinimized = false
        windowState.zIndex = state.nextZIndex
        return {
          openWindows: windows,
          nextZIndex: state.nextZIndex + 1,
          focusedAppId: appId,
        }
      }
      // New window
      windows.set(appId, {
        isOpen: true,
        isMinimized: false,
        zIndex: state.nextZIndex,
      })
      return {
        openWindows: windows,
        nextZIndex: state.nextZIndex + 1,
        focusedAppId: appId,
      }
    })
  },

  closeApp: (appId) => {
    set((state) => {
      const windows = new Map(state.openWindows)
      const windowState = windows.get(appId)
      if (windowState) {
        windowState.isOpen = false
      }
      const focused = state.focusedAppId === appId ? null : state.focusedAppId
      return {
        openWindows: windows,
        focusedAppId: focused,
      }
    })
  },

  minimizeApp: (appId) => {
    set((state) => {
      const windows = new Map(state.openWindows)
      const windowState = windows.get(appId)
      if (windowState) {
        windowState.isMinimized = true
      }
      const focused = state.focusedAppId === appId ? null : state.focusedAppId
      return {
        openWindows: windows,
        focusedAppId: focused,
      }
    })
  },

  restoreApp: (appId) => {
    set((state) => {
      const windows = new Map(state.openWindows)
      const windowState = windows.get(appId)
      if (windowState) {
        windowState.isMinimized = false
        windowState.zIndex = state.nextZIndex
      }
      return {
        openWindows: windows,
        nextZIndex: state.nextZIndex + 1,
        focusedAppId: appId,
      }
    })
  },

  focusApp: (appId) => {
    set((state) => {
      const windows = new Map(state.openWindows)
      const windowState = windows.get(appId)
      if (windowState && windowState.isOpen && !windowState.isMinimized) {
        windowState.zIndex = state.nextZIndex
      }
      return {
        openWindows: windows,
        nextZIndex: state.nextZIndex + 1,
        focusedAppId: appId,
      }
    })
  },

  isAppOpen: (appId) => {
    const windowState = get().openWindows.get(appId)
    return windowState?.isOpen ?? false
  },

  isAppMinimized: (appId) => {
    const windowState = get().openWindows.get(appId)
    return windowState?.isMinimized ?? false
  },

  getOpenApps: () => {
    const windows = get().openWindows
    return Array.from(windows.entries())
      .filter(([_, state]) => state.isOpen)
      .map(([appId]) => appId)
  },

  getVisibleApps: () => {
    const windows = get().openWindows
    return Array.from(windows.entries())
      .filter(([_, state]) => state.isOpen && !state.isMinimized)
      .sort((a, b) => a[1].zIndex - b[1].zIndex)
      .map(([appId]) => appId)
  },

  showPasswordPromptFor: (artefactId) => {
    set({
      showPasswordPrompt: true,
      passwordPromptArtefactId: artefactId,
    })
  },

  closePasswordPrompt: () => {
    set({
      showPasswordPrompt: false,
      passwordPromptArtefactId: null,
    })
  },

  resetUI: () => {
    set({
      openWindows: new Map(),
      nextZIndex: 1000,
      focusedAppId: null,
      showPasswordPrompt: false,
      passwordPromptArtefactId: null,
    })
  },
}))
