/**
 * Image Viewer
 * Displays images with optional caption
 */

import { useEffect, useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { loadAssetData } from '../../utils/assetLoader'
import type { ImageArtefact, Story } from '../../../types'

interface ImageViewerProps {
  artefact: ImageArtefact
  story: Story
  onClose: () => void
}

export function ImageViewer({ artefact, story, onClose }: ImageViewerProps) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const recordImageViewed = usePlayerStore((state) => state.recordImageViewed)
  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)

  useEffect(() => {
    recordArtefactRead(artefact.id)
  }, [artefact.id, recordArtefactRead])

  useEffect(() => {
    // Load image asset
    const loadImage = async () => {
      const data = await loadAssetData(story.id, artefact.assetId)
      if (data) {
        setImageData(data)
        recordImageViewed(artefact.assetId)
      }
      setIsLoading(false)
    }

    loadImage()
  }, [artefact.assetId, story.id, recordImageViewed])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{
          backgroundColor: '#2a2a2a',
          borderColor: story.theme.accentColor || '#555555',
        }}
      >
        <h2
          className="font-semibold truncate"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          {artefact.title}
        </h2>
        <button
          onClick={onClose}
          className="text-lg hover:opacity-75 transition-opacity"
          style={{ color: story.theme.textColor || '#ffffff' }}
        >
          ✕
        </button>
      </div>

      {/* Image Content */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-4">
        {isLoading ? (
          <p style={{ color: story.theme.textColor || '#cccccc' }}>Loading image...</p>
        ) : imageData ? (
          <>
            <img
              src={imageData}
              alt={artefact.title}
              className="max-w-full max-h-96 object-contain rounded"
            />
            {artefact.caption && (
              <p
                className="mt-4 text-center text-sm"
                style={{ color: story.theme.textColor || '#cccccc' }}
              >
                {artefact.caption}
              </p>
            )}
          </>
        ) : (
          <p style={{ color: '#ff6666' }}>Failed to load image</p>
        )}
      </div>
    </div>
  )
}
