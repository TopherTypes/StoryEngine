/**
 * Zustand store for story state management
 * Handles story CRUD operations and artefact management
 */
import { create } from 'zustand';
import { saveStory, getStory, getAllStories, deleteStory as deleteStoryFromDB } from '../db/indexedDB';
import { generateStoryId } from '../utils/idGenerator';
import { createDefaultStory } from '../utils/storyDefaults';
export const useStoryStore = create((set, get) => ({
    currentStoryId: null,
    stories: new Map(),
    isLoading: false,
    error: null,
    createStory: async (metadata) => {
        set({ isLoading: true, error: null });
        try {
            const storyId = generateStoryId();
            const story = createDefaultStory(storyId, metadata);
            await saveStory(story);
            set((state) => ({
                stories: new Map(state.stories).set(storyId, story),
                currentStoryId: storyId,
                isLoading: false,
            }));
            return storyId;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create story';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    loadStories: async () => {
        set({ isLoading: true, error: null });
        try {
            const stories = await getAllStories();
            const storyMap = new Map(stories.map((s) => [s.id, s]));
            set({ stories: storyMap, isLoading: false });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load stories';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    loadStory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const story = await getStory(id);
            if (!story) {
                throw new Error(`Story not found: ${id}`);
            }
            set((state) => ({
                stories: new Map(state.stories).set(id, story),
                currentStoryId: id,
                isLoading: false,
            }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load story';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    updateStory: async (partial) => {
        const { currentStoryId, stories, getCurrentStory } = get();
        if (!currentStoryId) {
            throw new Error('No story loaded');
        }
        try {
            const current = getCurrentStory();
            if (!current) {
                throw new Error('Current story not found');
            }
            const updated = {
                ...current,
                ...partial,
                modified: Date.now(),
            };
            await saveStory(updated);
            set((state) => ({
                stories: new Map(state.stories).set(currentStoryId, updated),
            }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update story';
            set({ error: message });
            throw error;
        }
    },
    deleteStory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteStoryFromDB(id);
            set((state) => {
                const newStories = new Map(state.stories);
                newStories.delete(id);
                return {
                    stories: newStories,
                    currentStoryId: state.currentStoryId === id ? null : state.currentStoryId,
                    isLoading: false,
                };
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete story';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    addArtefact: async (artefact) => {
        const { updateStory, getCurrentStory } = get();
        const story = getCurrentStory();
        if (!story) {
            throw new Error('No story loaded');
        }
        await updateStory({
            artefacts: [...story.artefacts, artefact],
        });
    },
    updateArtefact: async (id, partial) => {
        const { updateStory, getArtefactById, getCurrentStory } = get();
        const story = getCurrentStory();
        if (!story) {
            throw new Error('No story loaded');
        }
        const artefact = getArtefactById(id);
        if (!artefact) {
            throw new Error(`Artefact not found: ${id}`);
        }
        const updated = {
            ...artefact,
            ...partial,
            modified: Date.now(),
        };
        await updateStory({
            artefacts: story.artefacts.map((a) => (a.id === id ? updated : a)),
        });
    },
    deleteArtefact: async (id) => {
        const { updateStory, getCurrentStory } = get();
        const story = getCurrentStory();
        if (!story) {
            throw new Error('No story loaded');
        }
        await updateStory({
            artefacts: story.artefacts.filter((a) => a.id !== id),
        });
    },
    getCurrentStory: () => {
        const { currentStoryId, stories } = get();
        return currentStoryId ? stories.get(currentStoryId) || null : null;
    },
    getArtefactById: (id) => {
        const story = get().getCurrentStory();
        return story ? story.artefacts.find((a) => a.id === id) || null : null;
    },
}));
