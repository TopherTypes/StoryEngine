import { UseFormRegister, useWatch } from 'react-hook-form'
import { Input } from '../../common/Input'
import type { Artefact } from '../../../types'

interface LockConfigSectionProps {
  register: UseFormRegister<Artefact>
  control: any // FormControl type from react-hook-form
  isSubmitting: boolean
}

export function LockConfigSection({ register, control, isSubmitting }: LockConfigSectionProps) {
  const locked = useWatch({
    control,
    name: 'locked',
  })

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Lock Configuration</h4>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('locked')} className="rounded" disabled={isSubmitting} />
          Lock this artefact
        </label>
        <p className="text-xs text-gray-500 mt-1">Player must enter password to unlock</p>
      </div>

      {locked && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900">Lock Password *</label>
            <Input
              {...register('lockPassword')}
              className="mt-1"
              disabled={isSubmitting}
              placeholder="e.g., correct_answer123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Unlock Hint (optional)</label>
            <Input
              {...register('lockHint')}
              className="mt-1"
              disabled={isSubmitting}
              placeholder="e.g., Check the document for the code"
            />
          </div>
        </>
      )}
    </div>
  )
}
