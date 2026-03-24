# StoryEngine

A browser-based system for creating and playing ARG (Alternate Reality Game) experiences disguised as immersive faux-desktop environments.

## Overview

StoryEngine is a two-part web application:

1. **Desktop ARG Story Builder** — A browser-based authoring tool that allows creators to build timed, gated story experiences with 50-150 artefacts (emails, messages, calendar entries, documents, images, audio).

2. **Desktop ARG Player** — A browser-based player that presents story artefacts through a stylised faux-desktop environment. Players log in, explore apps, and progressively uncover a narrative through timed and interaction-gated content reveals.

The player experience is investigative rather than choice-driven: the system controls what becomes available based on elapsed session time and whether players have engaged with key content. State persists across sessions using IndexedDB.

## Project Status

**Phase**: Pre-development (specification & planning)
- ✓ Comprehensive Product Requirements Documents completed
- ✓ Feature backlogs and technical specifications in progress
- ⏳ Implementation pending

## Documentation

### Product Requirements
- [PRD Story Authoring.md](./PRD%20Story%20Authoring.md) — Complete specification for the authoring tool
- [PRD Experience Player.md](./PRD%20Experience%20Player.md) — Complete specification for the player app

### Technical Reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture, data models, and design decisions
- [SPECS.md](./SPECS.md) — Technical specifications and implementation contracts

### Development
- [BACKLOG-AUTHORING.md](./BACKLOG-AUTHORING.md) — User stories for the Story Builder (v1 MVP + future)
- [BACKLOG-PLAYER.md](./BACKLOG-PLAYER.md) — User stories for the Player App (v1 MVP + future)
- [CHANGELOG.md](./CHANGELOG.md) — Version history and release notes

## Key Features (v1 MVP)

### Story Builder
- Story metadata and configuration
- Artefact creation and management (email, IM, calendar, documents, images, audio)
- Asset upload and association
- Release timing and gating logic
- Condition builder supporting AND/OR combinations
- Timeline/release view for pacing visualization
- Preview mode with jump-to-timestamp and force-unlock testing
- Custom ending trigger system

### Player App
- Faux desktop environment with taskbar and windows
- Email client with thread support
- Instant messenger with conversation threads
- Calendar app with events
- File explorer with folder navigation
- Document, image, and audio viewers
- Hybrid progression engine (elapsed time + engagement gates)
- Password-locked content support
- State persistence via IndexedDB
- Custom ending screen

## Technology

### Constraints
- **Deployment**: GitHub Pages compatible (static site)
- **Framework**: No specific preference (React, Vue, Svelte, or vanilla JS all viable)
- **Browser Support**: Modern desktop browsers
- **Backend**: Not required for v1

### Key Technical Decisions
- **Storage**: IndexedDB for player progress and preview testing state
- **Architecture**: Authoring tool and player are separate applications
- **Content Model**: Structured story data (embedable in v1, separable in future versions)

## Key Files & Directories

```
StoryEngine/
├── README.md                    # This file
├── ARCHITECTURE.md              # System design and architecture
├── SPECS.md                     # Technical specifications
├── CHANGELOG.md                 # Version history
├── BACKLOG-AUTHORING.md         # Authoring tool user stories
├── BACKLOG-PLAYER.md            # Player app user stories
├── PRD Story Authoring.md       # Complete authoring tool spec
└── PRD Experience Player.md     # Complete player app spec
```

## Getting Started (Implementation)

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design overview
2. Review [SPECS.md](./SPECS.md) for detailed technical requirements
3. Choose your technology stack (must support static GitHub Pages deployment)
4. Use [BACKLOG-AUTHORING.md](./BACKLOG-AUTHORING.md) and [BACKLOG-PLAYER.md](./BACKLOG-PLAYER.md) to guide implementation prioritization
5. v1 MVP is complete when all stories marked "v1 MVP" are done

## Development Priorities

**Phase 1 (v1 MVP)**
- Core data models (Story, Artefact, Progression Rules)
- Basic UI for both apps
- Progression engine (time + gate-based unlocking)
- IndexedDB persistence
- All content types and app windows

**Phase 2+ (Future)**
- Theme system
- Additional file types
- Search and filtering
- Cloud storage
- Enhanced preview features
- Collaboration support

## Success Criteria (v1)

**Story Builder** can:
- Define a complete 50-150 artefact story
- Support mixed timed and gated progression
- Preview and debug without code edits
- Produce output consumable by Player app

**Player App** can:
- Present convincing faux desktop
- Unlock content on time/gate conditions
- Persist progress across sessions
- Support password-locked content
- Trigger custom ending screens

## Contact & Contributing

This project is currently in specification phase. Check back soon for development guidelines and contribution opportunities.

---

**Last Updated**: March 2026
**Project Lead**: [Your name here]
