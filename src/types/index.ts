/**
 * Core type definitions for StoryEngine
 * Based on SPECS.md technical specifications
 */

// ==================== ARTEFACT TYPES ====================

export type ArtefactType = 'email' | 'im' | 'calendar' | 'document' | 'image' | 'audio'

export interface BaseArtefact {
  id: string
  title: string
  visibleTitle?: string
  type: ArtefactType

  // Release & Unlock
  releaseAtTime?: number
  releaseTriggers?: ReleaseRule[]
  locked: boolean
  lockPassword?: string
  lockHint?: string

  // State tracking
  readOnly?: boolean
  hidden?: boolean

  // Metadata
  tags: string[]
  created: number
  modified: number
  notes?: string
}

export interface EmailArtefact extends BaseArtefact {
  type: 'email'
  sender: string
  recipients: string[]
  subject: string
  body: string
  threadId: string
  timestamp?: string
  hasAttachment: boolean
  attachments?: string[]
}

export interface IMArtefact extends BaseArtefact {
  type: 'im'
  conversationId: string
  senderId: string
  body: string
  displayOrder: number
  timestamp?: string
  hasAttachment: boolean
  attachments?: string[]
}

export interface CalendarArtefact extends BaseArtefact {
  type: 'calendar'
  eventTitle: string
  date: string
  time?: string
  description: string
  location?: string
  attendees?: string[]
  recurring?: string
}

export interface DocumentArtefact extends BaseArtefact {
  type: 'document'
  body: string
  assetId?: string
  folderPath: string
}

export interface ImageArtefact extends BaseArtefact {
  type: 'image'
  assetId: string
  caption?: string
  folderPath: string
}

export interface AudioArtefact extends BaseArtefact {
  type: 'audio'
  assetId: string
  title: string
  duration?: number
  folderPath: string
}

export type Artefact = EmailArtefact | IMArtefact | CalendarArtefact | DocumentArtefact | ImageArtefact | AudioArtefact

// ==================== RELEASE RULES ====================

export interface TimeRule {
  type: 'time'
  minutes: number
}

export interface ArtefactRule {
  type: 'artefact_opened' | 'artefact_read'
  artefactId: string
}

export interface PasswordRule {
  type: 'password'
  passwordKey: string
}

export interface AppRule {
  type: 'app_opened' | 'folder_opened'
  appName: string
}

export interface ConditionGroup {
  type: 'condition_group'
  operator: 'AND' | 'OR'
  rules: ReleaseRule[]
}

export type ReleaseRule = TimeRule | ArtefactRule | PasswordRule | AppRule | ConditionGroup

// ==================== STORY CONFIGURATION ====================

export interface ThemeConfig {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  fontSize: {
    small: number
    normal: number
    large: number
  }
  wallpaperUrl?: string
  taskbarPosition: 'top' | 'bottom' | 'left' | 'right'
  desktopIconSize: number
  osName: string
  appIcon?: string
}

export interface LoginConfig {
  enabled: boolean
  username: string
  password: string
  message?: string
  requireCredentials: boolean
}

export interface EndingVariant {
  id: string
  triggerConditions: ReleaseRule[]
  title: string
  body: string
  imageUrl?: string
}

export interface EndingConfig {
  id: string
  title: string
  description: string
  imageUrl?: string
  triggerConditions: ReleaseRule[]
  body: string
  allowContinueAfter: boolean
  allowRestart: boolean
  variants?: EndingVariant[]
}

export interface EmailSender {
  id: string
  name: string
  email: string
}

export interface IMParticipant {
  id: string
  name: string
  displayName?: string
}

export interface FileFolder {
  id: string
  name: string
  path: string
  parentId?: string
}

export interface CalendarConfig {
  id: string
  ownerName: string
}

export interface GlobalSettings {
  [key: string]: any
}

// ==================== STORY ====================

export interface Story {
  // Metadata
  id: string
  title: string
  description: string
  author: string
  version: string

  // Configuration
  theme: ThemeConfig
  login: LoginConfig
  ending: EndingConfig
  globalSettings?: GlobalSettings

  // Content
  artefacts: Artefact[]
  emailSenders: EmailSender[]
  imParticipants: IMParticipant[]
  fileStructure: FileFolder[]
  calendarConfig: CalendarConfig

  // Timestamps
  created: number
  modified: number
}

// ==================== PLAYER GAME STATE ====================

export interface PlayerGameState {
  // Identity
  storyId: string
  playerId?: string

  // Timing
  startTime: number
  currentSessionTime: number
  totalElapsedMinutes: number
  paused: boolean
  pausedAt?: number

  // Progress Tracking
  unlockedArtefactIds: Set<string>
  openedArtefactIds: Set<string>
  readArtefactIds: Set<string>
  viewedImages: Set<string>
  playedAudio: Set<string>

  // App/Folder Navigation
  visitedApps: Set<string>
  visitedFolders: Set<string>
  currentLocation?: string

  // Password Tracking
  unlockedPasswords: Map<string, string>

  // Ending State
  endingTriggered: boolean
  endingTriggeredAt?: number
  endingChoice?: string

  // Metadata
  createdAt: number
  lastPlayedAt: number
  totalPlayTime: number
  completionPercentage: number
}

// ==================== ASSET ====================

export interface Asset {
  id: string
  projectId: string
  filename: string
  type: 'image' | 'audio'
  size: number
  data: string // base64 encoded
  created: number
  mimeType: string
}

// ==================== VALIDATION ====================

export interface ValidationError {
  level: 'error' | 'warning'
  code: string
  message: string
  artefactId?: string
  suggestedFix?: string
}

// ==================== EMAIL/IM CONTAINERS ====================

export interface EmailThread {
  id: string
  subject: string
}

export interface IMConversation {
  id: string
  participants: string[]
}
