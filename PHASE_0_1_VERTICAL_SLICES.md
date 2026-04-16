# StoryEngine Authoring Tool — Phase 0 & 1 Vertical Slices

**Purpose**: Break down Phase 0 (Foundation) and Phase 1 (Core MVP) into discrete, PR-sized vertical slices suitable for Claude Code implementation.

**Scope**: Each slice represents work completable in a single Pull Request with clear acceptance criteria.

---

## Phase 0: Foundation

**Goal**: Establish core data model and persistence layer before UI development.

---

### Slice 0.1: Project File Format and Basic I/O

**Objective**: Define the project file structure and implement basic save/load functionality.

#### Tasks
1. Define project file format specification
   - Single-file container format (consider JSON, MessagePack, or custom binary)
   - Internal hierarchy structure (metadata, artefacts, assets, conditions)
   - Version metadata field in file header
2. Implement `Project` class
   - Story metadata fields (ID, title, description, author, version)
   - Collections for artefacts, assets, conditions
   - Serialize to file format
   - Deserialize from file format
3. Implement basic file I/O
   - `saveProject(filePath)` method
   - `loadProject(filePath)` method
   - Handle file not found errors
   - Handle corrupted file errors

#### Acceptance Criteria
- [ ] Project can be instantiated programmatically
- [ ] Project can be saved to disk at specified path
- [ ] Saved project can be loaded from disk
- [ ] Loaded project matches original data exactly
- [ ] File I/O errors are caught and reported clearly

#### Test Cases
- Create project, save, load, verify all fields match
- Attempt to load non-existent file (should fail gracefully)
- Attempt to load corrupted file (should fail gracefully)
- Save to read-only location (should fail with clear error)

---

### Slice 0.2: Auto-Save and Dirty State Tracking

**Objective**: Implement auto-save system with configurable interval and manual save support.

#### Tasks
1. Add dirty state tracking to `Project`
   - Boolean flag indicating unsaved changes
   - Set dirty on any data modification
   - Clear dirty on successful save
2. Implement auto-save timer
   - Configurable interval (default 5 minutes)
   - Only save if dirty flag is set
   - Background thread/timer execution
   - Handle save failures without crashing
3. Implement manual save
   - `save()` method using last known file path
   - `saveAs(filePath)` method for new location
   - Update last known file path on successful save
4. Add exit warning system
   - Check dirty state on application exit
   - Prompt user if unsaved changes exist
   - Options: Save, Don't Save, Cancel

#### Acceptance Criteria
- [ ] Project tracks dirty state correctly
- [ ] Auto-save triggers every N minutes when dirty
- [ ] Auto-save does not trigger when clean
- [ ] Manual save works and clears dirty flag
- [ ] Save-as updates file path
- [ ] Exit warning appears only when dirty
- [ ] Exit warning does not appear when clean

#### Test Cases
- Modify project data, verify dirty flag set
- Wait for auto-save interval, verify save occurs
- Save manually, verify dirty flag cleared
- Modify data, attempt exit, verify warning appears
- Save, attempt exit, verify no warning

---

### Slice 0.3: Schema Versioning and Migration System

**Objective**: Support schema evolution with automatic migration on load.

#### Tasks
1. Add version metadata to project file
   - Schema version number (semantic versioning)
   - Creation date
   - Last modified date
   - Tool version that created the file
2. Implement version detection on load
   - Read version from file header
   - Compare to current schema version
   - Identify if migration needed
3. Implement migration framework
   - Registry of migration functions (v1→v2, v2→v3, etc.)
   - Chain migrations if multiple versions behind
   - Backup original file before migration
   - Apply migrations sequentially
4. Force re-save after migration
   - Mark project dirty after successful migration
   - Prompt user to save in current schema
   - Log migration actions for debugging

#### Acceptance Criteria
- [ ] Version metadata embedded in all saved projects
- [ ] Old project files detected correctly
- [ ] Migration functions execute in correct order
- [ ] Backup created before migration
- [ ] Migrated project loads successfully
- [ ] User prompted to save after migration

#### Test Cases
- Create v1 project, upgrade schema, load v1 project, verify migration
- Create multi-version-old project, verify chain migration works
- Corrupt project during migration, verify backup allows recovery
- Load current-version project, verify no migration triggered

---

### Slice 0.4: Core Data Model — Story and Artefacts

**Objective**: Define the data structures for Story and Artefact entities.

#### Tasks
1. Implement `Story` class
   - Story ID (UUID)
   - Title, description, author
   - Theme configuration object (placeholder for now)
   - Ending configuration object (placeholder for now)
   - Global settings object (placeholder for now)
   - List of artefact references
2. Implement `Artefact` base class
   - Artefact ID (UUID)
   - Type enum (Email, IM, Calendar, Document, Image, Audio)
   - Internal label
   - Visible title
   - Content/body field
   - Asset references (list of asset IDs)
   - Placement information (app/context)
   - Release rules reference
   - Lock settings (password, hint)
3. Implement artefact type-specific subclasses
   - `EmailArtefact`: sender, recipients, subject, thread ID, timestamp
   - `IMArtefact`: conversation ID, sender, display order
   - `CalendarArtefact`: event title, date/time, description, attendees
   - `DocumentArtefact`: body text or file reference, folder path
   - `ImageArtefact`: image asset reference, caption, folder path
   - `AudioArtefact`: audio asset reference, folder path

#### Acceptance Criteria
- [ ] Story object can be instantiated with all required fields
- [ ] All artefact types can be instantiated
- [ ] Artefact type-specific fields are accessible
- [ ] Artefacts can be added to Story's artefact list
- [ ] All data structures serialize/deserialize correctly

#### Test Cases
- Create Story with metadata, verify fields persist after save/load
- Create one of each artefact type, add to Story, verify all load correctly
- Serialize artefact with special characters in text fields, verify no corruption

---

### Slice 0.5: Core Data Model — Assets and Containers

**Objective**: Define Asset storage and container structures (threads, conversations, folders).

#### Tasks
1. Implement `Asset` class
   - Asset ID (UUID)
   - Filename
   - File type/MIME type
   - File size
   - Binary data or file path reference
   - Hash for deduplication (SHA-256 of file contents)
2. Implement asset embedding
   - Copy uploaded file into project structure
   - Store binary data in project file or linked structure
   - Deduplication: check hash before adding duplicate
3. Implement container structures
   - `EmailThread`: thread ID, subject, list of email artefact IDs
   - `IMConversation`: conversation ID, participant names, list of IM artefact IDs
   - `Folder`: folder ID, name, parent folder ID (for hierarchy), list of artefact IDs
4. Add container references to Story
   - List of threads
   - List of conversations
   - List of folders

#### Acceptance Criteria
- [ ] Assets can be added to project
- [ ] Asset binary data embedded correctly
- [ ] Duplicate assets detected via hash
- [ ] Containers (threads, conversations, folders) can be created
- [ ] Artefacts can be assigned to containers
- [ ] All container data persists correctly

#### Test Cases
- Upload asset twice, verify only one copy stored
- Create email thread with multiple emails, verify thread structure
- Create folder hierarchy (parent/child), verify relationships
- Load project with assets, verify binary data intact

---

### Slice 0.6: Core Data Model — Conditions and Release Rules

**Objective**: Define condition/rule structures for artefact release logic.

#### Tasks
1. Implement `Condition` base class
   - Condition ID
   - Condition type enum (ElapsedTime, ArtefactOpened, PasswordEntered, etc.)
   - Serialization/deserialization
2. Implement condition type-specific subclasses
   - `ElapsedTimeCondition`: target timestamp (in minutes from story start)
   - `ArtefactOpenedCondition`: target artefact ID
   - `ArtefactReadCondition`: target artefact ID (for Phase 2)
   - `PasswordEnteredCondition`: target lock ID
   - `AppOpenedCondition`: target app name (for Phase 2)
   - `FolderAccessedCondition`: target folder ID (for Phase 2)
3. Implement `ReleaseRule` class
   - Rule ID
   - List of conditions
   - Logical operator (AND/OR — simple for Phase 1, one condition only)
4. Link ReleaseRule to Artefact
   - Add release rule reference to Artefact
   - Nullable (artefacts without rules are always available)

#### Acceptance Criteria
- [ ] All condition types can be instantiated
- [ ] Conditions serialize/deserialize correctly
- [ ] ReleaseRule can hold conditions
- [ ] Artefacts can be assigned release rules
- [ ] Release rules persist correctly

#### Test Cases
- Create ElapsedTimeCondition, attach to artefact, save/load, verify intact
- Create ArtefactOpenedCondition, verify target artefact ID stored correctly
- Create artefact without release rule, verify it saves as nullable

---

### Slice 0.7: Validation Foundation

**Objective**: Implement basic validation framework for data integrity checks.

#### Tasks
1. Implement `ValidationResult` class
   - Severity enum (Error, Warning, Info)
   - Message text
   - Reference to problematic entity (artefact ID, asset ID, etc.)
   - Suggested fix (optional)
2. Implement `Validator` class
   - `validateProject(project)` method
   - Returns list of ValidationResults
   - Checks performed:
     - Missing asset references (artefact references non-existent asset)
     - Invalid artefact references (condition references non-existent artefact)
     - Invalid container references (artefact assigned to non-existent thread/conversation/folder)
     - Duplicate artefact IDs
     - Missing required fields (title, type, placement)
3. Add validation hooks
   - Validate on load (warn user of issues)
   - Validate before export (block export if errors exist)
   - On-demand validation (user triggers validation check)

#### Acceptance Criteria
- [ ] Validator detects missing asset references
- [ ] Validator detects invalid artefact references
- [ ] Validator detects invalid container references
- [ ] Validator detects duplicate IDs
- [ ] Validation results categorized by severity
- [ ] Validation runs on load and before export

#### Test Cases
- Create artefact referencing non-existent asset, verify validation error
- Create condition referencing non-existent artefact, verify validation error
- Create valid project, verify validation passes with no errors
- Attempt export with validation errors, verify export blocked

---

## Phase 0 Completion Checkpoint

**Deliverable**: A headless project management system capable of:
- Creating projects programmatically
- Defining stories with artefacts, assets, containers, and conditions
- Saving projects to disk with auto-save
- Loading projects with schema migration
- Validating data integrity

**Testing Strategy**: Comprehensive unit tests for all data model classes and I/O operations. Integration tests for save/load/validate workflows.

---

## Phase 1: Core MVP

**Goal**: Build the UI layer and core authoring workflow for simple time-gated stories.

---

### Slice 1.1: Application Shell and Story Dashboard

**Objective**: Create the main application window with docking panels and story dashboard.

#### Tasks
1. Set up desktop application framework
   - Main window with menu bar
   - File menu (New, Open, Save, Save As, Exit)
   - Edit menu (Undo, Redo — stub for Phase 3)
   - View menu (panels toggle)
   - Help menu (About, Documentation)
2. Implement docking panel system
   - Panel manager for showing/hiding panels
   - Default layout configuration
   - Panel resize and drag-to-dock support
3. Implement Story Dashboard panel
   - Display story metadata (title, author, description)
   - Edit story metadata (inline editing or modal dialog)
   - Display artefact counts by type (table or summary cards)
   - Display total asset count and total size
   - Quick validation status summary (errors/warnings count)
   - Button to launch preview (stub for Phase 3)

#### Acceptance Criteria
- [ ] Application window launches successfully
- [ ] Menu bar displays all menus
- [ ] File operations (New, Open, Save, Save As) trigger correct workflows
- [ ] Story Dashboard displays all story metadata correctly
- [ ] Story metadata can be edited and saved
- [ ] Artefact/asset counts update when data changes

#### Test Cases
- Launch app, create new project, verify empty dashboard
- Open existing project, verify metadata displays correctly
- Edit story title, save, reload, verify change persists
- Add artefacts, verify counts update in dashboard

---

### Slice 1.2: Timeline View (Read-Only)

**Objective**: Visual timeline showing artefacts on a time axis with click-to-edit.

#### Tasks
1. Implement Timeline panel
   - Horizontal time axis (0 minutes to max release time)
   - Artefact nodes positioned at their release time
   - Visual differentiation by artefact type (icons or colors)
   - Click artefact node to open in editor
2. Implement timeline rendering
   - Scale timeline to fit all artefacts
   - Time markers at regular intervals (every 5/10/15 minutes)
   - Zoom controls (fit-to-window, zoom in, zoom out)
   - Scroll/pan for long timelines
3. Add visual indicators
   - Icon for each artefact type (email, IM, calendar, document, image, audio)
   - Simple badge for locked artefacts (🔒 icon)
   - Tooltip on hover showing artefact title and release time

#### Acceptance Criteria
- [ ] Timeline displays all artefacts at correct positions
- [ ] Artefact type icons render correctly
- [ ] Clicking artefact opens editor (verified by console log or modal stub)
- [ ] Zoom and pan controls work
- [ ] Tooltip displays correct information
- [ ] Timeline updates when artefact release times change

#### Test Cases
- Create project with artefacts at different times, verify timeline positions
- Add new artefact, verify it appears on timeline
- Change artefact release time in editor, verify timeline updates
- Zoom in/out, verify timeline scales correctly

---

### Slice 1.3: Artefact List Panel

**Objective**: Table/list view for managing all artefacts with filtering and sorting.

#### Tasks
1. Implement Artefact List panel
   - Table view with columns: Title, Type, Release Time, Locked, Placement
   - Row selection highlights artefact
   - Double-click row to open editor
2. Add create/delete controls
   - "New Artefact" button with type dropdown
   - Delete selected artefact button (with confirmation dialog)
3. Implement filtering
   - Filter by artefact type (dropdown or checkboxes)
   - Filter by lock status (show locked only, unlocked only, all)
   - Clear filters button
4. Implement sorting
   - Click column header to sort by that column
   - Toggle ascending/descending order
   - Default sort: release time ascending

#### Acceptance Criteria
- [ ] Artefact list displays all artefacts
- [ ] Columns show correct data
- [ ] Double-click opens artefact editor
- [ ] New artefact button creates artefact of selected type
- [ ] Delete button removes artefact after confirmation
- [ ] Filtering works for type and lock status
- [ ] Sorting works for all columns

#### Test Cases
- Create project with 10 artefacts, verify all appear in list
- Filter by type "Email", verify only emails shown
- Sort by release time, verify ascending/descending order
- Delete artefact, verify it disappears from list and timeline

---

### Slice 1.4: Email Artefact Editor

**Objective**: Form-based editor for email artefacts.

#### Tasks
1. Implement Email Editor modal/panel
   - Internal label (text input)
   - Visible subject (text input)
   - Sender (text input or dropdown of defined senders)
   - Recipients (text input, comma-separated)
   - Thread assignment (dropdown of existing threads + "New Thread" option)
   - Body (multi-line text area)
   - Timestamp metadata (date/time picker for display purposes)
2. Add release timing controls
   - Release time (minutes from story start, number input)
3. Add lock settings
   - Password lock toggle
   - Password field (enabled when locked)
   - Password hint field (optional)
4. Add placement controls
   - App context (fixed: "Email" for emails)
   - Folder/label (text input, optional)
5. Save/Cancel buttons
   - Save updates artefact in project
   - Cancel discards changes
   - Close editor after save

#### Acceptance Criteria
- [ ] Editor opens when email artefact selected
- [ ] All fields populate with existing data
- [ ] Fields can be edited
- [ ] Save updates artefact data
- [ ] Cancel discards changes
- [ ] Thread dropdown shows all threads
- [ ] New thread can be created inline
- [ ] Validation errors shown for missing required fields

#### Test Cases
- Create new email, fill all fields, save, verify data persists
- Edit existing email, change subject, save, verify change
- Select "New Thread", enter thread name, verify thread created
- Enable password lock, save, verify artefact locked

---

### Slice 1.5: IM Artefact Editor

**Objective**: Form-based editor for instant message artefacts.

#### Tasks
1. Implement IM Editor modal/panel
   - Internal label (text input)
   - Conversation assignment (dropdown of existing conversations + "New Conversation" option)
   - Sender (text input or dropdown)
   - Message body (multi-line text area)
   - Display order (number input — order within conversation)
2. Add release timing controls
   - Release time (minutes from story start)
3. Add lock settings (same as email)
4. Add placement controls
   - App context (fixed: "IM" for instant messages)
5. Save/Cancel buttons

#### Acceptance Criteria
- [ ] Editor opens when IM artefact selected
- [ ] All fields populate correctly
- [ ] Conversation dropdown shows all conversations
- [ ] New conversation can be created inline
- [ ] Display order determines message sequence
- [ ] Save/cancel work correctly

#### Test Cases
- Create IM conversation with 3 messages at different times
- Verify messages appear in correct order when sorted by display order
- Edit message sender, verify change persists

---

### Slice 1.6: Calendar, Document, Image, and Audio Artefact Editors

**Objective**: Form-based editors for remaining artefact types.

#### Tasks (Calendar)
1. Implement Calendar Event Editor
   - Internal label
   - Event title
   - Date/time (date picker + time picker)
   - Description (multi-line text area)
   - Attendees (text input, comma-separated, optional)
   - Release time
   - Lock settings
   - App context (fixed: "Calendar")

#### Tasks (Document)
1. Implement Document Editor
   - Internal label
   - Document title
   - Body text (multi-line text area) OR file asset reference
   - Folder placement (text input or tree picker)
   - Release time
   - Lock settings
   - App context (fixed: "FileExplorer")

#### Tasks (Image)
1. Implement Image Editor
   - Internal label
   - Image asset reference (button to select from asset library)
   - Optional caption/title
   - Folder placement
   - Release time
   - Lock settings
   - App context (fixed: "FileExplorer" or "ImageViewer")

#### Tasks (Audio)
1. Implement Audio Editor
   - Internal label
   - Audio asset reference (button to select from asset library)
   - Optional title
   - Folder placement
   - Release time
   - Lock settings
   - App context (fixed: "FileExplorer" or "AudioPlayer")

#### Acceptance Criteria
- [ ] All four artefact type editors functional
- [ ] Asset references work (button opens asset library picker)
- [ ] All fields save correctly
- [ ] Editors follow same UI pattern as email/IM

#### Test Cases
- Create one of each type, verify all save correctly
- Assign assets to image/audio artefacts, verify references persist
- Set folder placement, verify artefact appears in correct location

---

### Slice 1.7: Asset Library Panel and Upload

**Objective**: Asset management UI with upload, browse, and assign capabilities.

#### Tasks
1. Implement Asset Library panel
   - List view showing all assets (filename, type, size)
   - Upload button (file picker dialog)
   - Delete button (with orphan warning if asset in use)
   - Select asset to assign to artefact (return asset ID to calling editor)
2. Implement asset upload workflow
   - File picker allows multi-select
   - Copy files into project structure
   - Detect duplicates via hash
   - Add assets to project asset list
   - Show progress for large uploads
3. Implement asset validation
   - File type validation (reject unsupported formats)
   - File size warnings (e.g., >10MB warning)
   - Show validation status in list
4. Implement asset usage tracking
   - Show which artefacts reference each asset
   - Prevent deletion of in-use assets (or warn with override option)

#### Acceptance Criteria
- [ ] Asset library displays all uploaded assets
- [ ] Upload button opens file picker
- [ ] Files copied into project on upload
- [ ] Duplicate files detected and skipped
- [ ] Asset type and size display correctly
- [ ] Delete shows warning if asset in use
- [ ] Selecting asset from editor populates asset reference field

#### Test Cases
- Upload image, verify it appears in library
- Upload same image twice, verify only one copy stored
- Assign image to artefact, attempt delete, verify warning
- Upload unsupported file type, verify rejection

---

### Slice 1.8: Simple Condition Builder UI

**Objective**: Form-based condition builder for elapsed time and single artefact-opened gate.

#### Tasks
1. Implement Condition Builder panel/section in artefact editor
   - Toggle: "Use conditions" (enabled/disabled)
   - When enabled, show condition form
2. Implement Elapsed Time condition form
   - Radio button: "Elapsed Time"
   - Number input: minutes from story start
3. Implement Artefact Opened condition form
   - Radio button: "Artefact Opened"
   - Dropdown: select target artefact from list
4. Show human-readable summary
   - "Unlock at 15 minutes from story start"
   - "Unlock when [Artefact Title] is opened"
   - Combined: "Unlock at 15 minutes AND when [Artefact Title] is opened" (Phase 1 supports simple combination)
5. Link condition to artefact release rule
   - Create ReleaseRule object
   - Attach conditions to rule
   - Attach rule to artefact

#### Acceptance Criteria
- [ ] Condition toggle enables/disables condition UI
- [ ] Elapsed time condition can be set
- [ ] Artefact opened condition can be set
- [ ] Summary displays correct logic
- [ ] Conditions save with artefact
- [ ] Conditions load when editing artefact

#### Test Cases
- Set elapsed time to 10 minutes, save, reload, verify condition
- Set artefact opened condition targeting Email_001, verify reference
- Disable conditions, save, verify artefact has no release rule

---

### Slice 1.9: Export to Player Package

**Objective**: Export validated story to compressed player-consumable format.

#### Tasks
1. Implement Export workflow
   - Menu: File > Export Story
   - Run full validation before export
   - Block export if errors exist, show validation panel
   - Proceed if only warnings exist (optional user confirmation)
2. Implement export packaging
   - Create export file format (ZIP, custom binary, or JSON bundle)
   - Include story metadata
   - Include all artefacts with full data
   - Embed all assets
   - Include condition/release rule definitions
   - Compress package
3. Show export progress
   - Progress bar or spinner during export
   - Show steps: "Validating...", "Packaging artefacts...", "Compressing...", "Done"
4. Export success/failure feedback
   - Success: show file save dialog, confirm export location
   - Failure: show error message with details

#### Acceptance Criteria
- [ ] Export menu item triggers validation
- [ ] Export blocked if validation errors exist
- [ ] Export package includes all story data and assets
- [ ] Package is compressed
- [ ] User prompted to choose save location
- [ ] Success message shows file path

#### Test Cases
- Export valid story, verify package created
- Export story with validation errors, verify export blocked
- Open exported package (manually or with test script), verify all data present
- Export large story (100+ artefacts), verify progress indicator works

---

### Slice 1.10: Basic Validation UI

**Objective**: Display validation results and allow navigation to problem artefacts.

#### Tasks
1. Implement Validation Panel
   - List view showing all validation results
   - Group by severity (Errors, Warnings, Info)
   - Each result shows: message, affected artefact, suggested fix
   - Click result to jump to affected artefact (open in editor)
2. Add validation triggers
   - Run validation on project open (background, show if issues found)
   - Run validation before export (foreground, block if errors)
   - Manual validation: Menu > Tools > Validate Story
3. Show validation summary in dashboard
   - Error count (red badge)
   - Warning count (yellow badge)
   - Click badge to open validation panel

#### Acceptance Criteria
- [ ] Validation panel displays all issues
- [ ] Issues grouped by severity
- [ ] Clicking issue opens relevant artefact editor
- [ ] Validation runs on open and before export
- [ ] Dashboard shows error/warning counts

#### Test Cases
- Create artefact with missing asset reference, verify validation error
- Fix validation error, re-run validation, verify error cleared
- Create story with only warnings, verify export proceeds with confirmation

---

### Slice 1.11: Integration Testing and Polish

**Objective**: End-to-end workflow validation and UI polish.

#### Tasks
1. End-to-end workflow testing
   - Create new project
   - Add story metadata
   - Create 20+ artefacts across all types
   - Upload assets and assign them
   - Set release times and conditions
   - Validate story
   - Export story
   - Load exported story in test harness (verify data integrity)
2. UI polish
   - Consistent styling across all panels
   - Keyboard navigation (tab order, enter to save)
   - Form validation (highlight invalid fields)
   - Loading states (spinners during save/load)
   - Error message clarity (avoid technical jargon)
3. Performance optimization
   - Lazy-load timeline for large stories
   - Debounce auto-save (don't save on every keystroke)
   - Optimize asset preview generation
4. Documentation
   - Inline help text for complex fields
   - Tooltip hints on hover
   - Basic user guide (Markdown file in repo)

#### Acceptance Criteria
- [ ] Full workflow completable without errors
- [ ] UI feels consistent and polished
- [ ] Performance acceptable for 150-artefact story
- [ ] User guide covers all major features

#### Test Cases
- Complete full workflow as new user (time to first export)
- Create 150-artefact story, verify timeline renders smoothly
- Modify artefact, verify auto-save triggers after delay
- Export story, verify package opens in test player

---

## Phase 1 Completion Checkpoint

**Deliverable**: A functional authoring tool capable of:
- Creating and editing stories with 50–150 artefacts
- Managing assets within the project
- Defining simple time-based and interaction-based progression
- Validating story data for common errors
- Exporting playable story packages

**Success Criteria**:
- Solo creator can produce a complete playable story in under 8 hours
- Validation catches 95%+ of common authoring errors
- Export produces valid package consumable by test player
- No critical bugs in save/load workflow

---

## Notes for Claude Code Implementation

### PR Size Guidelines
- Each slice should be completable in 1–3 days of focused development
- Slices with dependencies should reference prerequisite slices
- Breaking changes to data model should include migration code

### Testing Strategy
- Unit tests for all data model classes (Phase 0)
- Integration tests for save/load workflows (Phase 0.1–0.3)
- UI tests for editor forms (Phase 1.4–1.6)
- End-to-end workflow test (Phase 1.11)

### Technology Recommendations
- **Language**: Java (Swing/JavaFX) or C# (WinForms/WPF)
- **Data Format**: JSON for readability during development, consider MessagePack or Protocol Buffers for final export compression
- **Testing Framework**: JUnit (Java) or NUnit (C#)
- **UI Testing**: TestFX (JavaFX) or FlaUI (WPF)

### Known Challenges
- **Timeline rendering performance**: Use virtualization for 100+ artefacts
- **Asset embedding**: Large asset libraries may bloat project file size — consider external asset folder with references
- **Condition builder UX**: Simple form-based builder may feel limiting — Phase 2 visual builder will address this

---

**End of Vertical Slices Document**
