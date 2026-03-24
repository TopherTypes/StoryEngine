/**
 * Zustand store for UI state
 */

import { create } from 'zustand'

type EditorTab = 'settings' | 'library' | 'timeline' | 'assets' | 'ending' | 'validate'

interface UIStore {
  // Tab navigation
  activeTab: EditorTab
  setActiveTab: (tab: EditorTab) => void

  // Artefact selection
  selectedArtefactId: string | null
  selectArtefact: (id: string | null) => void

  // Modal states
  isEditorOpen: boolean
  openEditor: () => void
  closeEditor: () => void

  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void

  // Notification/toast
  toast: { type: 'success' | 'error' | 'info'; message: string } | null
  showToast: (type: 'success' | 'error' | 'info', message: string) => void
  clearToast: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'settings',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedArtefactId: null,
  selectArtefact: (id) => set({ selectedArtefactId: id }),

  isEditorOpen: false,
  openEditor: () => set({ isEditorOpen: true }),
  closeEditor: () => set({ isEditorOpen: false }),

  isCreateModalOpen: false,
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  toast: null,
  showToast: (type, message) => {
    set({ toast: { type, message } })
    setTimeout(() => set({ toast: null }), 3000)
  },
  clearToast: () => set({ toast: null }),
}))

