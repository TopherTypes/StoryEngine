import { useState } from 'react'
import { EndingForm } from '../forms/EndingForm'
import { useStoryStore } from '../../../stores/storyStore'
import type { EndingConfig } from '../../../types'

export function EndingTab() {
  const currentStory = useStoryStore((state) => state.getCurrentStory())
  const updateStory = useStoryStore((state) => state.updateStory)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  const handleSaveEnding = async (endingConfig: EndingConfig) => {
    setIsSubmitting(true)
    try {
      await updateStory({
        ...currentStory,
        ending: endingConfig,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ending Configuration</h3>
      <p className="text-sm text-gray-600 mb-6">Define what players see when they reach the ending and the conditions that trigger it.</p>
      <EndingForm initialData={currentStory.ending} onSubmit={handleSaveEnding} isSubmitting={isSubmitting} />
    </div>
  )
}
