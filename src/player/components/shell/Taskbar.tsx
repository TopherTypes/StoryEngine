/**
 * Taskbar - bottom bar showing open apps and system time
 */

import { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import type { Story } from '../../../types'

interface TaskbarProps {
  story: Story
}

const APP_ICONS: Record<string, string> = {
  email: '✉️',
  im: '💬',
  calendar: '📅',
  files: '📁',
  document: '📄',
  image: '🖼️',
  audio: '🎵',
}

const APP_NAMES: Record<string, string> = {
  email: 'Email',
  im: 'Messages',
  calendar: 'Calendar',
  files: 'Files',
  document: 'Document',
  image: 'Image',
  audio: 'Audio',
}

export function Taskbar({ story }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  const openApps = useUIStore((state) => state.getOpenApps())
  const restoreApp = useUIStore((state) => state.restoreApp)
  const isAppMinimized = useUIStore((state) => state.isAppMinimized)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleTaskbarClick = (appId: string) => {
    if (isAppMinimized(appId)) {
      restoreApp(appId)
    }
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 shadow-lg"
      style={{
        backgroundColor: story.theme.primaryColor || '#0066cc',
        color: '#ffffff',
        zIndex: 999,
      }}
    >
      {/* Open Apps */}
      <div className="flex gap-2">
        {openApps.length === 0 ? (
          <span className="text-sm text-opacity-50">No apps open</span>
        ) : (
          openApps.map((appId) => {
            const isMinimized = isAppMinimized(appId)
            return (
              <button
                key={appId}
                onClick={() => handleTaskbarClick(appId)}
                className="px-3 py-1 rounded flex items-center gap-2 hover:opacity-75 transition-opacity text-sm"
                style={{
                  backgroundColor: isMinimized ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                }}
                title={APP_NAMES[appId] || appId}
              >
                <span>{APP_ICONS[appId] || '□'}</span>
                <span>{APP_NAMES[appId] || appId}</span>
              </button>
            )
          })
        )}
      </div>

      {/* System Clock */}
      <div className="text-sm font-mono">{currentTime}</div>
    </div>
  )
}
