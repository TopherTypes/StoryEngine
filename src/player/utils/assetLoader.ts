/**
 * Asset loader utilities
 * Loads assets from IndexedDB (authoring store)
 */

import { getAsset } from '../../db/indexedDB'

/**
 * Load asset data
 */
export async function loadAssetData(storyId: string, assetId: string): Promise<string | null> {
  try {
    const asset = await getAsset(assetId)
    if (asset && asset.projectId === storyId) {
      return asset.data
    }
    return null
  } catch (err) {
    console.error('Failed to load asset:', err)
    return null
  }
}
