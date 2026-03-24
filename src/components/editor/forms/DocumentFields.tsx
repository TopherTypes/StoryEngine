import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { DocumentArtefact } from '../../../types'

interface DocumentFieldsProps {
  register: UseFormRegister<DocumentArtefact>
  isSubmitting: boolean
}

export function DocumentFields({ register, isSubmitting }: DocumentFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Document Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Body *</label>
        <Textarea {...register('body')} className="mt-1 font-mono" disabled={isSubmitting} placeholder="Document content" rows={8} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Asset ID (optional)</label>
        <Input {...register('assetId')} className="mt-1" disabled={isSubmitting} placeholder="Reference an uploaded document/file" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Folder Path *</label>
        <Input {...register('folderPath')} className="mt-1" disabled={isSubmitting} placeholder="e.g., Documents/ or Desktop/work/" />
      </div>
    </div>
  )
}
