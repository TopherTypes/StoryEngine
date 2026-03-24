import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import { Button } from '../../common/Button'
import { ConditionBuilder } from './ConditionBuilder'
import { EndingConfigSchema } from '../../../schemas'
import { useStoryStore } from '../../../stores/storyStore'
import type { EndingConfig, ConditionGroup } from '../../../types'

interface EndingFormProps {
  initialData?: EndingConfig
  onSubmit: (data: EndingConfig) => void
  isSubmitting?: boolean
}

export function EndingForm({ initialData, onSubmit, isSubmitting = false }: EndingFormProps) {
  const currentStory = useStoryStore((state) => state.getCurrentStory())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EndingConfig>({
    resolver: zodResolver(EndingConfigSchema),
    defaultValues: initialData,
  })

  const triggerConditions = watch('triggerConditions')

  const handleConditionsChange = (conditions: any[]) => {
    setValue('triggerConditions', conditions)
  }

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900">Ending Title *</label>
        <Input {...register('title')} className="mt-1" disabled={isSubmitting} placeholder="e.g., Mystery Solved" />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Description *</label>
        <Textarea {...register('description')} className="mt-1" disabled={isSubmitting} placeholder="Brief description of this ending" rows={3} />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Ending Image (optional)</label>
        <Input {...register('imageUrl')} className="mt-1" disabled={isSubmitting} placeholder="https://example.com/image.jpg" type="url" />
        {errors.imageUrl && <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>}
      </div>

      <div className="border-t pt-4">
        <ConditionBuilder
          conditions={triggerConditions || []}
          artefacts={currentStory.artefacts}
          onChange={handleConditionsChange}
          title="Ending Trigger Conditions"
          description="Define when players reach this ending"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Ending Text Body *</label>
        <Textarea
          {...register('body')}
          className="mt-1 font-mono"
          disabled={isSubmitting}
          placeholder="Markdown supported. This is what players see when they reach this ending."
          rows={6}
        />
        {errors.body && <p className="text-sm text-red-600 mt-1">{errors.body.message}</p>}
      </div>

      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('allowContinueAfter')} className="rounded" disabled={isSubmitting} />
          Allow player to continue after ending
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('allowRestart')} className="rounded" disabled={isSubmitting} />
          Allow player to restart from this ending
        </label>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">Please fix errors above</p>
        </div>
      )}

      <div className="flex gap-3 border-t pt-4">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving...' : 'Save Ending'}
        </Button>
      </div>
    </form>
  )
}
