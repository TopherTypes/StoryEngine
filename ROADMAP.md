# StoryEngine Authoring Tool — Product Roadmap

**Last Updated**: April 2026  
**Status**: Pre-implementation

---

## Overview

This roadmap outlines the development path for the **StoryEngine Authoring Tool**, a desktop-native application for creating timed, gated ARG experiences. The tool outputs a proprietary story package format (`.story` file) consumable by a separate browser-based player application.

### Technology Foundation

- **Platform**: Desktop application (Java/C#/Electron)
- **UI Model**: Docking panels with modal workflows
- **Persistence**: Single file with internal hierarchy
- **Save Model**: Auto-save every 5 minutes (configurable) + manual save + dirty state warnings
- **Export Format**: Compressed proprietary package for player consumption

---

## Phase 0: Foundation (No UI)

**Purpose**: Establish core data model and persistence layer before building any UI.

**Duration Estimate**: 2–3 weeks

### Deliverables

#### Project File System
- Single-file project format with internal hierarchical structure
- Save/load functionality with file I/O handling
- Auto-save system (configurable interval, default 5 minutes)
- Manual save with dirty state tracking
- Exit warning when unsaved changes exist

#### Schema Management
- Version metadata embedded in project files
- Migration system to upgrade older project schemas on load
- Force re-save to current schema after migration

#### Core Data Model
- **Story**: Metadata, configuration, theme settings, ending configuration
- **Artefacts**: Email, IM, calendar, document, image, audio types
- **Assets**: File embedding with deduplication support
- **Conditions**: Rule structure for release logic (time-based and interaction-based)
- **Containers**: Email threads, IM conversations, folders, app contexts

#### Validation Foundation
- Data integrity checks on load
- Reference validation (artefacts → assets, conditions → artefacts)
- Basic error reporting structure

**Success Criteria**: Project can be created programmatically, saved, loaded, and migrated without data loss.

---

## Phase 1: Core MVP — "Can I build a simple timed story?"

**Purpose**: Deliver a minimally usable authoring tool capable of producing basic time-gated stories with simple interaction logic.

**Duration Estimate**: 4–5 weeks

### UI Surfaces

#### Story Dashboard
- Display story metadata (title, author, description)
- Show artefact counts by type
- Display total asset count
- Quick validation status summary
- Access to project settings

#### Timeline View (Read-Only)
- Visual representation of artefacts on a time axis
- Click artefact to open in editor
- Visual indicators for artefact type
- Basic zoom/scroll navigation
- Time markers at regular intervals

#### Artefact List Panel
- Table/list view of all artefacts
- Create new artefact by type
- Edit existing artefact (opens editor)
- Delete artefact with confirmation
- Filter by artefact type
- Sort by release time, type, or title

#### Artefact Editor Forms
Individual editor forms for each content type:

- **Email**: Sender, recipients, subject, thread assignment, body, timestamp metadata
- **IM**: Conversation assignment, sender, message body, display order
- **Calendar**: Event title, date/time, description, attendees (passive display)
- **Document**: Title, body text or file asset, folder placement
- **Image**: Image asset, optional caption/title, folder placement
- **Audio**: Audio asset, title, folder placement

Common fields across all types:
- Internal label
- Visible title
- App/context placement
- Release timing
- Lock settings (password protection)

#### Asset Library Panel
- Upload asset files (copy into project)
- List view showing filename and type
- Associate assets with artefacts
- Delete assets with orphan warning
- File type validation on upload

### Condition System (Simplified)

#### Supported Condition Types
- **Elapsed time**: "Unlock at X minutes from story start"
- **Artefact opened**: "Unlock when artefact Y is opened" (single interaction gate type)

#### Condition Builder UI
- Simple form-based interface
- Single condition per artefact (no AND/OR groups yet)
- Human-readable summary display

### Export Capability

- Export story to compressed player package format
- Validate before export (block if critical errors exist)
- Progress indicator for export process
- Success confirmation with file location

### Validation (Basic)

- Missing asset reference warnings
- Invalid artefact references (threads, conversations, folders)
- Unreachable artefacts detection ("will never unlock")
- Missing placement warnings
- Export-blocking vs. warning-level issues

### Success Criteria

A creator can:
1. Create a new story project
2. Add 50+ artefacts across all supported types
3. Upload and embed assets
4. Define time-based release schedules
5. Add simple interaction gates (one artefact gates another)
6. Validate the story for basic errors
7. Export a playable story package
8. Save and reload the project without data loss

---

## Phase 2: Enhanced v1 — "Can I build a complex gated story?"

**Purpose**: Add sophisticated gating logic, visual editing, and comprehensive validation tools.

**Duration Estimate**: 4–5 weeks

### Priority 1: Editable Timeline

#### Interactive Timeline Features
- Drag artefacts along time axis to adjust release time
- Multi-select for bulk time adjustments
- Visual snap-to-grid or freeform positioning toggle
- Zoom and pan controls for long stories (50–150 artefacts)
- Filter timeline by artefact type, gating status, or app context
- Visual condition indicators:
  - ⏱️ Time-gated only
  - 🔒 Password-locked
  - 🔗 Interaction-gated
  - 🔗⏱️ Hybrid (time + interaction)

#### Timeline Quality of Life
- Mini-map for navigation
- Time ruler with adjustable granularity (seconds/minutes/hours)
- Cluster detection warnings (too many artefacts at same timestamp)
- Gap detection (long periods with no content)

### Priority 2: Advanced Condition Builder

#### Condition Types Expansion
- Artefact opened
- Artefact read/viewed (completion tracking)
- Password entered correctly
- Specific app opened
- Specific folder accessed
- Manual test flag

#### Condition Logic
- AND groups (all conditions must be met)
- OR groups (any condition can trigger)
- Nested AND/OR combinations (one level deep)
- Visual rule builder interface (form-based or node-based)

#### Dependency Visualization
- Dependency graph showing which artefacts gate which others
- Highlight circular dependencies
- Show unreachable content paths
- Click to jump to related artefacts

### Asset Library Enhancement

#### Visual Previews
- Thumbnail generation for images
- Waveform preview for audio files
- File size display
- Last modified metadata

#### Asset Management
- Bulk upload multiple files
- Orphaned asset detection and cleanup
- Asset usage count (how many artefacts reference this)
- Replace asset (swap file while maintaining references)

### Artefact Management Enhancement

#### Bulk Operations
- Duplicate artefact (creates copy with all settings)
- Multi-select artefacts for bulk edits
- Bulk reassign to different folders/contexts
- Bulk time adjustments

#### Search and Filter
- Full-text search across artefact content
- Filter by multiple criteria simultaneously
- Save filter presets
- Search within specific artefact types

### Validation Dashboard

#### Centralized Validation Panel
- Show all validation issues in categorized list
- Click to jump directly to problem artefact
- Filter by severity (error/warning/info)
- Export validation report

#### Advanced Validation Checks
- Circular dependency detection
- Unreachable content detection (no valid unlock path)
- Password collision detection (same password used multiple times)
- Thread/conversation continuity checks (gaps in conversation order)
- Asset format compatibility warnings

### Success Criteria

A creator can:
1. Build complex multi-condition unlock logic
2. Visually edit story pacing via timeline drag-and-drop
3. Identify and resolve all dependency issues
4. Manage 100+ artefacts efficiently
5. Preview asset content before assigning
6. Validate progression logic before export

---

## Phase 3: Enhanced v1 — "Can I test and debug my story?"

**Purpose**: Enable rapid iteration through preview, testing, and debugging tools.

**Duration Estimate**: 2–3 weeks

### Debug Preview Mode

#### Preview Capabilities
- Launch debug visualization window
- Display all artefacts with current lock/unlock state
- Jump to specific timestamp (simulate elapsed time)
- Force-unlock specific artefacts for testing
- Inspect unlock conditions with pass/fail status for each rule
- Restart from clean state (reset all progress)

#### Debug Information Display
- Current elapsed time
- List of triggered events
- Read/opened state summary
- Unmet condition breakdown by artefact
- Next scheduled unlock events

### Undo/Redo System

- Full operation history stack
- Undo/redo for all editing operations
- Visual undo history browser
- Undo limit (configurable, default 50 operations)

### UI Polish

#### Keyboard Shortcuts
- Common operations (save, undo, redo, new artefact)
- Navigation shortcuts (switch panels, focus timeline)
- Quick access to preview mode
- Customizable shortcut configuration

#### Settings Panel
- Auto-save interval configuration
- Theme toggle (dark/light mode)
- Default values for new artefacts
- UI preferences (panel layouts, default filters)

#### Panel Management
- Save panel layout configurations
- Reset to default layout
- Quick panel show/hide toggles
- Floating vs. docked panel options

### Quality of Life Features

#### Project Management
- Recently opened projects list (quick access)
- Project templates:
  - "Detective Mystery" starter
  - "Corporate Conspiracy" starter
  - "Blank" (empty project)
- Project metadata (created date, last modified, artefact count)

#### Workflow Helpers
- Artefact count warnings (approaching 150-artefact complexity limit)
- Time distribution analysis (show pacing balance)
- Completion percentage estimate (based on required vs. optional artefacts)

### Success Criteria

A creator can:
1. Test story progression without manual playthrough
2. Quickly identify why specific artefacts aren't unlocking
3. Iterate rapidly using undo/redo
4. Customize workflow to personal preferences
5. Start new projects from useful templates

---

## Phase 4: Speculative v2+ — "What comes after v1?"

**Purpose**: Long-term vision for scaling, collaboration, and advanced authoring capabilities.

**Duration Estimate**: TBD (post-v1 evaluation)

### Templates and Reusability

#### Story Templates
- Genre-based starter templates (detective, conspiracy, horror, romance)
- Pre-built artefact structures with placeholder content
- Template marketplace or sharing system

#### Artefact Templates
- Email signature blocks
- IM conversation starters
- Calendar event patterns
- Document boilerplate

#### Condition Presets Library
- Common gating patterns (sequential unlocks, parallel paths, delayed reveals)
- Save custom condition groups for reuse
- Share condition presets between projects

### Advanced Content Types

- **PDF Documents**: Embedded viewer support
- **Spreadsheets**: CSV/Excel file integration
- **Web Pages**: Embedded HTML snippets with sandboxing
- **Video Files**: MP4/WebM support with player integration
- **Interactive Elements**: Forms, puzzles, embedded mini-games

### Branching and Variants

#### Multiple Endings
- Define multiple ending trigger conditions
- Conditional ending screens based on player choices
- Track ending achievement across playthroughs

#### Story Branches
- Optional alternate paths based on player actions
- Conditional artefact availability (only unlocks in specific branches)
- Branch visualization in timeline

#### Player Choice Modeling
- Decision points with consequences
- Choice tracking and state management
- Branching dialogue systems (if moving beyond pure investigation)

### Publishing Workflows

#### Story Metadata
- Genre tags
- Difficulty rating
- Content warnings
- Estimated playtime
- Author bio and links

#### Export Options
- One-click web export (player + story bundle)
- Standalone executable (desktop player + story)
- Mobile-optimized export
- Hosted solution integration (itch.io, GitHub Pages)

#### Analytics Integration
- Embed analytics hooks in exported stories
- Heatmaps of player engagement
- Drop-off analysis (where players stop)
- Completion rate tracking
- Popular path analysis

### Collaboration Features

#### Multi-User Editing
- Real-time collaborative editing
- Conflict resolution for simultaneous edits
- User permissions (owner, editor, viewer)
- Activity feed showing recent changes

#### Version Control Integration
- Git integration for project files
- Diff viewer for story changes
- Merge tools for conflicting edits
- Branch management for experimental variants

#### Review and Feedback
- Comment system on artefacts
- Review mode (playtest with annotations)
- Feedback collection and resolution tracking

### Advanced Asset Tools

#### In-App Editing
- Image editing (crop, rotate, brightness/contrast, filters)
- Audio trimming and normalization
- Video trimming and subtitle embedding
- Basic color grading and effects

#### Asset Optimization
- Automatic compression based on target platform
- Format conversion (e.g., PNG → WebP)
- Resolution scaling for mobile export
- Asset bundle size warnings

#### External Tool Integration
- Launch external editors (Photoshop, Audacity, etc.)
- Watch for file changes and auto-reload
- Preserve edit history

### Advanced Validation and Testing

#### AI-Powered Analysis
- Pacing recommendations based on story length
- Difficulty curve analysis
- Engagement prediction
- Content balance warnings (too much email vs. IM, etc.)

#### Automated Testing
- Bot playthroughs to verify all content is reachable
- Stress testing (simulate different player behaviors)
- Regression testing (verify old projects still work after updates)

#### Accessibility Analysis
- Color contrast checking
- Alt-text requirements for images
- Audio transcription validation
- Readability scoring

### Localization Support

- Multi-language content management
- Translation workflow (source → target language)
- Language switching in player
- RTL language support
- Font and layout adjustments per language

---

## Success Metrics

### Phase 1 Success
- Can produce a complete playable story in under 8 hours of authoring time
- Zero critical bugs in export/import workflow
- Validation catches 95%+ of common errors

### Phase 2 Success
- Complex condition logic (10+ interconnected gates) is comprehensible
- Timeline editing reduces time-adjustment tasks by 70%
- Dependency visualization prevents circular reference bugs

### Phase 3 Success
- Debug preview reduces testing time by 50%
- Undo/redo prevents 90%+ of "start over" moments
- Creator completes first story without external documentation

### Phase 4 Success
- Templates reduce new project setup time by 80%
- Collaboration features support 3+ simultaneous authors
- Published stories reach player audiences via integrated distribution

---

## Risk Factors and Mitigation

### Technical Risks

**Risk**: Schema migration fails on complex projects  
**Mitigation**: Comprehensive migration tests, backup-before-migration enforcement

**Risk**: Timeline editing performance degrades with 150+ artefacts  
**Mitigation**: Virtualized rendering, lazy loading, level-of-detail optimization

**Risk**: Export format becomes bloated with large asset libraries  
**Mitigation**: Asset compression, deduplication, optional quality tiers

### UX Risks

**Risk**: Condition builder is too complex for non-technical creators  
**Mitigation**: Wizard-based templates, AI-assisted condition generation in v2

**Risk**: Timeline becomes cluttered and unreadable  
**Mitigation**: Filtering, grouping, collapse/expand controls

**Risk**: Preview mode doesn't accurately represent player experience  
**Mitigation**: Phase 3 includes eventual real player integration for testing

### Scope Risks

**Risk**: Feature creep delays MVP delivery  
**Mitigation**: Strict phase gates, defer all "nice-to-have" items to later phases

**Risk**: Condition model proves insufficient for complex stories  
**Mitigation**: Phase 2 validation includes real-world story testing

---

## Appendix: Open Questions

Questions to resolve during development:

1. **Export format**: JSON + ZIP? Custom binary? SQLite database?
2. **Player integration**: Does authoring tool embed minimal player for preview, or separate app?
3. **Asset storage**: Embedded base64? File references? Hybrid?
4. **Condition evaluation**: Client-side only or server validation option for v2?
5. **Cross-platform**: Target Windows only, or macOS/Linux from start?
6. **Update distribution**: Auto-update system or manual download releases?

---

**End of Roadmap**
