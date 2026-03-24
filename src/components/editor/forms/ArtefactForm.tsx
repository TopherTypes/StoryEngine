import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../common/Button'
import { CommonArtefactFields } from './CommonArtefactFields'
import { EmailFields } from './EmailFields'
import { IMFields } from './IMFields'
import { CalendarFields } from './CalendarFields'
import { DocumentFields } from './DocumentFields'
import { ImageFields } from './ImageFields'
import { AudioFields } from './AudioFields'
import { ReleaseConfigSection } from './ReleaseConfigSection'
import { LockConfigSection } from './LockConfigSection'
import { ArtefactSchema } from '../../../schemas'
import type { Artefact, ArtefactType } from '../../../types'

interface ArtefactFormProps {
  type: ArtefactType
  initialData?: Artefact
  onSubmit: (data: Artefact) => void
  onCancel: () => void
  isSubmitting?: boolean
  threads?: { id: string; subject: string }[]
  conversations?: { id: string; participants: string[] }[]
  senders?: { id: string; name: string; email: string }[]
  participants?: { id: string; name: string }[]
}

export function ArtefactForm({
  type,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  threads = [],
  conversations = [],
  senders = [],
  participants = [],
}: ArtefactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<Artefact>({
    resolver: zodResolver(ArtefactSchema),
    defaultValues: initialData,
  })

  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'email':
        return <EmailFields register={register as any} isSubmitting={isSubmitting} senders={senders} threads={threads} />
      case 'im':
        return <IMFields register={register as any} isSubmitting={isSubmitting} conversations={conversations} participants={participants} />
      case 'calendar':
        return <CalendarFields register={register as any} isSubmitting={isSubmitting} />
      case 'document':
        return <DocumentFields register={register as any} isSubmitting={isSubmitting} />
      case 'image':
        return <ImageFields register={register as any} isSubmitting={isSubmitting} />
      case 'audio':
        return <AudioFields register={register as any} isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CommonArtefactFields register={register as any} isSubmitting={isSubmitting} />

      {renderTypeSpecificFields()}

      <ReleaseConfigSection register={register as any} control={control} isSubmitting={isSubmitting} />

      <LockConfigSection register={register as any} control={control} isSubmitting={isSubmitting} />

      {/* Form errors summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
          <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([field, error]: [string, any]) => (
              <li key={field}>
                {field}: {error?.message || 'Invalid value'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 border-t pt-4">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Artefact' : 'Create Artefact'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
