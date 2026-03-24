/**
 * ID generation utilities
 */

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}_${timestamp}${random}`
}

export function generateStoryId(): string {
  return generateId('story')
}

export function generateArtefactId(type: string): string {
  return generateId(`art_${type}`)
}

export function generateAssetId(filename: string): string {
  const ext = filename.split('.').pop() || ''
  return generateId(`asset_${ext}`)
}

export function generateEmailThreadId(): string {
  return generateId('thread')
}

export function generateIMConversationId(): string {
  return generateId('conv')
}

export function generateSenderId(): string {
  return generateId('sender')
}

export function generateParticipantId(): string {
  return generateId('participant')
}

export function generateFolderId(): string {
  return generateId('folder')
}
