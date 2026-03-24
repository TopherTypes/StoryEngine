import { useUIStore } from '../../stores/uiStore'
import { Button } from '../common/Button'
import { Settings, BookOpen, Clock, Image, Flag, CheckCircle, ArrowLeft } from 'lucide-react'

type EditorTab = 'settings' | 'library' | 'timeline' | 'assets' | 'ending' | 'validate'

interface LeftNavigationProps {
  onBack: () => void
}


const TABS: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'library', label: 'Artefacts', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
  { id: 'assets', label: 'Assets', icon: <Image className="w-5 h-5" /> },
  { id: 'ending', label: 'Ending', icon: <Flag className="w-5 h-5" /> },
  { id: 'validate', label: 'Validate', icon: <CheckCircle className="w-5 h-5" /> },
]

export function LeftNavigation({ onBack }: LeftNavigationProps) {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <nav className="w-48 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Editor</h2>
      </div>
      <div className="flex-1 space-y-1 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button variant="outline" className="w-full text-gray-300 border-gray-700 hover:bg-gray-800" size="sm">
          Save
        </Button>
        <Button variant="ghost" className="w-full text-gray-300 hover:bg-gray-800 flex items-center justify-center gap-2" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </nav>
  )
}
