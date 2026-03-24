/**
 * Placeholder app component for Phase 2
 * Will be replaced with actual app implementations in later phases
 */

interface PlaceholderAppProps {
  appName: string
}

export function PlaceholderApp({ appName }: PlaceholderAppProps) {
  return (
    <div className="flex items-center justify-center w-full h-full text-center">
      <div>
        <p className="text-xl font-semibold mb-2">{appName}</p>
        <p className="text-gray-400 text-sm">Coming in Phase 3+</p>
      </div>
    </div>
  )
}
