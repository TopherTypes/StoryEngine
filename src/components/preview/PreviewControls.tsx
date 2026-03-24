import { RotateCcw } from 'lucide-react'
import { Button } from '../common/Button'
import { TimeJumpSlider } from './TimeJumpSlider'

interface PreviewControlsProps {
  currentTime: number
  maxTime: number
  onTimeChange: (time: number) => void
  onRestart: () => void
}

export function PreviewControls({
  currentTime,
  maxTime,
  onTimeChange,
  onRestart,
}: PreviewControlsProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-900 mb-2">Time Control</p>
        <TimeJumpSlider currentTime={currentTime} maxTime={maxTime} onTimeChange={onTimeChange} />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={onRestart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Restart Story
        </Button>
        <Button size="sm" variant="secondary" disabled className="text-xs">
          In preview: {currentTime === 0 ? 'Story start' : `${currentTime} min elapsed`}
        </Button>
      </div>
    </div>
  )
}
