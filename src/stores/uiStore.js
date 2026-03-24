/**
 * Zustand store for UI state
 */
import { create } from 'zustand';
export const useUIStore = create((set) => ({
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
        set({ toast: { type, message } });
        setTimeout(() => set({ toast: null }), 3000);
    },
    clearToast: () => set({ toast: null }),
}));
