/**
 * Zustand store for preview/testing mode state
 */
import { create } from 'zustand';
export const usePreviewStore = create((set) => ({
    isOpen: false,
    openPreview: () => set({ isOpen: true }),
    closePreview: () => set({ isOpen: false }),
    overriddenArtefacts: new Set(),
    toggleForceUnlock: (artefactId) => set((state) => {
        const newSet = new Set(state.overriddenArtefacts);
        if (newSet.has(artefactId)) {
            newSet.delete(artefactId);
        }
        else {
            newSet.add(artefactId);
        }
        return { overriddenArtefacts: newSet };
    }),
    clearOverrides: () => set({ overriddenArtefacts: new Set() }),
    currentTime: 0,
    jumpToTime: (minutes) => set({ currentTime: minutes }),
    resetPreview: () => set({ currentTime: 0, overriddenArtefacts: new Set() }),
}));
