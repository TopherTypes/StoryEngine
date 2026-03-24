# Architecture

## System Overview

StoryEngine consists of two independent browser-based applications that share a common data model:

```
┌─────────────────────────────────────────────────────────────┐
│              Story Authoring Tool                           │
│  (Desktop ARG Story Builder)                                │
│                                                             │
│  - Story metadata editor                                    │
│  - Artefact creation/management                             │
│  - Asset upload & association                               │
│  - Condition builder                                        │
│  - Timeline/release view                                    │
│  - Preview mode with test controls                          │
│                                                             │
│  Output: Structured Story Data                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Story JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Shared Data Model (Story)                     │
│                                                             │
│  - Story metadata & config                                  │
│  - Artefact definitions                                     │
│  - Release/gating rules                                     │
│  - Progression engine rules                                 │
│  - Asset references                                         │
│  - Ending trigger config                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Story JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Player App                                    │
│  (Desktop ARG Player)                                       │
│                                                             │
│  - Faux desktop shell                                       │
│  - Email, IM, Calendar, Files apps                          │
│  - Document/Image/Audio viewers                             │
│  - Progression engine (runtime)                             │
│  - Password lock system                                     │
│  - State persistence (IndexedDB)                            │
│                                                             │
│  Input: Story JSON                                          │
│  Runtime State: IndexedDB                                   │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Model

**v1 Approach**: Both applications are static, single-page applications deployable to GitHub Pages.

- **No backend required** for v1
- Story data embedded in build or provided as JSON
- All state managed client-side (IndexedDB)
- Suitable for hobby/independent game distribution

**Future**: Story data could be separated and loaded from external sources, enabling:
- Story bundles/packages
- Community story sharing
- Creator distribution platform

## Data Model

### Core Entities

#### Story
Top-level container for a complete playable experience.

```
Story {
  id: string
  title: string
  description: string
  author: string
  version: string

  // Presentation
  theme: ThemeConfig
  login: LoginConfig
  ending: EndingConfig

  // Content
  artefacts: Artefact[]
  senders: EmailSender[]
  imParticipants: IMParticipant[]
  folders: FileFolder[]
  calendar: CalendarConfig
}
```

#### Artefact
Any player-facing content object. Base type with type-specific properties.

```
Artefact {
  id: string
  type: "email" | "im" | "calendar" | "document" | "image" | "audio"
  title: string                    // Internal label
  visibleTitle: string             // Shown to player
  body: string                      // Content
  assetId?: string                  // Reference to uploaded asset

  // Placement
  app: "email" | "im" | "calendar" | "files" | "desktop"
  location: string                 // Thread/conversation/folder

  // Release & unlock
  releaseAtTime?: number            // Minutes from story start
  releaseTriggers: ReleaseRule[]   // Conditions that unlock
  locked: boolean
  lockPassword?: string

  // Metadata
  tags: string[]
  created: number
  modified: number

  // Type-specific fields...
}
```

**Type-Specific Variants:**

- **Email**: sender, recipients, subject, thread, timestamp
- **IM**: conversation, sender, displayOrder in thread
- **Calendar**: eventTitle, date/time, description, attendees
- **Document**: title, body text, folder
- **Image**: image asset, optional caption
- **Audio**: audio asset, optional metadata

#### Release & Progression Rules

```
ReleaseRule {
  type: "time" | "opened" | "read" | "password" | "app_opened" | "group"

  // For "time": { minutes: number }
  // For "opened": { artefactId: string }
  // For "read": { artefactId: string }
  // For "password": { correct: boolean }
  // For "app_opened": { appName: string }
  // For "group": { operator: "AND" | "OR", rules: ReleaseRule[] }
}
```

#### Player Runtime State

```
PlayerState {
  storyId: string
  startTime: number                 // Timestamp when player started
  currentTime: number               // Current elapsed time in session

  // Unlock tracking
  unlockedArtefacts: Set<string>   // Artefact IDs that are unlocked
  openedArtefacts: Set<string>     // Artefacts player has opened
  readArtefacts: Set<string>       // Artefacts player has read

  // Password tracking
  unlockedPasswords: Set<string>   // Which password-locked items unlocked

  // App/folder visits
  visitedApps: Set<string>
  visitedFolders: Set<string>

  // Ending state
  endingTriggered: boolean
  endingTriggerTime: number
  canContinueAfterEnding: boolean
}
```

## Component Architecture

### Story Authoring Tool

#### Layer Structure
```
UI Layer
├── Dashboard
├── Artefact Library (list/table)
├── Artefact Editor (form)
├── Asset Manager
├── Timeline View
├── Condition Builder
├── Preview Controls
└── Story Settings

State Management Layer
├── Story state (metadata, artefacts)
├── Asset state (uploaded files)
├── UI state (current tab, selected artefact)
└── Preview state (overrides, test flags)

Persistence Layer
├── localStorage/IndexedDB (authoring session)
└── Export/import (story JSON)
```

#### Key Workflows

1. **Create Story**: Initialize story metadata → save to state
2. **Create Artefact**: Choose type → fill form → add to story → attach asset
3. **Define Release Logic**: Select artefact → configure release time → add conditions → save
4. **Test with Preview**: Launch preview app → jump to time → inspect conditions → force-unlock
5. **Export**: Serialize story data to JSON

### Player App

#### Layer Structure
```
UI Layer (Desktop Shell)
├── Login Screen
├── Desktop Background
├── Taskbar/Dock
├── App Windows
│   ├── Email App
│   ├── IM App
│   ├── Calendar App
│   ├── File Explorer
│   ├── Document Viewer
│   ├── Image Viewer
│   └── Audio Player
└── Ending Screen

Progression Engine
├── Release evaluator (check if artefact unlocked)
├── Condition evaluator (assess rule tree)
├── Time tracker (elapsed session time)
└── State monitor (track opens/reads)

State Management Layer
├── Current story data
├── Player runtime state (IndexedDB)
├── UI state (active window, current selection)
└── Session time

Storage Layer (IndexedDB)
├── Player progress
├── Unlock/read tracking
├── Password unlock state
└── Session metadata
```

#### Key Workflows

1. **Load Story**: Read story JSON → initialize runtime state
2. **Login**: Show login screen → transition to desktop
3. **Browse**: Open apps → navigate folders → display artefacts
4. **Unlock**: Check release rules → show content if conditions met
5. **Persist**: Save state to IndexedDB on changes
6. **Resume**: Restore state from IndexedDB → continue from last position
7. **End**: Trigger ending when conditions met → show ending screen

## Technical Constraints & Decisions

### Why IndexedDB for Storage?
- Suitable for complex nested data structures
- Sufficient quota for typical player progress (~50MB)
- No backend/sync complexity required
- Client-side only, no privacy concerns

### Why Separate Apps?
- Clear separation of concerns (authoring vs. consumption)
- Each can be deployed independently
- Authoring tool can iterate without affecting player experience
- Cleaner codebase and testing

### Why Structured Story Data?
- Enables validation and debugging
- Supports future import/export/bundling
- Clear contract between authoring and player
- Facilitates testing and preview

### Why No Backend in v1?
- Reduces deployment complexity
- GitHub Pages suitable for distribution
- Story data can be embedded in build or loaded as JSON
- Aligns with hobby/indie game use case

### Why Static Asset Hosting in Authoring Tool?
- Simpler deployment
- v1 uses local uploads, not cloud storage
- Assets packaged with story data for v1
- Cloud CDN support can be added later

## Extensibility Points

### For Future Versions

1. **Story Loading**: Currently embedded; could load from:
   - External JSON API
   - Story bundle format (.zip)
   - Community story server

2. **Asset Storage**: Currently embedded in build; could use:
   - Separate CDN
   - Cloud storage (S3, etc.)
   - Story manifest with asset references

3. **Theme System**: Currently single theme; could add:
   - Multiple built-in themes
   - Creator-customizable themes
   - User-selectable themes

4. **Progression Engine**: Currently supports time + interaction gates; could add:
   - Branching (conditional story paths)
   - Player choice consequences
   - Dynamic content generation
   - More sophisticated event triggers

5. **State Sync**: Currently local-only; could add:
   - Cloud save sync
   - Cross-device resume
   - Server-based leaderboards/analytics

## File Organization (Recommended)

```
StoryEngine/
├── shared/                       # Common code/types
│   ├── types.ts                 # Data model types
│   ├── validation.ts            # Story validation
│   └── constants.ts             # Shared constants
│
├── authoring/                    # Story Builder app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── state/
│   │   └── index.html
│   └── dist/
│
├── player/                       # Player app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── engine/              # Progression engine
│   │   ├── storage/             # IndexedDB management
│   │   ├── hooks/
│   │   └── index.html
│   └── dist/
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── ARCHITECTURE.md          # This file
│   ├── SPECS.md
│   ├── CHANGELOG.md
│   ├── BACKLOG-AUTHORING.md
│   └── BACKLOG-PLAYER.md
│
├── scripts/                      # Build/deploy scripts
│   ├── build-authoring.sh
│   ├── build-player.sh
│   └── deploy.sh
│
└── stories/                      # Example/test stories (optional)
    └── demo-story.json
```

## Performance Considerations

### Authoring Tool
- Artefact list: Expected ~150 items max; use virtualization if needed
- Condition builder: Keep logic evaluation lightweight
- Preview: Lazy-load story data when launching

### Player App
- Story data: Typically 1-5MB per story (text-heavy)
- Assets: Images/audio embedded as base64 or referenced
- Progression checks: Evaluate rules only when needed (lazy evaluation)
- Rendering: Desktop shell typically low-motion; no performance issues expected

## Security Notes (v1 Scope)

### Authentication
- No user accounts in v1
- Story/player passwords are story-level only (not security-critical)
- Assumes stories distributed to trusted players

### Data Integrity
- Player state stored locally (client-only)
- No sync with server (no integrity attacks)
- Story data is read-only from player perspective

### Content Security
- No user-generated content uploaded to server (v1)
- Assets are author-controlled
- No XSS risks specific to story content model

---

**Last Updated**: March 2026
**Current Version**: Pre-v1 (Architecture only)
