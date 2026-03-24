import type { ReleaseRule } from '../../../types'

interface RuleTypePickerProps {
  onSelectType: (type: ReleaseRule['type']) => void
}

const RULE_TYPES: { value: Exclude<ReleaseRule['type'], 'condition_group'>; label: string; description: string }[] = [
  { value: 'time', label: 'Time-based', description: 'Release after elapsed minutes' },
  { value: 'artefact_opened', label: 'Artefact Opened', description: 'Player opens an artefact' },
  { value: 'artefact_read', label: 'Artefact Read', description: 'Player reads/views an artefact' },
  { value: 'password', label: 'Password Correct', description: 'Player enters correct password' },
  { value: 'app_opened', label: 'App Opened', description: 'Player opens a specific app' },
  { value: 'folder_opened', label: 'Folder Opened', description: 'Player opens a specific folder' },
]

export function RuleTypePicker({ onSelectType }: RuleTypePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {RULE_TYPES.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onSelectType(type.value)}
          className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
        >
          <h4 className="font-medium text-sm text-gray-900">{type.label}</h4>
          <p className="text-xs text-gray-600 mt-1">{type.description}</p>
        </button>
      ))}
    </div>
  )
}
