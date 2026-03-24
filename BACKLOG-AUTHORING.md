# Story Authoring Tool - Feature Backlog

This backlog contains all user stories for the Desktop ARG Story Builder, organized by epic. Stories are marked as **v1 MVP** (required for launch) or **v2+** (future enhancements).

**Priority Legend**: 🔴 Critical (MVP) | 🟡 High (MVP) | 🟢 Medium (Post-MVP) | 🔵 Low (Future)

---

## Epic 1: Story Management & Dashboard

### AUTH-001: Create New Story 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to create a new story with basic metadata,
**So that** I can start building a playable experience.

**Acceptance Criteria**
- [ ] Create button on dashboard launches new story dialog
- [ ] Dialog captures: title, description, author, version
- [ ] New story is saved to local storage
- [ ] New story appears in dashboard list
- [ ] Creator can immediately start adding artefacts

**Technical Notes**
- Initialize Story object with empty artefacts array
- Generate unique story ID
- Save to IndexedDB

---

### AUTH-002: View Story Dashboard 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to see a dashboard of all my stories,
**So that** I can manage and continue editing them.

**Acceptance Criteria**
- [ ] Dashboard shows all saved stories
- [ ] Each story displays: title, author, artefact count
- [ ] Stories show progress (% complete)
- [ ] Shows artefacts by type count
- [ ] Shows locked items count
- [ ] Shows conditional items count
- [ ] Quick access to preview each story
- [ ] Click to edit story
- [ ] Delete story with confirmation

**Technical Notes**
- Read all stories from IndexedDB
- Calculate completion metrics
- Render as table/list with actions

---

### AUTH-003: Edit Story Metadata 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to edit story metadata (title, description, author, version),
**So that** I can keep story information up-to-date.

**Acceptance Criteria**
- [ ] Click "Edit" on story opens metadata form
- [ ] Can update: title, description, author, version
- [ ] Changes save automatically or with save button
- [ ] Validation: title required, version is semver format (optional)
- [ ] Changes reflected in dashboard immediately

**Technical Notes**
- Update Story object properties
- Save to IndexedDB
- Reflect in UI

---

### AUTH-004: Configure Theme & Login 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to configure story theme colors and login behavior,
**So that** the story's visual presentation matches my vision.

**Acceptance Criteria**
- [ ] Theme configuration form with: primary color, accent, background, text color
- [ ] Font family selector
- [ ] Wallpaper image upload/selection
- [ ] Taskbar position selector (top/bottom/left/right)
- [ ] Login screen configuration: username, password, message
- [ ] Can preview theme colors in real-time
- [ ] Settings persist and affect preview

**Technical Notes**
- Store in Story.theme object
- Store in Story.login object
- Theming should be mockable for preview

---

### AUTH-005: Configure Story Ending 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to configure the ending screen and ending trigger conditions,
**So that** the story has a proper conclusion.

**Acceptance Criteria**
- [ ] Ending configuration panel
- [ ] Set ending trigger conditions using condition builder
- [ ] Define ending title and body text
- [ ] Upload optional ending image
- [ ] Choose: freeze after ending, fade, or allow continue
- [ ] Allow restart button option
- [ ] Preview ending screen
- [ ] Can define multiple ending variants (optional for v1)

**Technical Notes**
- Store in Story.ending object
- Use same condition builder as artefact release rules
- Support display variations

---

## Epic 2: Artefact Management

### AUTH-006: Create Email Artefact 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to create email messages and assign them to threads,
**So that** the story has email conversations.

**Acceptance Criteria**
- [ ] "New Artefact" → "Email" opens email editor
- [ ] Fields: title (internal), visible title, sender, recipients, subject, body
- [ ] Thread selector/creator (can create new thread)
- [ ] Body supports rich text or markdown
- [ ] Can attach asset (optional)
- [ ] Preview how email appears in player
- [ ] Save creates EmailArtefact
- [ ] Email appears in library

**Technical Notes**
- Sender must reference existing EmailSender
- Thread can be auto-created if new
- Support HTML body content

---

### AUTH-007: Create IM Artefact 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to create instant messages and organize them in conversations,
**So that** the story has message threads.

**Acceptance Criteria**
- [ ] "New Artefact" → "IM" opens IM editor
- [ ] Fields: title (internal), conversation, sender, message body
- [ ] Display order field (position in conversation)
- [ ] Conversation selector/creator
- [ ] Body is plain text or light markup
- [ ] Sender references IMParticipant
- [ ] Preview appearance in player
- [ ] Save creates IMArtefact

**Technical Notes**
- Maintain conversation ordering by displayOrder
- Display order should auto-increment for new messages in conversation

---

### AUTH-008: Create Calendar Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to create calendar events,
**So that** the story has contextual calendar content.

**Acceptance Criteria**
- [ ] "New Artefact" → "Calendar" opens calendar editor
- [ ] Fields: title, date, time (optional), description, location (optional), attendees (optional)
- [ ] Date picker for easy selection
- [ ] Time format: HH:MM
- [ ] Recurring support (optional for v1)
- [ ] Preview in calendar view
- [ ] Save creates CalendarArtefact

**Technical Notes**
- Date stored as YYYY-MM-DD
- Time optional (all-day events)

---

### AUTH-009: Create Document Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to create text documents,
**So that** the story can contain readable documents.

**Acceptance Criteria**
- [ ] "New Artefact" → "Document" opens document editor
- [ ] Fields: title, body text/markdown, folder placement
- [ ] Rich text or markdown editor
- [ ] Folder path selector (or create folder)
- [ ] Can attach file asset (optional)
- [ ] Preview document rendering
- [ ] Save creates DocumentArtefact

**Technical Notes**
- Store body as markdown or HTML
- Folder path is string like "Documents/Work/Report.txt"

---

### AUTH-010: Create Image Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to create image artefacts,
**So that** the story can include visual content.

**Acceptance Criteria**
- [ ] "New Artefact" → "Image" opens image editor
- [ ] Asset upload (required)
- [ ] Fields: title, caption (optional), folder placement
- [ ] Preview image as it appears in player
- [ ] Folder path selector
- [ ] Save creates ImageArtefact
- [ ] Asset must be associated before saving

**Technical Notes**
- Asset ID must reference uploaded image
- Supported formats: JPG, PNG, WebP, GIF

---

### AUTH-011: Create Audio Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to create audio artefacts,
**So that** the story can include audio files.

**Acceptance Criteria**
- [ ] "New Artefact" → "Audio" opens audio editor
- [ ] Asset upload (required)
- [ ] Fields: title, duration (auto-detected), folder placement
- [ ] Preview audio player
- [ ] Folder path selector
- [ ] Save creates AudioArtefact

**Technical Notes**
- Asset ID required
- Supported formats: MP3, WAV, OGG, M4A
- Duration auto-populated from file metadata

---

### AUTH-012: Edit Artefact 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to edit existing artefacts,
**So that** I can refine content and fix mistakes.

**Acceptance Criteria**
- [ ] Click artefact in library opens editor
- [ ] All type-specific fields editable
- [ ] Changes save automatically or on demand
- [ ] Preview updates in real-time
- [ ] Edited timestamp updates
- [ ] Back/cancel returns to library

**Technical Notes**
- Load artefact from IndexedDB
- Save changes back
- Type cannot be changed (delete & recreate if needed)

---

### AUTH-013: Delete Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to delete artefacts I no longer need,
**So that** I can clean up my story.

**Acceptance Criteria**
- [ ] Delete button on artefact editor
- [ ] Confirmation dialog: "Delete [title]?"
- [ ] On confirm, artefact removed from story
- [ ] Artefact no longer appears in library
- [ ] If release rules reference deleted artefact, flag as warning
- [ ] Back to library after delete

**Technical Notes**
- Validate no other artefacts depend on this one
- Warn if dependencies exist

---

### AUTH-014: Duplicate Artefact 🟢
**Priority**: v1 MVP (Medium)
**As a** creator,
**I want** to duplicate an existing artefact,
**So that** I can quickly create similar content.

**Acceptance Criteria**
- [ ] "Duplicate" button on artefact editor
- [ ] Creates copy with new ID
- [ ] Copy has "_copy" suffix on title
- [ ] Copy has all same properties (except ID)
- [ ] Opens duplicate in editor for immediate customization

**Technical Notes**
- Generate new UUID for copy
- Preserve all fields
- Update title to indicate copy

---

### AUTH-015: View Artefact Library 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to see all artefacts in a organized list,
**So that** I can manage and navigate my story content.

**Acceptance Criteria**
- [ ] Library view shows all artefacts in table
- [ ] Columns: title, type, placement, release time, gated?, locked?
- [ ] Filter by type (Email, IM, Calendar, Document, Image, Audio)
- [ ] Filter by container (Thread name, Conversation name, Folder)
- [ ] Sort by: title, type, release time
- [ ] Visual indicators for status (🔒 locked, ⚙️ gated, ✓ valid)
- [ ] Click row to edit
- [ ] Bulk actions (delete, etc. - optional for v1)
- [ ] Search by title
- [ ] Shows artefact count at top

**Technical Notes**
- Load all artefacts from Story
- Apply filters and sorting client-side
- Color-code status indicators

---

### AUTH-016: Validate Artefact Configuration 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** validation warnings for misconfigured artefacts,
**So that** I catch problems before publishing.

**Acceptance Criteria**
- [ ] Library shows validation status per artefact
- [ ] Red ⚠️ for critical errors (missing asset, invalid reference)
- [ ] Yellow ⚠️ for warnings (missing description, no release rule)
- [ ] Click warning to see details
- [ ] Hover shows error message
- [ ] Cannot save story if critical errors exist

**Technical Notes**
- Image/Audio must have asset reference
- Thread/Conversation references must exist
- Release rule references must point to valid artefacts

---

## Epic 3: Asset Management

### AUTH-017: Upload Asset File 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to upload image and audio files,
**So that** I can associate them with artefacts.

**Acceptance Criteria**
- [ ] Asset upload interface (drag-and-drop or file picker)
- [ ] Supported formats: images (JPG, PNG, WebP, GIF), audio (MP3, WAV, OGG, M4A)
- [ ] File size limits enforced (e.g., 10MB per file)
- [ ] Show upload progress
- [ ] Preview uploaded asset
- [ ] Asset stored and assigned ID
- [ ] Asset appears in asset library

**Technical Notes**
- Store as base64 or blob in IndexedDB
- Generate unique asset ID
- Extract metadata (image dimensions, audio duration)

---

### AUTH-018: Manage Asset Library 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to view and manage all uploaded assets,
**So that** I can organize and reuse assets.

**Acceptance Criteria**
- [ ] Asset library shows all uploaded files
- [ ] Display: thumbnail, filename, type, size, date uploaded
- [ ] Rename assets
- [ ] Delete unused assets
- [ ] See which artefacts use each asset
- [ ] Search assets by name

**Technical Notes**
- Warn before deleting if asset is referenced
- Show usage count per asset

---

### AUTH-019: Associate Asset with Artefact 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to attach uploaded assets to artefacts,
**So that** images and audio play in the player app.

**Acceptance Criteria**
- [ ] Image/Audio editor has "Select Asset" button
- [ ] Opens asset picker dialog
- [ ] Shows available assets with previews
- [ ] Select asset to attach to artefact
- [ ] Asset ID stored in artefact
- [ ] Preview shows asset
- [ ] Can remove asset association

**Technical Notes**
- Store assetId in artefact
- Validate asset exists before saving

---

## Epic 4: Release & Gating Logic

### AUTH-020: Set Release Time 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to set when each artefact becomes available (elapsed time),
**So that** the story progresses on a timeline.

**Acceptance Criteria**
- [ ] Artefact editor has "Release Time" field
- [ ] Input: minutes from story start (0-99999)
- [ ] null/empty = always available
- [ ] Can set to "Immediately" (0 min)
- [ ] Can set specific times (10, 30, 60, etc.)
- [ ] Preview shows release schedule
- [ ] Validation: time must be non-negative

**Technical Notes**
- Store as minutes in artefact.releaseAtTime
- null = no time constraint

---

### AUTH-021: Add Release Triggers (Conditions) 🔴
**Priority**: v1 MVP (Critical)
**As a** creator,
**I want** to add conditions that unlock content (beyond just time),
**So that** story progression can depend on player interactions.

**Acceptance Criteria**
- [ ] Artefact editor has "Release Conditions" section
- [ ] "Add Condition" button
- [ ] Launches condition builder modal
- [ ] Supports condition types:
  - Artefact opened (specific artefact)
  - Artefact read/viewed (specific artefact)
  - Password entered correctly
  - App opened (email, IM, calendar, files)
  - Folder opened (specific folder)
  - Manual test flag
- [ ] Conditions show in human-readable summary
- [ ] Can add multiple conditions
- [ ] Can remove conditions
- [ ] Conditions auto-save when added

**Technical Notes**
- Store as ReleaseRule array in artefact.releaseTriggers
- Summary: "Unlock after 15m AND once email_001 opened"

---

### AUTH-022: Build AND/OR Condition Groups 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to combine conditions with AND/OR logic,
**So that** I can express complex unlock requirements.

**Acceptance Criteria**
- [ ] Condition builder supports AND/OR grouping
- [ ] Add group button creates new group
- [ ] Set group operator (AND/OR)
- [ ] Drag conditions into group (or use UI selector)
- [ ] Groups can be nested (optional for v1, at least 1 level)
- [ ] Human-readable summary: "(condition A AND condition B) OR condition C"
- [ ] Group delete/edit
- [ ] Visual layout shows logic clearly

**Technical Notes**
- Store as nested RuleCondition objects
- Evaluate recursively: AND requires all true, OR requires any true
- Keep nesting to 2-3 levels max for clarity

---

### AUTH-023: Add Password Lock 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to password-protect artefacts,
**So that** players must solve puzzles to access content.

**Acceptance Criteria**
- [ ] Artefact editor has "Lock with Password" checkbox
- [ ] When checked, show password field
- [ ] Set password (plaintext for v1)
- [ ] Optional: set hint text
- [ ] Locked artefacts show 🔒 in library
- [ ] Preview shows password prompt in player
- [ ] Player must enter correct password to unlock

**Technical Notes**
- Store in artefact.locked, artefact.lockPassword, artefact.lockHint
- Password validation is case-sensitive string comparison

---

## Epic 5: Timeline & Visualization

### AUTH-024: View Release Timeline 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to see when content is released on a timeline,
**So that** I can visualize story pacing and balance.

**Acceptance Criteria**
- [ ] Timeline view shows artefacts arranged by release time
- [ ] X-axis: elapsed minutes (0 to story end)
- [ ] Y-axis: artefact lanes or grouped by app
- [ ] Color-code: locked (red), gated (yellow), time-only (blue)
- [ ] Hover shows artefact title and release details
- [ ] Click to jump to artefact editor
- [ ] Zoom in/out (optional for v1)
- [ ] Identify clusters/gaps in content

**Technical Notes**
- Can be simple list view sorted by time, not full cinematic timeline
- Structured release board acceptable for v1

---

### AUTH-025: Identify Release Gaps 🟢
**Priority**: v1 MVP (Medium)
**As a** creator,
**I want** warnings about long gaps in story progression,
**So that** I can maintain player engagement.

**Acceptance Criteria**
- [ ] Timeline analysis identifies gaps > X minutes with no new content
- [ ] Highlight gap periods (yellow warning)
- [ ] Show longest gap length
- [ ] Suggest adding content at gap points

**Technical Notes**
- Gap threshold: 30+ minutes without new artefacts
- Optional feature, can be implemented post-MVP

---

## Epic 6: Preview & Testing

### AUTH-026: Launch Story Preview 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to play the story in a test mode,
**So that** I can see how it plays and check pacing/logic.

**Acceptance Criteria**
- [ ] "Preview" button launches player in modal/new window
- [ ] Player loads story and starts from beginning
- [ ] Full player functionality available (read messages, open files, etc.)
- [ ] Test controls sidebar shows:
  - Current elapsed time
  - Button to advance time
  - Unlocked artefacts list
  - Manual unlock button per artefact
  - Restart story button
  - Reset progress button
- [ ] Close preview returns to editor

**Technical Notes**
- Preview uses same Story data as editor
- Uses separate preview IndexedDB instance
- Test controls only visible in preview mode

---

### AUTH-027: Jump to Timestamp in Preview 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to jump to specific times while testing,
**So that** I can quickly check what appears at different points.

**Acceptance Criteria**
- [ ] Preview controls: "Jump to [X] minutes"
- [ ] Input field accepts any time value
- [ ] Clicking jump instantly advances session time
- [ ] Artefacts unlock/change based on new time
- [ ] Can jump backward or forward
- [ ] Shows current elapsed time

**Technical Notes**
- Override session start time to achieve desired elapsed time
- Recalculate what's unlocked at that point

---

### AUTH-028: Force-Unlock Artefacts in Preview 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to manually unlock specific artefacts while testing,
**So that** I can check locked content without waiting or solving puzzles.

**Acceptance Criteria**
- [ ] Each artefact in test controls has "Unlock" button
- [ ] Clicking unlocks artefact immediately (in preview only)
- [ ] Unlocked artefacts show ✓ indicator
- [ ] Unlocking doesn't affect other content
- [ ] Can unlock passwords too
- [ ] Restart preview clears all force-unlocks

**Technical Notes**
- Add test flag to preview session state
- Does not affect authored unlock logic

---

### AUTH-029: Inspect Unlock Conditions in Preview 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to see why an artefact is/isn't unlocked,
**So that** I can debug release logic issues.

**Acceptance Criteria**
- [ ] Click artefact in test controls shows unlock status
- [ ] For locked artefacts: show why (conditions not met)
- [ ] Display each condition and whether it's satisfied:
  - ✓ Time reached (show when)
  - ✓ Artefact opened (show which)
  - ✗ Artefact not opened yet
  - ✓ Password entered
  - Etc.
- [ ] If AND group: show all conditions and which are pending
- [ ] If OR group: show conditions and which are met
- [ ] Human-readable explanation: "Unlocks after 10m AND email_001 opened"

**Technical Notes**
- Evaluate all release rules
- Show condition tree with satisfaction status

---

### AUTH-030: Restart Preview 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to restart the story in preview,
**So that** I can test from the beginning without closing/reopening.

**Acceptance Criteria**
- [ ] "Restart" button in test controls
- [ ] Confirmation: "Restart story? All progress will be lost."
- [ ] On confirm: reset elapsed time to 0, clear unlocked content
- [ ] Story returns to login screen
- [ ] Test controls remain visible

**Technical Notes**
- Clear preview IndexedDB
- Reset session start time

---

## Epic 7: Validation & Export

### AUTH-031: Validate Complete Story 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to validate the entire story for issues,
**So that** I catch problems before publishing.

**Acceptance Criteria**
- [ ] "Validate" button shows validation report
- [ ] Check for:
  - ✓ All artefact IDs unique
  - ✓ No circular dependencies
  - ✓ All release rule references valid
  - ✓ No impossible unlock conditions
  - ✓ Image/Audio assets assigned
  - ✓ Threads/conversations have messages
  - ✓ Ending trigger conditions satisfiable
  - ✓ No orphaned assets
- [ ] Critical errors block export
- [ ] Warnings shown but not blocking
- [ ] Report shows exact issues and how to fix

**Technical Notes**
- Run comprehensive validation
- Provide actionable error messages

---

### AUTH-032: Export Story to JSON 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to export the story as JSON,
**So that** it can be used by the player app.

**Acceptance Criteria**
- [ ] "Export" button downloads story.json
- [ ] JSON includes all story data and assets (as base64)
- [ ] JSON is valid and parseable
- [ ] Can reimport exported story
- [ ] Filename: [storyTitle]-[version].json
- [ ] Show export confirmation

**Technical Notes**
- Serialize Story object to JSON
- Include all assets as base64-encoded strings
- Ensure valid JSON structure

---

### AUTH-033: Import Story from JSON 🟢
**Priority**: v2+ Future
**As a** creator,
**I want** to import a previously exported story,
**So that** I can backup/share and restore stories.

**Acceptance Criteria**
- [ ] "Import" option on dashboard
- [ ] File picker for .json file
- [ ] Validates JSON structure
- [ ] Loads story into editor
- [ ] Preserves all data and assets

**Technical Notes**
- Parse and validate JSON
- Reload assets from base64
- Assign new story ID (or prompt user)

---

## Epic 8: World Building (Senders & Participants)

### AUTH-034: Create Email Senders 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to define email senders/accounts,
**So that** emails have consistent identities.

**Acceptance Criteria**
- [ ] Dashboard or story settings has "Email Senders" section
- [ ] Add sender: name, email, optional avatar/color
- [ ] Edit/delete senders
- [ ] Senders appear as options in email editor
- [ ] Can't delete sender if emails reference them

**Technical Notes**
- Store in Story.emailSenders array
- Reference by ID in EmailArtefact.senderId

---

### AUTH-035: Create IM Participants 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to define IM participants/accounts,
**So that** messages have consistent senders.

**Acceptance Criteria**
- [ ] Dashboard or story settings has "IM Participants" section
- [ ] Add participant: name, username, optional avatar/color
- [ ] Edit/delete participants
- [ ] Participants appear as options in IM editor
- [ ] Can't delete if messages reference them

**Technical Notes**
- Store in Story.imParticipants array
- Reference by ID in IMArtefact.senderId

---

### AUTH-036: Create File Structure (Folders) 🟡
**Priority**: v1 MVP (High)
**As a** creator,
**I want** to define folder structure for file explorer,
**So that** documents/images/audio are organized.

**Acceptance Criteria**
- [ ] "File Structure" view in settings
- [ ] Add/edit/delete folders
- [ ] Folder paths (e.g., "Documents/Work")
- [ ] Nested folder support
- [ ] Artefact editor shows folder paths for placement
- [ ] Invalid paths flagged in validation

**Technical Notes**
- Store in Story.fileStructure as tree or flat list
- References in artefacts use path string

---

### AUTH-037: Configure Calendar Context 🟢
**Priority**: v2+ Future
**As a** creator,
**I want** to configure the calendar's context (year, owner name),
**So that** calendar entries feel integrated.

**Acceptance Criteria**
- [ ] Calendar settings: owner name, default year, timezone (optional)
- [ ] Calendar entries reference this context
- [ ] Display metadata shows context

**Technical Notes**
- Store in Story.calendarConfig
- Optional for v1 MVP

---

## Epic 9: Content Organization & Filtering

### AUTH-038: Filter Artefacts by Thread/Conversation 🟢
**Priority**: v1 MVP (Medium)
**As a** creator,
**I want** to view artefacts grouped by thread or conversation,
**So that** I can organize email/IM content.

**Acceptance Criteria**
- [ ] Library has filter: "Show thread..." / "Show conversation..."
- [ ] Dropdown lists all threads/conversations
- [ ] Filter shows only artefacts in selected group
- [ ] "All" option shows everything
- [ ] Works with other filters (type, etc.)

**Technical Notes**
- Group artefacts by thread/conversation ID
- Combine with other filter criteria

---

### AUTH-039: Tag Artefacts for Organization 🟢
**Priority**: v2+ Future
**As a** creator,
**I want** to tag artefacts with keywords,
**So that** I can organize and search content.

**Acceptance Criteria**
- [ ] Each artefact has tags field
- [ ] Add/remove tags in editor
- [ ] Library filter by tag
- [ ] Tag suggestions/autocomplete
- [ ] Tag cloud view (optional)

**Technical Notes**
- Store tags as string array
- Implement tag management UI

---

## Epic 10: Accessibility & UX

### AUTH-040: Keyboard Navigation 🟢
**Priority**: v2+ Future
**As a** creator,
**I want** to use keyboard shortcuts,
**So that** I can work more efficiently.

**Acceptance Criteria**
- [ ] Ctrl/Cmd+S to save
- [ ] Ctrl/Cmd+N for new artefact
- [ ] Arrow keys to navigate lists
- [ ] Enter to edit selected item
- [ ] Delete to remove selected item
- [ ] Escape to cancel/close dialogs
- [ ] Help screen showing shortcuts

---

### AUTH-041: Dark Mode 🟢
**Priority**: v2+ Future
**As a** creator,
**I want** a dark mode option,
**So that** I can work comfortably in low-light environments.

**Acceptance Criteria**
- [ ] Settings toggle for dark/light mode
- [ ] Dark mode applies to entire UI
- [ ] Preference saved in local storage
- [ ] Respects system dark mode preference (optional)

---

## Summary

### v1 MVP Story Count
- **Critical (🔴)**: 8 stories
- **High (🟡)**: 18 stories
- **Medium (🟢)**: 4 stories
- **Total MVP**: 30 stories

### v2+ Future Stories
- **Medium (🟢)**: 3 stories
- **Low (🔵)**: 3 stories
- **Total Future**: 6 stories

### Recommended v1 MVP Implementation Order
1. Story Management (AUTH-001, 002, 003)
2. Artefact CRUD (AUTH-006 through 012)
3. Release Logic (AUTH-020, 021)
4. Preview (AUTH-026, 027, 028, 029, 030)
5. Asset Management (AUTH-017, 018, 019)
6. World Building (AUTH-034, 035, 036)
7. Validation & Export (AUTH-031, 032)
8. Configuration (AUTH-004, 005)
9. Timeline View (AUTH-024)
10. Library Management (AUTH-015, 016, 038)

---

**Last Updated**: March 2026
**Total Stories**: 41 (30 MVP + 11 Future)
