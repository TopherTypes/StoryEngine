import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStoryStore } from '../../../stores/storyStore'
import { useUIStore } from '../../../stores/uiStore'
import { ThemeConfigSchema } from '../../../schemas'
import { Input } from '../../common/Input'
import { Button } from '../../common/Button'
import type { ThemeConfig } from '../../../types'

export function ThemeForm() {
  const { getCurrentStory, updateStory } = useStoryStore()
  const { showToast } = useUIStore()
  const story = getCurrentStory()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<ThemeConfig>({
    resolver: zodResolver(ThemeConfigSchema),
    defaultValues: story?.theme,
  })

  const formData = watch()

  const onSubmit = useCallback(
    async (data: ThemeConfig) => {
      if (!story) {
        showToast('error', 'No story loaded')
        return
      }

      try {
        await updateStory({ theme: data })
        showToast('success', 'Theme updated')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update theme'
        showToast('error', message)
      }
    },
    [story, updateStory, showToast]
  )

  if (!story) {
    return <p className="text-gray-600">No story loaded</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Primary Color</label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" {...register('primaryColor')} className="h-10 w-16 p-1" disabled={isSubmitting} />
            <Input type="text" {...register('primaryColor')} className="flex-1" disabled={isSubmitting} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Accent Color</label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" {...register('accentColor')} className="h-10 w-16 p-1" disabled={isSubmitting} />
            <Input type="text" {...register('accentColor')} className="flex-1" disabled={isSubmitting} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Background Color</label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" {...register('backgroundColor')} className="h-10 w-16 p-1" disabled={isSubmitting} />
            <Input type="text" {...register('backgroundColor')} className="flex-1" disabled={isSubmitting} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Text Color</label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" {...register('textColor')} className="h-10 w-16 p-1" disabled={isSubmitting} />
            <Input type="text" {...register('textColor')} className="flex-1" disabled={isSubmitting} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Font Family</label>
        <Input {...register('fontFamily')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Small Font Size</label>
          <Input type="number" {...register('fontSize.small', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Normal Font Size</label>
          <Input type="number" {...register('fontSize.normal', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Large Font Size</label>
          <Input type="number" {...register('fontSize.large', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">OS Name</label>
        <Input {...register('osName')} className="mt-1" disabled={isSubmitting} placeholder="e.g., DesktopOS" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Taskbar Position</label>
        <select {...register('taskbarPosition')} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2" disabled={isSubmitting}>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Desktop Icon Size (pixels)</label>
        <Input type="number" {...register('desktopIconSize', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Theme'}
      </Button>
    </form>
  )
}
