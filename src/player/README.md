# StoryEngine Player App

Browser-based ARG (Alternate Reality Game) player that presents story content through a stylized faux-desktop environment.

## Architecture

### Core State Management

- **playerStore.ts**: Zustand store for story data and player progress (artefacts opened/read, passwords unlocked, apps visited, etc.)
- **uiStore.ts**: Zustand store for transient UI state (open windows, focused app, modal states)

### Data Persistence

- **playerDB.ts**: IndexedDB layer for storing player sessions and progress
- **sessionManager.ts**: Login validation and session initialization/resumption
- **useAutoSaveProgress.ts**: Hook that auto-saves player state to IndexedDB every 5 seconds (debounced)

### Progression Engine

- **playerProgressionEngine.ts**: Adapter layer to release engine; evaluates unlock conditions
- **artefactResolver.ts**: Filters and organizes artefacts by type (emails into threads, etc.)
- **passwordValidator.ts**: Validates password attempts for locked content
- **endingEvaluator.ts**: Checks if story ending conditions are met

### User Interface

#### Shell Components
- **Desktop.tsx**: Background wallpaper and desktop icons for app launching
- **Taskbar.tsx**: Bottom bar showing open apps and system clock
- **Window.tsx**: Individual window frame with title bar and controls
- **WindowManager.tsx**: Orchestrates window rendering and z-order management

#### Apps
- **EmailApp.tsx** / **EmailThread.tsx**: Email inbox with thread grouping
- **IMApp.tsx** / **IMThread.tsx**: IM conversations with message history
- **CalendarApp.tsx**: Calendar events list view
- **FileExplorer.tsx**: File/folder navigation with content organization
- **DocumentViewer.tsx**: Plain text document display
- **ImageViewer.tsx**: Image display with optional caption
- **AudioPlayer.tsx**: HTML5 audio player with controls

#### UI Components
- **LoginPage.tsx**: Login screen with credential validation
- **DesktopPage.tsx**: Main shell container
- **PasswordPrompt.tsx**: Modal for password-protected content
- **EndingScreen.tsx**: Story ending display
- **ErrorBoundary.tsx**: Error handling for graceful crash recovery

### Hooks

- **usePlayerState.ts**: Access to player store
- **useSessionTime.ts**: Elapsed time tracking
- **useProgressionEngine.ts**: Memoized progression logic (unlocked artefacts, etc.)
- **useWindowManager.ts**: Window state management
- **useEndingTrigger.ts**: Monitors ending conditions
- **useAutoSaveProgress.ts**: Debounced auto-save to IndexedDB

## Flow

### Game Initialization
1. PlayerApp mounts
2. Checks for existing session in IndexedDB
3. If exists, resumes with recalculated elapsed time
4. If not, shows login screen
5. After login, loads story and initializes new session
6. Displays desktop shell

### Gameplay
1. Player interacts with apps (email, IM, calendar, files)
2. Each interaction tracked in player state:
   - Opens artefact → recordArtefactOpened()
   - Reads content → recordArtefactRead()
   - Unlocks password → recordPasswordUnlocked()
   - Visits app → recordAppVisited()
   - Navigates folder → recordFolderVisited()
3. useAutoSaveProgress hook debounces saves (max 5s apart)
4. useEndingTrigger hook monitors ending conditions
5. On page reload, player state restored from IndexedDB

### Ending
1. When all ending trigger conditions met
2. useEndingTrigger detects and calls triggerEnding()
3. EndingScreen overlays desktop
4. Player can restart (clears progress) or continue exploring (if allowed)

## Key Design Patterns

### Artefact Unlock Logic
```typescript
// Check if artefact is accessible
isArtefactUnlockedForPlayer(artefact, playerState)

// Filter by type and organize
getUnlockedArtefactsForPlayer(story, playerState)
getArtefactsByType(story, playerState, 'email')
```

### Window State
```typescript
// UIStore tracks: isOpen, isMinimized, zIndex
// Window "visible" = open && !minimized
// Z-order = increment counter on focus
```

### State Persistence
```typescript
// Save: playerStore → IndexedDB (debounced 5s)
// Load: IndexedDB → playerStore (on app init)
// Sets are converted to/from Arrays for storage
// Maps converted to/from Array<[key, value]> for storage
```

## Performance Optimizations

1. **Memoized selectors**: useProgressionEngine memoizes unlocked artefacts
2. **Debounced saves**: Auto-save batches changes (max once per 5s)
3. **Lazy asset loading**: Images/audio loaded only when viewer opened
4. **Asset caching**: Assets kept in memory after first load

## MVP Feature Set

### Complete
- Login with credential validation
- Desktop shell with taskbar and windows
- Email app with threading
- IM app with conversations
- Calendar app with events
- File explorer with documents, images, audio
- Time-based content unlocking
- Interaction-based unlocking (opened/read)
- Password-locked content
- Session persistence across page reloads
- Story ending with restart
- Error boundary for crash recovery

### Not Included (v2+)
- Window dragging/resizing
- Search functionality
- Unread indicators
- Live message arrivals
- Mobile responsiveness
- Branching storylines
- User-generated responses

## Testing Checklist

- [ ] Login works with correct credentials
- [ ] Session persists across reload
- [ ] Time-based unlocks work
- [ ] Interaction unlocks work
- [ ] Password unlocks work
- [ ] Email app shows threads
- [ ] IM app shows conversations
- [ ] Calendar shows events
- [ ] File explorer navigates
- [ ] Viewers load content correctly
- [ ] Ending triggers when conditions met
- [ ] Restart clears all progress
- [ ] Error boundary catches crashes
- [ ] No console errors in prod build

## File Organization

```
src/player/
├── components/
│   ├── apps/              # App implementations
│   ├── shell/             # Desktop shell
│   ├── ui/                # Modal, login, ending screens
│   └── ErrorBoundary.tsx
├── engine/                # Progression logic
├── hooks/                 # React hooks
├── pages/                 # Top-level pages
├── storage/               # IndexedDB + session
├── stores/                # Zustand stores
├── styles/                # CSS (optional, using Tailwind)
├── utils/                 # Utilities
└── index.tsx              # App entry point
```
