/**
 * File Explorer App
 * Displays folder structure and file navigation
 */

import { useState, useMemo } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useProgressionEngine } from '../../hooks/useProgressionEngine'
import { getFileStructure, getSubfolders, getFolderContents, getParentFolder } from '../../engine/artefactResolver'
import { DocumentViewer } from './DocumentViewer'
import { ImageViewer } from './ImageViewer'
import { AudioPlayer } from './AudioPlayer'
import type { Story, Artefact, DocumentArtefact, ImageArtefact, AudioArtefact } from '../../../types'

interface FileExplorerProps {
  story: Story
}

export function FileExplorer({ story }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [selectedFile, setSelectedFile] = useState<Artefact | null>(null)

  const playerState = usePlayerStore((state) => state.playerState)
  const recordFolderVisited = usePlayerStore((state) => state.recordFolderVisited)
  const { getByType, canView } = useProgressionEngine(story)

  const fileStructure = useMemo(() => {
    if (!playerState) return new Map()
    return getFileStructure(story, playerState)
  }, [story, playerState])

  const currentContents = useMemo(() => {
    const files = getFolderContents(currentPath, fileStructure)
    return files.sort((a, b) => a.title.localeCompare(b.title))
  }, [currentPath, fileStructure])

  const subfolders = useMemo(() => {
    return getSubfolders(currentPath, fileStructure)
  }, [currentPath, fileStructure])

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath)
    recordFolderVisited(folderPath)
  }

  const handleBackClick = () => {
    const parentPath = getParentFolder(currentPath)
    setCurrentPath(parentPath)
    recordFolderVisited(parentPath)
  }

  const handleFileClick = (file: Artefact) => {
    if (canView(file.id)) {
      setSelectedFile(file)
    }
  }

  // If a file is selected, show the appropriate viewer
  if (selectedFile) {
    switch (selectedFile.type) {
      case 'document':
        return (
          <DocumentViewer
            artefact={selectedFile as DocumentArtefact}
            story={story}
            onClose={() => setSelectedFile(null)}
          />
        )
      case 'image':
        return (
          <ImageViewer
            artefact={selectedFile as ImageArtefact}
            story={story}
            onClose={() => setSelectedFile(null)}
          />
        )
      case 'audio':
        return (
          <AudioPlayer
            artefact={selectedFile as AudioArtefact}
            story={story}
            onClose={() => setSelectedFile(null)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Address Bar */}
      <div className="px-4 py-3 border-b" style={{
        borderColor: story.theme.accentColor || '#555555',
        backgroundColor: '#2a2a2a',
      }}>
        <div className="flex items-center gap-2">
          {currentPath !== '/' && (
            <button
              onClick={handleBackClick}
              className="px-3 py-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
              style={{ color: story.theme.textColor || '#ffffff' }}
            >
              ← Back
            </button>
          )}
          <span style={{ color: story.theme.textColor || '#cccccc' }} className="text-sm">
            {currentPath === '/' ? '(Root)' : currentPath}
          </span>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div>
            <div
              className="px-4 py-2 font-semibold text-sm"
              style={{
                backgroundColor: '#1a1a1a',
                color: story.theme.primaryColor || '#0066cc',
                borderBottom: `1px solid ${story.theme.accentColor || '#555555'}`,
              }}
            >
              Folders
            </div>
            {subfolders.map((folder) => (
              <button
                key={folder}
                onClick={() => handleFolderClick(folder)}
                className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white hover:bg-opacity-5 transition-colors border-b"
                style={{
                  color: story.theme.textColor || '#ffffff',
                  borderColor: story.theme.accentColor || '#333333',
                }}
              >
                <span>📁</span>
                <span className="truncate">{folder.split('/').filter(Boolean).pop()}</span>
              </button>
            ))}
          </div>
        )}

        {/* Files */}
        {currentContents.length > 0 && (
          <div>
            <div
              className="px-4 py-2 font-semibold text-sm"
              style={{
                backgroundColor: '#1a1a1a',
                color: story.theme.primaryColor || '#0066cc',
                borderBottom: `1px solid ${story.theme.accentColor || '#555555'}`,
              }}
            >
              Files
            </div>
            {currentContents.map((file) => {
              const isViewable = canView(file.id)
              const icon = file.type === 'document' ? '📄' : file.type === 'image' ? '🖼️' : '🎵'

              return (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  disabled={!isViewable}
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white hover:bg-opacity-5 transition-colors border-b disabled:opacity-50"
                  style={{
                    color: isViewable ? story.theme.textColor || '#ffffff' : '#888888',
                    borderColor: story.theme.accentColor || '#333333',
                  }}
                  title={file.title}
                >
                  <span>{icon}</span>
                  <span className="flex-1 truncate">{file.title}</span>
                  {!isViewable && <span className="text-xs">🔒</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {subfolders.length === 0 && currentContents.length === 0 && (
          <div
            className="flex items-center justify-center h-full text-center"
            style={{ color: story.theme.textColor || '#999999' }}
          >
            <p>No files in this folder</p>
          </div>
        )}
      </div>
    </div>
  )
}
