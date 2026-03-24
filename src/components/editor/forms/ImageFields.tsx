import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { ImageArtefact } from '../../../types'

interface ImageFieldsProps {
  register: UseFormRegister<ImageArtefact>
  isSubmitting: boolean
}

export function ImageFields({ register, isSubmitting }: ImageFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Image Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Asset ID *</label>
        <Input {...register('assetId')} className="mt-1" disabled={isSubmitting} placeholder="Upload an image first, then select it here" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Caption (optional)</label>
        <Textarea {...register('caption')} className="mt-1" disabled={isSubmitting} placeholder="Image caption or description" rows={3} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Folder Path *</label>
        <Input {...register('folderPath')} className="mt-1" disabled={isSubmitting} placeholder="e.g., Pictures/ or Desktop/photos/" />
      </div>
    </div>
  )
}
