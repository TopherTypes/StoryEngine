/**
 * Desktop - displays background and desktop icons for app launching
 */

import { useUIStore } from '../../stores/uiStore'
import type { Story } from '../../../types'

interface DesktopProps {
  story: Story
}

const DESKTOP_APPS = [
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'im', label: 'Messages', icon: '💬' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'files', label: 'Files', icon: '📁' },
]

export function Desktop({ story }: DesktopProps) {
  const openApp = useUIStore((state) => state.openApp)

  const handleAppClick = (appId: string) => {
    openApp(appId)
  }

  return (
    <div
      className="absolute inset-0 pb-12"
      style={{
        backgroundImage: story.theme.wallpaperUrl
          ? `url(${story.theme.wallpaperUrl})`
          : 'none',
        backgroundColor: story.theme.backgroundColor || '#1a1a1a',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Desktop Icons */}
      <div className="p-4 pointer-events-none">
        <div className="grid grid-cols-1 gap-6" style={{ width: '120px' }}>
          {DESKTOP_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="pointer-events-auto flex flex-col items-center gap-2 p-3 rounded hover:bg-white hover:bg-opacity-10 transition-colors group"
              title={app.label}
            >
              <div
                className="text-5xl group-hover:scale-110 transition-transform"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
              >
                {app.icon}
              </div>
              <span
                className="text-xs text-center font-semibold break-words"
                style={{
                  color: story.theme.textColor || '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {app.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
