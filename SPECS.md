# Technical Specifications

## Core Data Structures

### Story Object

Complete story definition that serves as input to the Player app.

```typescript
interface Story {
  // Metadata
  id: string                        // Unique story identifier
  title: string                     // Display title
  description: string               // Long-form description
  author: string                    // Creator name
  version: string                   // Version number (semver)

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

  // Metadata
  created: number                   // Timestamp
  modified: number                  // Timestamp
}
```

### Artefact Types

#### Email Message

```typescript
interface EmailArtefact extends BaseArtefact {
  type: "email"
  sender: string                    // Reference to EmailSender.id
  recipients: string[]              // Recipient addresses (display)
  subject: string                   // Email subject line
  body: string                      // HTML or plain text
  threadId: string                  // Which thread this belongs to
  timestamp?: string                // Display timestamp
  hasAttachment: boolean
  attachments?: string[]            // Asset IDs
}
```

#### Instant Message

```typescript
interface IMArtefact extends BaseArtefact {
  type: "im"
  conversationId: string            // Which conversation
  senderId: string                  // Reference to IMParticipant.id
  body: string                      // Message text
  displayOrder: number              // Position in conversation (chronological)
  timestamp?: string                // Display timestamp
  hasAttachment: boolean
  attachments?: string[]
}
```

#### Calendar Entry

```typescript
interface CalendarArtefact extends BaseArtefact {
  type: "calendar"
  eventTitle: string
  date: string                      // YYYY-MM-DD
  time?: string                     // HH:MM (optional)
  description: string               // Event details
  location?: string
  attendees?: string[]              // Participant names
  recurring?: string                // RRULE format (optional)
}
```

#### Text Document

```typescript
interface DocumentArtefact extends BaseArtefact {
  type: "document"
  body: string                      // Markdown or plain text
  assetId?: string                  // Reference to uploaded file
  folderPath: string                // Path in file explorer
}
```

#### Image

```typescript
interface ImageArtefact extends BaseArtefact {
  type: "image"
  assetId: string                   // Required: reference to image asset
  caption?: string
  folderPath: string                // Path in file explorer
}
```

#### Audio

```typescript
interface AudioArtefact extends BaseArtefact {
  type: "audio"
  assetId: string                   // Required: reference to audio asset
  title: string
  duration?: number                 // Seconds
  folderPath: string                // Path in file explorer
}
```

#### Base Artefact (Common to All)

```typescript
interface BaseArtefact {
  id: string                        // Unique per story
  title: string                     // Internal label (not shown to player)
  visibleTitle?: string             // Override for display
  type: ArtefactType

  // Release & Unlock
  releaseAtTime?: number            // Minutes from story start (null = always available)
  releaseTriggers?: ReleaseRule[]   // Additional unlock conditions
  locked: boolean                   // Is this password-protected?
  lockPassword?: string             // Password required (if locked)
  lockHint?: string                 // Discoverable hint (optional)

  // State tracking
  readOnly?: boolean                // Player cannot modify
  hidden?: boolean                  // Completely hidden until unlocked

  // Metadata
  tags: string[]                    // For organization
  created: number                   // Timestamp
  modified: number                  // Timestamp
  notes?: string                    // Creator notes (not shown to player)
}
```

### Support Types

#### IM Participant

```typescript
interface IMParticipant {
  id: string                        // Unique identifier
  type: "participant"               // Entity type
  username: string                  // Handle/username
  displayName: string               // Display name in chat
  profilePicture?: string           // Base64 or data URI for avatar (optional)
}
```

#### IM Conversation

```typescript
interface IMConversation {
  id: string                        // Unique conversation ID
  name: string                      // Conversation/group name
}
```

#### Email Sender

```typescript
interface EmailSender {
  id: string                        // Unique identifier
  name: string                      // Sender display name
  email: string                     // Sender email address
  domain?: string                   // Email domain (optional)
}
```

### Release Rules & Conditions

```typescript
type ReleaseRule =
  | TimeRule
  | ArtefactRule
  | PasswordRule
  | AppRule
  | ConditionGroup

interface TimeRule {
  type: "time"
  minutes: number                   // Unlock after this many minutes
}

interface ArtefactRule {
  type: "artefact_opened" | "artefact_read"
  artefactId: string
}

interface PasswordRule {
  type: "password"
  passwordKey: string               // Which password (for tracking)
}

interface AppRule {
  type: "app_opened" | "folder_opened"
  appName: string                   // "email", "im", "calendar", etc.
}

interface ConditionGroup {
  type: "condition_group"
  operator: "AND" | "OR"
  rules: ReleaseRule[]
}
```

### Player Runtime State

Persisted in IndexedDB; represents player progress.

```typescript
interface PlayerGameState {
  // Identity
  storyId: string
  playerId?: string                 // Optional player identifier

  // Timing
  startTime: number                 // Unix timestamp when player started
  currentSessionTime: number        // Unix timestamp of current session
  totalElapsedMinutes: number       // Calculated elapsed story time
  paused: boolean
  pausedAt?: number

  // Progress Tracking
  unlockedArtefactIds: Set<string>  // IDs of unlocked content
  openedArtefactIds: Set<string>    // User opened at least once
  readArtefactIds: Set<string>      // User read/viewed to completion
  viewedImages: Set<string>         // Images fully viewed
  playedAudio: Set<string>          // Audio fully played

  // App/Folder Navigation
  visitedApps: Set<string>          // Apps user has opened
  visitedFolders: Set<string>       // Folders user has browsed
  currentLocation?: string          // Where is player right now

  // Password Tracking
  unlockedPasswords: Map<string, string>  // passwordKey → password entered

  // Ending State
  endingTriggered: boolean
  endingTriggeredAt?: number        // Time when ending condition met
  endingChoice?: string             // If multiple endings, which chosen

  // Metadata
  createdAt: number
  lastPlayedAt: number
  totalPlayTime: number             // Minutes played total
  completionPercentage: number      // 0-100
}
```

## Progression Engine

### Core Algorithm

The progression engine determines what content is available to the player at any given moment.

```
For each artefact in story:
  1. Check if unlocked by any existing rules
  2. If locked:
     - Show as available only to authorized users
     - Require password entry
  3. If release rules exist:
     - Evaluate all rules against current state
     - If ANY rule matches (OR logic) OR all rules match (AND logic):
       - Mark as unlocked
       - Make available for viewing
  4. Track state:
     - Remember which artefacts player has opened
     - Remember which user has read/viewed
     - Update session time
     - Save to IndexedDB
```

### Release Evaluation Rules

**Time-based Release**
```
if (currentElapsedMinutes >= artefact.releaseAtTime)
  → artefact is available
```

**Interaction-based Release**
```
if (artefact.releaseTriggers.some(rule => evaluateRule(rule, state)))
  → artefact is available
```

**AND/OR Logic**
```
AND group: all sub-rules must be true
OR group:  at least one sub-rule must be true
```

### Example Progression Chains

**Simple timed reveal:**
```
Email arrives at 10 minutes
→ Player can read it
```

**Gated reveal:**
```
Email is available
Email requires "open email_001" trigger
→ Email hidden until player opens email_001
→ After opening email_001, email becomes visible
```

**Complex chain:**
```
File requires: (10 minutes elapsed) AND (email_003 opened)
→ Available only after 10 minutes have passed AND player opened email_003
```

## Session Time Model

### Calculation

```typescript
function getElapsedMinutes(state: PlayerGameState): number {
  const now = Date.now()
  const sessionStart = state.startTime
  return Math.floor((now - sessionStart) / 60000)
}
```

### Persistence Across Sessions

```typescript
// Save on exit
savedState = {
  startTime: original_start_time,  // Never changes
  currentSessionTime: Date.now(),  // Updated each session
}

// On resume, recalculate elapsed from original start
function getElapsedMinutesFromStart(state): number {
  return Math.floor((Date.now() - state.startTime) / 60000)
}
```

## Password Locking

### Lock Definitions

```typescript
interface PasswordLock {
  lockId: string                    // e.g., "lock_medical_folder"
  password: string                  // Plaintext (v1 simplicity)
  hint?: string                     // Discoverable elsewhere
  maxAttempts?: number              // Optional: prevent brute-force (v1 simple)
}
```

### Validation Flow

```
Player requests locked artefact
→ Show password prompt
→ Player enters password
→ Compare to lock.password (case-sensitive recommended)
→ If match: record in state.unlockedPasswords, unlock artefact
→ If mismatch: show "incorrect" message, keep locked
```

## Ending System

### Ending Configuration

```typescript
interface EndingConfig {
  id: string
  title: string
  description: string
  imageUrl?: string                 // Optional ending screen image

  // Trigger
  triggerConditions: ReleaseRule[]  // Must ALL be true (AND logic)

  // Presentation
  body: string                      // Markdown ending text
  allowContinueAfter: boolean       // Can player keep exploring?
  allowRestart: boolean             // Show restart button?

  // Optional variations
  variants?: EndingVariant[]        // Multiple endings based on conditions
}

interface EndingVariant {
  id: string
  triggerConditions: ReleaseRule[]
  title: string
  body: string
  imageUrl?: string
}
```

### Ending Trigger Evaluation

```
Each frame/interaction:
  Check if ALL ending.triggerConditions are met
  If yes:
    - Set state.endingTriggered = true
    - Record endingTriggeredAt
    - Show ending screen
    - Optionally freeze gameplay or allow continuation
```

## Theme & Presentation Config

```typescript
interface ThemeConfig {
  // Colors
  primaryColor: string              // e.g., "#3498db"
  accentColor: string
  backgroundColor: string
  textColor: string

  // Typography
  fontFamily: string                // e.g., "system-ui"
  fontSize: {
    small: number
    normal: number
    large: number
  }

  // Desktop appearance
  wallpaperUrl?: string             // Desktop background image
  taskbarPosition: "top" | "bottom" | "left" | "right"
  desktopIconSize: number           // Pixels

  // Branding
  osName: string                    // e.g., "DesktopOS"
  appIcon?: string                  // Task icon style
}
```

## Login Configuration

```typescript
interface LoginConfig {
  enabled: boolean
  username: string                  // Default/hint username
  password: string                  // Default/hint password (for testing)
  message?: string                  // Welcome message
  requireCredentials: boolean       // Enforce login or just theatrical?
}
```

## Storage Requirements (IndexedDB)

### Database Schema

```
Database: "StoryEnginePlayer"
Version: 1

Object Stores:
  - "stories"           // Story JSON definitions
    keyPath: "id"
    indexes: ["title", "author"]

  - "gameSessions"      // Player progress records
    keyPath: "id"
    indexes: ["storyId", "playerId", "lastPlayedAt"]

  - "authoringProjects" // (Authoring tool only)
    keyPath: "id"
    indexes: ["title", "modified"]

  - "assets"            // (Authoring tool)
    keyPath: "id"
    indexes: ["projectId", "type"]
```

## Data Validation

### Story Validation Checklist

The authoring tool should validate:

- [ ] All artefact IDs are unique within story
- [ ] All release rule references point to existing artefacts/apps
- [ ] No circular dependencies in release rules
- [ ] All locked items have passwords defined
- [ ] Ending trigger conditions are satisfiable
- [ ] Email threads have at least one message
- [ ] IM conversations have at least one message
- [ ] Image/Audio artefacts have asset references
- [ ] Folder paths are valid (no duplicates)
- [ ] Timeline has no logical impossibilities

### Common Validation Errors

```
⚠️ Artefact "email_001" released at 10m but requires open("email_001")
   → Impossible condition: can't open before available

⚠️ Thread "support" has no messages
   → Will cause rendering errors

⚠️ Image "photo_01" missing asset
   → Cannot display

⚠️ Release rule references non-existent artefact_999
   → Will never evaluate correctly

✅ No errors - story is playable
```

## API Contracts

### Player App ↔ Story Data

**Input**: Story JSON object
**Output**: Rendered experience + persisted state

### Authoring Tool ↔ Story Export

**Output**: Serialized Story object + asset bundle

## Implementation Priorities (v1 MVP)

1. **Highest Priority**
   - Story & Artefact data model
   - Progression engine (time-based + trigger rules)
   - Player UI shells (desktop, apps)
   - All app viewers (email, IM, calendar, files, document, image, audio)
   - IndexedDB persistence

2. **High Priority**
   - Authoring tool UI (dashboard, artefact library, editor)
   - Condition builder
   - Password locking
   - Ending system
   - Preview mode

3. **Medium Priority**
   - Timeline view
   - Asset management
   - Validation system
   - UX polish

4. **Lower Priority (v2+)**
   - Multiple themes
   - Advanced preview features
   - Story import/export
   - Cloud sync

---

**Last Updated**: March 2026
**Status**: Pre-implementation specification
