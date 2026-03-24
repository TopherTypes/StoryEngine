import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import type { Story, ValidationError } from '../../types'

interface ValidationReportProps {
  story: Story
  errors: ValidationError[]
  warnings: ValidationError[]
}

const errorsByLevel = (items: ValidationError[], level: 'error' | 'warning') => items.filter((e) => e.level === level)

export function ValidationReport({ story, errors, warnings }: ValidationReportProps) {
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Total Artefacts</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{story.artefacts.length}</p>
        </div>
        <div className={`p-4 rounded-lg border ${hasErrors ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>Errors</p>
          <p className={`text-2xl font-bold mt-1 ${hasErrors ? 'text-red-900' : 'text-green-900'}`}>{errors.length}</p>
        </div>
        <div className={`p-4 rounded-lg border ${hasWarnings ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${hasWarnings ? 'text-yellow-600' : 'text-green-600'}`}>Warnings</p>
          <p className={`text-2xl font-bold mt-1 ${hasWarnings ? 'text-yellow-900' : 'text-green-900'}`}>{warnings.length}</p>
        </div>
      </div>

      {/* Errors */}
      {hasErrors && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Critical Errors</h3>
          </div>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-800 flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  {error.message}
                  {error.artefactId && ` (${error.artefactId})`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Warnings</h3>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-800 flex gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>
                  {warning.message}
                  {warning.artefactId && ` (${warning.artefactId})`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success */}
      {!hasErrors && !hasWarnings && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-900">Story is valid and ready to export!</p>
          </div>
        </div>
      )}

      {/* Validation Checklist */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Validation Checklist</h3>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span className={story.artefacts.length > 0 ? '✓' : '✗'}>All artefact IDs unique</span>
          </li>
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span>Email threads have ≥1 message</span>
          </li>
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span>IM conversations have ≥1 message</span>
          </li>
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span>Image/Audio artefacts have assets</span>
          </li>
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span>Locked items have passwords</span>
          </li>
          <li className="text-sm text-gray-700 flex items-center gap-2">
            <span>No circular dependencies</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
