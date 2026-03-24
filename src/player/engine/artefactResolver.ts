/**
 * Artefact Resolver
 * Filters and organizes artefacts for display in apps
 */

import type { Story, Artefact, EmailArtefact, IMArtefact, CalendarArtefact, DocumentArtefact, ImageArtefact, AudioArtefact, PlayerGameState } from '../../types'
import { getUnlockedArtefactsForPlayer } from './playerProgressionEngine'

/**
 * Get email artefacts grouped by thread
 */
export function getEmailThreads(story: Story, playerState: PlayerGameState) {
  const emails = getUnlockedArtefactsForPlayer(story, playerState).filter(
    (a) => a.type === 'email'
  ) as EmailArtefact[]

  const threads = new Map<string, EmailArtefact[]>()
  emails.forEach((email) => {
    const threadId = email.threadId
    if (!threads.has(threadId)) {
      threads.set(threadId, [])
    }
    threads.get(threadId)!.push(email)
  })

  // Sort emails within threads by timestamp or displayOrder
  threads.forEach((emails) => {
    emails.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return aTime - bTime
    })
  })

  return threads
}

/**
 * Get IM conversations grouped by conversationId
 */
export function getIMConversations(story: Story, playerState: PlayerGameState) {
  const messages = getUnlockedArtefactsForPlayer(story, playerState).filter(
    (a) => a.type === 'im'
  ) as IMArtefact[]

  const conversations = new Map<string, IMArtefact[]>()
  messages.forEach((msg) => {
    const convId = msg.conversationId
    if (!conversations.has(convId)) {
      conversations.set(convId, [])
    }
    conversations.get(convId)!.push(msg)
  })

  // Sort messages within conversations by displayOrder
  conversations.forEach((msgs) => {
    msgs.sort((a, b) => a.displayOrder - b.displayOrder)
  })

  return conversations
}

/**
 * Get calendar events
 */
export function getCalendarEvents(story: Story, playerState: PlayerGameState): CalendarArtefact[] {
  const events = getUnlockedArtefactsForPlayer(story, playerState).filter(
    (a) => a.type === 'calendar'
  ) as CalendarArtefact[]

  // Sort by date
  events.sort((a, b) => {
    const aDate = new Date(a.date).getTime()
    const bDate = new Date(b.date).getTime()
    return aDate - bDate
  })

  return events
}

/**
 * Get file structure with unlocked files only
 */
export function getFileStructure(story: Story, playerState: PlayerGameState) {
  const unlockedArtefacts = getUnlockedArtefactsForPlayer(story, playerState)

  // Create file tree
  const files = new Map<string, Artefact[]>()

  unlockedArtefacts.forEach((artefact) => {
    if (['document', 'image', 'audio'].includes(artefact.type)) {
      const folderPath = (artefact as DocumentArtefact | ImageArtefact | AudioArtefact).folderPath || '/'
      if (!files.has(folderPath)) {
        files.set(folderPath, [])
      }
      files.get(folderPath)!.push(artefact)
    }
  })

  return files
}

/**
 * Get artefact by ID
 */
export function getArtefactById(story: Story, artefactId: string): Artefact | null {
  return story.artefacts.find((a) => a.id === artefactId) || null
}

/**
 * Get parent folder for a given path
 */
export function getParentFolder(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (parts.length <= 1) return '/'
  parts.pop()
  return '/' + parts.join('/')
}

/**
 * Get folder contents
 */
export function getFolderContents(
  folderPath: string,
  fileStructure: Map<string, Artefact[]>
): Artefact[] {
  return fileStructure.get(folderPath) || []
}

/**
 * Get all subfolders for a given folder
 */
export function getSubfolders(folderPath: string, fileStructure: Map<string, Artefact[]>): string[] {
  const prefix = folderPath === '/' ? '/' : folderPath + '/'
  const subfolders = new Set<string>()

  fileStructure.forEach((_, path) => {
    if (path.startsWith(prefix) && path !== folderPath) {
      const remaining = path.slice(prefix.length)
      const firstPart = remaining.split('/')[0]
      if (firstPart) {
        subfolders.add(prefix + firstPart)
      }
    }
  })

  return Array.from(subfolders).sort()
}
