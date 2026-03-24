import { Trash2, Edit2 } from 'lucide-react'
import type { Story } from '../../types'
import { Card, CardBody } from '../common/Card'
import { Button } from '../common/Button'
import { cn } from '../../utils/cn'

interface StoryCardProps {
  story: Story
  onEdit: (story: Story) => void
  onDelete: (storyId: string) => void
}

export function StoryCard({ story, onEdit, onDelete }: StoryCardProps) {
  const artefactCount = story.artefacts.length
  const emailCount = story.artefacts.filter((a) => a.type === 'email').length
  const imCount = story.artefacts.filter((a) => a.type === 'im').length
  const lockedCount = story.artefacts.filter((a) => a.locked).length
  const conditionCount = story.artefacts.filter((a) => a.releaseTriggers && a.releaseTriggers.length > 0).length

  const lastModified = new Date(story.modified).toLocaleDateString()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{story.description || 'No description'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Artefacts</p>
            <p className="text-xl font-bold text-gray-900">{artefactCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Author</p>
            <p className="text-sm font-medium text-gray-900 truncate">{story.author}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-blue-50 rounded p-2">
            <p className="text-xs text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{emailCount}</p>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <p className="text-xs text-gray-600">IM</p>
            <p className="font-semibold text-gray-900">{imCount}</p>
          </div>
          <div className="bg-red-50 rounded p-2">
            <p className="text-xs text-gray-600">Locked</p>
            <p className="font-semibold text-gray-900">{lockedCount}</p>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <p className="text-xs text-gray-600">Gated</p>
            <p className="font-semibold text-gray-900">{conditionCount}</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Modified {lastModified} • v{story.version}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(story)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(story.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
