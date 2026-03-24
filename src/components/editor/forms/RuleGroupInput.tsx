import { useState } from 'react'
import { Button } from '../../common/Button'
import { RuleInput } from './RuleInput'
import { RuleTypePicker } from './RuleTypePicker'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ConditionGroup, ReleaseRule } from '../../../types'
import type { Artefact } from '../../../types'

interface RuleGroupInputProps {
  group: ConditionGroup
  artefacts: Artefact[]
  onChangeGroup: (group: ConditionGroup) => void
  onRemove?: () => void
  depth?: number
}

export function RuleGroupInput({ group, artefacts, onChangeGroup, onRemove, depth = 0 }: RuleGroupInputProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set())

  const toggleRuleExpanded = (index: number) => {
    const newSet = new Set(expandedRules)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setExpandedRules(newSet)
  }

  const handleAddRule = (type: ReleaseRule['type']) => {
    let newRule: ReleaseRule

    if (type === 'condition_group') {
      newRule = {
        type: 'condition_group',
        operator: 'AND',
        rules: [],
      }
    } else if (type === 'time') {
      newRule = { type: 'time', minutes: 0 }
    } else if (type === 'artefact_opened' || type === 'artefact_read') {
      newRule = { type, artefactId: '' }
    } else if (type === 'password') {
      newRule = { type: 'password', passwordKey: '' }
    } else {
      newRule = { type, appName: '' }
    }

    onChangeGroup({
      ...group,
      rules: [...group.rules, newRule],
    })
    setShowAddMenu(false)
  }

  const handleUpdateRule = (index: number, rule: ReleaseRule) => {
    const newRules = [...group.rules]
    newRules[index] = rule
    onChangeGroup({ ...group, rules: newRules })
  }

  const handleRemoveRule = (index: number) => {
    onChangeGroup({
      ...group,
      rules: group.rules.filter((_, i) => i !== index),
    })
  }

  const indent = depth > 0 ? 'ml-4 border-l-2 border-gray-300 pl-4' : ''

  return (
    <div className={`space-y-3 p-3 bg-gray-50 rounded-lg ${indent}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">Condition Group</label>
          <select
            value={group.operator}
            onChange={(e) => onChangeGroup({ ...group, operator: e.target.value as 'AND' | 'OR' })}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium"
          >
            <option value="AND">AND (all must be true)</option>
            <option value="OR">OR (any can be true)</option>
          </select>
        </div>
        {onRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove} className="p-1 h-auto text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {group.rules.length === 0 ? (
        <p className="text-xs text-gray-600 italic">No rules yet. Add one below.</p>
      ) : (
        <div className="space-y-2">
          {group.rules.map((rule, index) => (
            <div key={index} className="p-2 bg-white rounded border border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {rule.type === 'condition_group' ? (
                    <RuleGroupInput
                      group={rule}
                      artefacts={artefacts}
                      onChangeGroup={(updated) => handleUpdateRule(index, updated)}
                      onRemove={() => handleRemoveRule(index)}
                      depth={depth + 1}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {rule.type === 'time' ? 'Time' : rule.type === 'password' ? 'Password' : rule.type === 'artefact_opened' ? 'Artefact Opened' : rule.type === 'artefact_read' ? 'Artefact Read' : rule.type === 'app_opened' ? 'App Opened' : 'Folder Opened'}
                        </span>
                      </div>
                      {expandedRules.has(index) && (
                        <div className="mt-2">
                          <RuleInput
                            rule={rule as any}
                            artefacts={artefacts}
                            onChange={(updated) => handleUpdateRule(index, updated)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                {rule.type !== 'condition_group' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleRuleExpanded(index)}
                    className="p-1 h-auto text-gray-600"
                  >
                    {expandedRules.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveRule(index)}
                  className="p-1 h-auto text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showAddMenu ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddMenu(true)} className="w-full gap-2 text-blue-600">
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      ) : (
        <div className="p-2 bg-white rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Select rule type:</p>
          <RuleTypePicker onSelectType={handleAddRule} />
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddMenu(false)} className="w-full mt-2 text-gray-600">
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
