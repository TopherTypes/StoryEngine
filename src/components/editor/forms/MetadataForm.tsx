import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStoryStore } from '../../../stores/storyStore'
import { useUIStore } from '../../../stores/uiStore'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import { Button } from '../../common/Button'

const MetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  author: z.string(),
  version: z.string().min(1, 'Version is required'),
})

type MetadataFormData = z.infer<typeof MetadataSchema>

export function MetadataForm() {
  const { getCurrentStory, updateStory } = useStoryStore()
  const { showToast } = useUIStore()
  const story = getCurrentStory()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(MetadataSchema),
    defaultValues: {
      title: story?.title || '',
      description: story?.description || '',
      author: story?.author || '',
      version: story?.version || '0.1.0',
    },
  })

  const onSubmit = useCallback(
    async (data: MetadataFormData) => {
      if (!story) {
        showToast('error', 'No story loaded')
        return
      }

      try {
        await updateStory({
          title: data.title,
          description: data.description,
          author: data.author,
          version: data.version,
        })
        showToast('success', 'Story metadata updated')
        reset(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update metadata'
        showToast('error', message)
      }
    },
    [story, updateStory, showToast, reset]
  )

  if (!story) {
    return <p className="text-gray-600">No story loaded</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900">Story Title *</label>
        <Input {...register('title')} className="mt-1" disabled={isSubmitting} />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Description</label>
        <Textarea {...register('description')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Author</label>
        <Input {...register('author')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Version</label>
        <Input {...register('version')} className="mt-1" disabled={isSubmitting} placeholder="0.1.0" />
        {errors.version && <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
