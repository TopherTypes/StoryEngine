import { useState } from 'react'
import { Download } from 'lucide-react'
import { ValidationReport } from '../ValidationReport'
import { Button } from '../../common/Button'
import { useStoryStore } from '../../../stores/storyStore'
import { validateStory } from '../../../utils/storyValidation'

export function ValidateTab() {
  const currentStory = useStoryStore((state) => state.getCurrentStory())
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateStory> | null>(null)

  if (!currentStory) {
    return <div className="p-8 text-center text-gray-600">No story loaded</div>
  }

  const handleValidate = () => {
    const result = validateStory(currentStory)
    setValidationResult(result)
  }

  const handleExport = () => {
    if (validationResult && validationResult.errors.length > 0) {
      alert('Cannot export: Fix all critical errors first')
      return
    }

    const storyJSON = JSON.stringify(currentStory, null, 2)
    const blob = new Blob([storyJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentStory.title || 'story'}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Story Validation & Export</h3>
        <p className="text-sm text-gray-600 mb-4">Validate your story for errors and export as JSON</p>

        <div className="flex gap-3">
          <Button onClick={handleValidate} size="sm">
            Run Validation
          </Button>
          <Button
            onClick={handleExport}
            disabled={!validationResult || validationResult.errors.length > 0}
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export as JSON
          </Button>
        </div>
      </div>

      {validationResult && (
        <ValidationReport
          story={currentStory}
          errors={validationResult.errors}
          warnings={validationResult.warnings}
        />
      )}

      {!validationResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Click "Run Validation" to check your story for errors and warnings</p>
        </div>
      )}
    </div>
  )
}
