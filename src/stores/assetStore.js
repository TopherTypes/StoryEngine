/**
 * Zustand store for asset management
 */
import { create } from 'zustand';
import { saveAsset, getProjectAssets, deleteAsset as deleteAssetFromDB } from '../db/indexedDB';
import { generateAssetId } from '../utils/idGenerator';
export const useAssetStore = create((set, get) => ({
    assets: new Map(),
    isLoading: false,
    error: null,
    uploadAsset: async (file, projectId, type) => {
        set({ isLoading: true, error: null });
        try {
            // Validate file type
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
            const validTypes = type === 'image' ? validImageTypes : validAudioTypes;
            if (!validTypes.includes(file.type)) {
                throw new Error(`Invalid ${type} type: ${file.type}`);
            }
            // Read file as base64
            const reader = new FileReader();
            const base64Data = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
            // Create asset
            const assetId = generateAssetId(file.name);
            const asset = {
                id: assetId,
                projectId,
                filename: file.name,
                type,
                size: file.size,
                data: base64Data,
                created: Date.now(),
                mimeType: file.type,
            };
            await saveAsset(asset);
            set((state) => ({
                assets: new Map(state.assets).set(assetId, asset),
                isLoading: false,
            }));
            return assetId;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload asset';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    loadProjectAssets: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const assets = await getProjectAssets(projectId);
            const assetMap = new Map(assets.map((a) => [a.id, a]));
            set({ assets: assetMap, isLoading: false });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load assets';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    deleteAsset: async (assetId) => {
        set({ error: null });
        try {
            await deleteAssetFromDB(assetId);
            set((state) => {
                const newAssets = new Map(state.assets);
                newAssets.delete(assetId);
                return { assets: newAssets };
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete asset';
            set({ error: message });
            throw error;
        }
    },
    getAsset: (assetId) => {
        return get().assets.get(assetId) || null;
    },
    getProjectAssetsList: (projectId) => {
        const assets = Array.from(get().assets.values());
        return assets.filter((a) => a.projectId === projectId);
    },
}));
