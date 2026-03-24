import { Input } from '../common/Input'

interface TimeJumpSliderProps {
  currentTime: number
  maxTime: number
  onTimeChange: (time: number) => void
}

export function TimeJumpSlider({ currentTime, maxTime, onTimeChange }: TimeJumpSliderProps) {
  const safeMax = Math.max(maxTime, 60)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="0"
          max={safeMax}
          value={currentTime}
          onChange={(e) => onTimeChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="w-16">
          <Input
            type="number"
            min="0"
            value={currentTime}
            onChange={(e) => onTimeChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="text-center text-sm"
          />
        </div>
        <span className="text-sm text-gray-600 w-12">min</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0 min</span>
        <span>{safeMax} min (max)</span>
      </div>
    </div>
  )
}
