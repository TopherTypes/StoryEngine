import { RuleGroupInput } from './RuleGroupInput'
import type { ReleaseRule, ConditionGroup, Artefact } from '../../../types'

interface ConditionBuilderProps {
  conditions: ReleaseRule[]
  artefacts: Artefact[]
  onChange: (conditions: ReleaseRule[]) => void
  title?: string
  description?: string
}

export function ConditionBuilder({
  conditions,
  artefacts,
  onChange,
  title = 'Release Conditions',
  description = 'Define when this artefact becomes available',
}: ConditionBuilderProps) {
  const handleUpdateGroup = (index: number, group: ConditionGroup) => {
    const newConditions = [...conditions]
    newConditions[index] = group
    onChange(newConditions)
  }

  const handleRemoveGroup = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index))
  }

  // Filter to only show condition groups
  const groups = conditions.filter((c): c is ConditionGroup => c.type === 'condition_group')

  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium text-gray-900">{title}</h4>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {groups.length === 0 ? (
        <p className="text-sm text-gray-600 italic">No conditions set. Item releases immediately.</p>
      ) : (
        <div className="space-y-3">
          {groups.map((group, index) => (
            <RuleGroupInput
              key={index}
              group={group}
              artefacts={artefacts}
              onChangeGroup={(updated) => handleUpdateGroup(index, updated)}
              onRemove={() => handleRemoveGroup(index)}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
