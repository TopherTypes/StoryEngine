import { useState } from 'react'
import { AssetUploadZone } from '../AssetUploadZone'
import { AssetGrid } from '../AssetGrid'
import { useStoryStore } from '../../../stores/storyStore'
import { useAssetStore } from '../../../stores/assetStore'

export function AssetManagerTab() {
  const currentStory = useStoryStore((state) => state.getCurrentStory())
  const uploadAsset = useAssetStore((state) => state.uploadAsset)
  const deleteAsset = useAssetStore((state) => state.deleteAsset)
  const getProjectAssetsList = useAssetStore((state) => state.getProjectAssetsList)

  const [isUploading, setIsUploading] = useState(false)

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  const handleFileSelected = async (file: File) => {
    setIsUploading(true)
    try {
      const type = file.type.startsWith('image/') ? 'image' : 'audio'
      await uploadAsset(file, currentStory.id, type)
    } catch (error) {
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Delete this asset? Any artefacts referencing it may break.')) {
      try {
        await deleteAsset(assetId)
      } catch (error) {
        alert(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const projectAssets = getProjectAssetsList(currentStory.id)

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Manager</h3>
        <p className="text-sm text-gray-600 mb-6">Upload images and audio files for your story</p>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Upload New Asset</h4>
          <AssetUploadZone onFileSelected={handleFileSelected} isLoading={isUploading} />
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Your Assets ({projectAssets.length})
        </h4>
        <AssetGrid assets={projectAssets} onDelete={handleDeleteAsset} />
      </div>
    </div>
  )
}
