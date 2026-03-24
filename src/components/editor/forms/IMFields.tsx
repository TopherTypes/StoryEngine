import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { IMArtefact } from '../../../types'

interface IMFieldsProps {
  register: UseFormRegister<IMArtefact>
  isSubmitting: boolean
  conversations: { id: string; participants: string[] }[]
  participants: { id: string; name: string }[]
}

export function IMFields({ register, isSubmitting, conversations, participants }: IMFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Instant Message Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Conversation *</label>
        <select {...register('conversationId')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" disabled={isSubmitting}>
          <option value="">Select or create conversation</option>
          {conversations.map((conv) => (
            <option key={conv.id} value={conv.id}>
              {conv.participants.join(', ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Sender *</label>
        <select {...register('senderId')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" disabled={isSubmitting}>
          <option value="">Select sender</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Message Body *</label>
        <Textarea {...register('body')} className="mt-1" disabled={isSubmitting} placeholder="IM message content" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Display Order *</label>
        <Input type="number" {...register('displayOrder', { valueAsNumber: true })} className="mt-1" disabled={isSubmitting} placeholder="Position in conversation (0, 1, 2...)" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Display Timestamp (optional)</label>
        <Input {...register('timestamp')} className="mt-1" disabled={isSubmitting} placeholder="e.g., 14:30" />
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
