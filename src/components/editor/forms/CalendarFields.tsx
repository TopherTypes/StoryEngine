import { UseFormRegister } from 'react-hook-form'
import { Input } from '../../common/Input'
import { Textarea } from '../../common/Textarea'
import type { CalendarArtefact } from '../../../types'

interface CalendarFieldsProps {
  register: UseFormRegister<CalendarArtefact>
  isSubmitting: boolean
}

export function CalendarFields({ register, isSubmitting }: CalendarFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-900">Calendar Event Fields</h4>

      <div>
        <label className="block text-sm font-medium text-gray-900">Event Title *</label>
        <Input {...register('eventTitle')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Date (YYYY-MM-DD) *</label>
          <Input type="date" {...register('date')} className="mt-1" disabled={isSubmitting} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Time (HH:MM, optional)</label>
          <Input type="time" {...register('time')} className="mt-1" disabled={isSubmitting} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Description</label>
        <Textarea {...register('description')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Location (optional)</label>
        <Input {...register('location')} className="mt-1" disabled={isSubmitting} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Attendees (comma-separated names)</label>
        <Input {...register('attendees')} className="mt-1" disabled={isSubmitting} placeholder="John, Jane, Bob" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">Recurring Rule (RRULE, optional)</label>
        <Input {...register('recurring')} className="mt-1" disabled={isSubmitting} placeholder="e.g., RRULE:FREQ=WEEKLY;BYDAY=MO" />
      </div>
    </div>
  )
}
