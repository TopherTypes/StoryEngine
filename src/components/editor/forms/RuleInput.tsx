import { Input } from '../../common/Input'
import type { TimeRule, ArtefactRule, PasswordRule, AppRule } from '../../../types'
import type { Artefact } from '../../../types'

type SingleRule = TimeRule | ArtefactRule | PasswordRule | AppRule

interface RuleInputProps {
  rule: SingleRule
  artefacts: Artefact[]
  onChange: (rule: SingleRule) => void
}

export function RuleInput({ rule, artefacts, onChange }: RuleInputProps) {
  if (rule.type === 'time') {
    return (
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Minutes</label>
          <Input
            type="number"
            value={(rule as TimeRule).minutes}
            onChange={(e) =>
              onChange({
                type: 'time',
                minutes: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            className="w-full"
          />
        </div>
      </div>
    )
  }

  if (rule.type === 'artefact_opened' || rule.type === 'artefact_read') {
    return (
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Artefact</label>
          <select
            value={(rule as ArtefactRule).artefactId}
            onChange={(e) =>
              onChange({
                type: rule.type,
                artefactId: e.target.value,
              } as ArtefactRule)
            }
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Select an artefact</option>
            {artefacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.type})
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  if (rule.type === 'password') {
    return (
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Password Key</label>
          <Input
            type="text"
            value={(rule as PasswordRule).passwordKey}
            onChange={(e) =>
              onChange({
                type: 'password',
                passwordKey: e.target.value,
              })
            }
            placeholder="e.g., unlock_code_1"
            className="w-full"
          />
        </div>
      </div>
    )
  }

  if (rule.type === 'app_opened' || rule.type === 'folder_opened') {
    return (
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">{rule.type === 'app_opened' ? 'App Name' : 'Folder Name'}</label>
          <Input
            type="text"
            value={(rule as AppRule).appName}
            onChange={(e) =>
              onChange({
                type: rule.type,
                appName: e.target.value,
              } as AppRule)
            }
            placeholder={rule.type === 'app_opened' ? 'e.g., Email, Chat' : 'e.g., Documents'}
            className="w-full"
          />
        </div>
      </div>
    )
  }

  return null
}
