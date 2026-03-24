import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { EmailArtefact } from '../../../types'

interface EmailFieldsProps {
  register: UseFormRegister<EmailArtefact>
  isSubmitting: boolean
  senders: { id: string; name: string; email: string }[]
  threads: { id: string; subject: string }[]
}

export function EmailFields({ register, isSubmitting, senders, threads }: EmailFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Email-Specific Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Sender *</label>
        <select {...register('sender')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" disabled={isSubmitting}>
          <option value="">Select a sender</option>
          {senders.map((sender) => (
            <option key={sender.id} value={sender.id}>
              {sender.name} &lt;{sender.email}&gt;
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Recipients (comma-separated emails)</label>
        <Input {...register('recipients')} className="mt-1" disabled={isSubmitting} placeholder="user@example.com, other@example.com" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Subject *</label>
        <Input {...register('subject')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Thread *</label>
        <select {...register('threadId')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" disabled={isSubmitting}>
          <option value="">Select or create thread</option>
          {threads.map((thread) => (
            <option key={thread.id} value={thread.id}>
              {thread.subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Body *</label>
        <Textarea {...register('body')} className="mt-1" disabled={isSubmitting} placeholder="Email content (HTML or plain text)" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Display Timestamp (optional)</label>
        <Input {...register('timestamp')} className="mt-1" disabled={isSubmitting} placeholder="e.g., 2024-03-24 14:30" />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" {...register('hasAttachment')} className="rounded" disabled={isSubmitting} />
          Has attachment(s)
        </label>
      </div>
    </div>
  )
}
