/**
 * Window Manager - orchestrates window rendering and z-order management
 * Renders visible windows in z-order
 */

import { useUIStore } from '../../stores/uiStore'
import { Window } from './Window'
import type { Story } from '../../../types'

interface WindowManagerProps {
  story: Story
  renderAppContent: (appId: string) => React.ReactNode
  onAppClose: (appId: string) => void
}

// Standard app info
const APP_INFO: Record<string, { title: string }> = {
  email: { title: 'Email' },
  im: { title: 'Messages' },
  calendar: { title: 'Calendar' },
  files: { title: 'File Explorer' },
  document: { title: 'Document' },
  image: { title: 'Image Viewer' },
  audio: { title: 'Audio Player' },
}

export function WindowManager({
  story,
  renderAppContent,
  onAppClose,
}: WindowManagerProps) {
  const visibleApps = useUIStore((state) => state.getVisibleApps())
  const openWindows = useUIStore((state) => state.openWindows)

  return (
    <div className="relative w-full h-full">
      {/* Render windows in z-order */}
      {visibleApps.map((appId) => {
        const appInfo = APP_INFO[appId] || { title: appId }
        const windowState = openWindows.get(appId)

        if (!windowState || !windowState.isOpen || windowState.isMinimized) {
          return null
        }

        return (
          <Window
            key={appId}
            appId={appId}
            title={appInfo.title}
            story={story}
            onClose={() => onAppClose(appId)}
          >
            {renderAppContent(appId)}
          </Window>
        )
      })}
    </div>
  )
}
