import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { Artefact } from '../../../types'

interface CommonArtefactFieldsProps {
  register: UseFormRegister<Artefact>
  isSubmitting: boolean
}

export function CommonArtefactFields({ register, isSubmitting }: CommonArtefactFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900">Internal Label *</label>
        <Input {...register('title')} className="mt-1" disabled={isSubmitting} placeholder="e.g., email_001" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Visible Title (Optional)</label>
        <Input {...register('visibleTitle')} className="mt-1" disabled={isSubmitting} placeholder="Display name shown to player" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Tags (comma-separated)</label>
        <Input {...register('tags')} className="mt-1" disabled={isSubmitting} placeholder="e.g., important, clue" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Creator Notes (Internal)</label>
        <Textarea {...register('notes')} className="mt-1" disabled={isSubmitting} placeholder="Notes for yourself - not shown to player" />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('readOnly')} className="rounded" disabled={isSubmitting} />
          Read-only (player cannot modify)
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('hidden')} className="rounded" disabled={isSubmitting} />
          Hidden until unlocked
        </label>
      </div>
    </div>
  )
}
