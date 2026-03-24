/**
 * Window component - renders a draggable/resizable window with title bar
 */

import { useUIStore } from '../../stores/uiStore'
import type { Story } from '../../../types'

export const WINDOW_BUTTONS = {
  CLOSE: 'close',
  MINIMIZE: 'minimize',
  MAXIMIZE: 'maximize',
}

interface WindowProps {
  appId: string
  title: string
  children: React.ReactNode
  story: Story
  onClose?: () => void
}

export function Window({ appId, title, children, story, onClose }: WindowProps) {
  const closeApp = useUIStore((state) => state.closeApp)
  const minimizeApp = useUIStore((state) => state.minimizeApp)
  const focusApp = useUIStore((state) => state.focusApp)
  const openWindows = useUIStore((state) => state.openWindows)

  const windowState = openWindows.get(appId)
  if (!windowState || !windowState.isOpen) {
    return null
  }

  const handleClose = () => {
    closeApp(appId)
    onClose?.()
  }

  const handleMinimize = () => {
    minimizeApp(appId)
  }

  const handleWindowClick = () => {
    focusApp(appId)
  }

  return (
    <div
      onClick={handleWindowClick}
      className="absolute flex flex-col rounded-lg overflow-hidden shadow-2xl"
      style={{
        width: '600px',
        height: '400px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: windowState.zIndex,
        backgroundColor: '#2a2a2a',
        border: `2px solid ${story.theme.primaryColor || '#0066cc'}`,
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 select-none"
        onMouseDown={(e) => {
          // Prevent text selection when dragging
          e.preventDefault()
        }}
        style={{
          backgroundColor: story.theme.primaryColor || '#0066cc',
          color: '#ffffff',
          height: '28px',
        }}
      >
        <div className="font-semibold text-sm truncate">{title}</div>

        <div className="flex gap-2">
          {/* Minimize Button */}
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center hover:opacity-75 transition-opacity"
            title="Minimize"
          >
            <span className="text-sm">−</span>
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Close"
          >
            <span className="text-sm">×</span>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div
        className="flex-1 overflow-auto"
        style={{
          backgroundColor: '#1a1a1a',
          color: story.theme.textColor || '#ffffff',
        }}
      >
        {children}
      </div>
    </div>
  )
}
