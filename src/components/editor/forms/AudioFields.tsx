import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import type { AudioArtefact } from '../../../types'

interface AudioFieldsProps {
  register: UseFormRegister<AudioArtefact>
  isSubmitting: boolean
}

export function AudioFields({ register, isSubmitting }: AudioFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Audio Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Asset ID *</label>
        <Input {...register('assetId')} className="mt-1" disabled={isSubmitting} placeholder="Upload audio first, then select it here" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Title *</label>
        <Input {...register('title')} className="mt-1" disabled={isSubmitting} placeholder="Audio title or track name" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Duration (optional, seconds)</label>
        <Input type="number" {...register('duration', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} placeholder="e.g., 180" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Folder Path *</label>
        <Input {...register('folderPath')} className="mt-1" disabled={isSubmitting} placeholder="e.g., Music/ or Recordings/" />
      </div>
    </div>
  )
}
