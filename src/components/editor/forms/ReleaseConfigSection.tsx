import { UseFormRegister, useFieldArray, Controller } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Button } from '../../common/Button'
import { Plus, Trash2 } from 'lucide-react'
import type { Artefact } from '../../../types'

interface ReleaseConfigSectionProps {
  register: UseFormRegister<Artefact>
  control: any // FormControl type from react-hook-form
  isSubmitting: boolean
}

export function ReleaseConfigSection({ register, control, isSubmitting }: ReleaseConfigSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'releaseTriggers',
  })

  const handleAddRule = () => {
    append({ type: 'time', minutes: 0 } as any)
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Release Configuration</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Release Time (optional)</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            {...register('releaseAtTime', { valueAsNumber: true })}
            className="mt-1"
            disabled={isSubmitting}
            placeholder="Minutes from start (e.g., 5)"
          />
          <span className="text-sm text-gray-600 mt-1">minutes</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Leave blank for immediate release</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-900">Additional Release Conditions (optional)</label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleAddRule}
            disabled={isSubmitting}
            className="p-1 h-auto text-blue-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-3">Note: Full condition builder coming in next phase. Currently simplified.</p>

        {fields.length === 0 ? (
          <p className="text-sm text-gray-600">No additional conditions. Item will release at specified time above.</p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Condition Type</label>
                  <select
                    {...register(`releaseTriggers.${index}.type` as const)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    disabled={isSubmitting}
                  >
                    <option value="time">Time-based</option>
                    <option value="artefact_opened">Artefact Opened</option>
                    <option value="artefact_read">Artefact Read</option>
                    <option value="password">Password Correct</option>
                    <option value="app_opened">App Opened</option>
                    <option value="folder_opened">Folder Opened</option>
                  </select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                  className="p-1 h-auto text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
