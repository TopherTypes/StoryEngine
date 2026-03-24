import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStoryStore } from '../../../stores/storyStore'
import { useUIStore } from '../../../stores/uiStore'
import { LoginConfigSchema } from '../../../schemas'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import { Button } from '../../common/Button'
import type { LoginConfig } from '../../../types'

export function LoginForm() {
  const { getCurrentStory, updateStory } = useStoryStore()
  const { showToast } = useUIStore()
  const story = getCurrentStory()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginConfig>({
    resolver: zodResolver(LoginConfigSchema),
    defaultValues: story?.login,
  })

  const onSubmit = useCallback(
    async (data: LoginConfig) => {
      if (!story) {
        showToast('error', 'No story loaded')
        return
      }

      try {
        await updateStory({ login: data })
        showToast('success', 'Login settings updated')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update login settings'
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
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('enabled')} className="rounded" />
          Enable login screen
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Username</label>
        <Input {...register('username')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Password</label>
        <Input type="password" {...register('password')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Welcome Message</label>
        <Textarea {...register('message')} className="mt-1" disabled={isSubmitting} placeholder="Message displayed on login screen" />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('requireCredentials')} className="rounded" />
          Require correct credentials to proceed
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Login Settings'}
      </Button>
    </form>
  )
}
