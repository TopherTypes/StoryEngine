/**
 * Audio Player
 * Displays HTML5 audio player with controls
 */

import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { loadAssetData } from '../../utils/assetLoader'
import type { AudioArtefact, Story } from '../../../types'

interface AudioPlayerProps {
  artefact: AudioArtefact
  story: Story
  onClose: () => void
}

export function AudioPlayer({ artefact, story, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioData, setAudioData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)
  const recordAudioPlayed = usePlayerStore((state) => state.recordAudioPlayed)

  useEffect(() => {
    recordArtefactRead(artefact.id)
  }, [artefact.id, recordArtefactRead])

  useEffect(() => {
    // Load audio asset
    const loadAudio = async () => {
      const data = await loadAssetData(story.id, artefact.assetId)
      if (data) {
        setAudioData(data)
      }
      setIsLoading(false)
    }

    loadAudio()
  }, [artefact.assetId, story.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      recordAudioPlayed(artefact.assetId)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [artefact.assetId, recordAudioPlayed])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = percent * duration
  }

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

      {/* Player */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {isLoading ? (
          <p style={{ color: story.theme.textColor || '#cccccc' }}>Loading audio...</p>
        ) : audioData ? (
          <>
            {/* Audio element (hidden) */}
            <audio ref={audioRef} src={audioData} />

            {/* Big play button */}
            <button
              onClick={handlePlayPause}
              className="mb-8 w-16 h-16 rounded-full flex items-center justify-center text-3xl hover:opacity-75 transition-opacity"
              style={{
                backgroundColor: story.theme.primaryColor || '#0066cc',
                color: '#ffffff',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Progress bar */}
            <div className="w-full mb-4">
              <div
                onClick={handleProgressClick}
                className="h-2 rounded bg-opacity-30 cursor-pointer hover:bg-opacity-50 transition-all"
                style={{
                  backgroundColor: story.theme.primaryColor || '#0066cc',
                }}
              >
                <div
                  className="h-full rounded"
                  style={{
                    width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                    backgroundColor: story.theme.primaryColor || '#0066cc',
                    transition: isPlaying ? 'none' : 'width 0.1s',
                  }}
                />
              </div>
            </div>

            {/* Time display */}
            <div
              className="text-sm"
              style={{ color: story.theme.textColor || '#cccccc' }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </>
        ) : (
          <p style={{ color: '#ff6666' }}>Failed to load audio</p>
        )}
      </div>
    </div>
  )
}
