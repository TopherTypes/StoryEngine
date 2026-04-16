# StoryEngine

A browser-based system for creating and playing ARG (Alternate Reality Game) experiences disguised as immersive faux-desktop environments.

## Project Status

**Phase**: Pre-development (Specification & Planning)

✓ Product Requirements Documents completed  
✓ Technical Specifications drafted  
⏳ Implementation to commence

## Documentation

### Product Specifications
- **[PRD Story Authoring.md](./PRD%20Story%20Authoring.md)** — Complete specification for the authoring tool
- **[PRD Experience Player.md](./PRD%20Experience%20Player.md)** — Complete specification for the player app
- **[SPECS.md](./SPECS.md)** — Technical specifications and implementation contracts
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System architecture and design decisions

## Overview

StoryEngine is a two-part web application:

1. **Story Builder** — A browser-based authoring tool for creators to build timed, gated story experiences with 50-150 artefacts (emails, messages, calendar entries, documents, images, audio).

2. **Experience Player** — A browser-based player presenting story artefacts through a stylised faux-desktop environment. Players explore apps and progressively uncover narrative through timed and interaction-gated content reveals.

The player experience is investigative: content availability is determined by elapsed session time and engagement with key artefacts. Progress persists across sessions via IndexedDB.

## Key Features (v1 MVP)

### Story Builder
- Story metadata and configuration
- Artefact creation and management (email, IM, calendar, documents, images, audio)
- Asset upload and association
- Release timing and gating logic
- Condition builder with AND/OR support
- Timeline visualization for pacing
- Preview mode with debugging utilities
- Custom ending system

### Experience Player
- Faux desktop environment with taskbar and windows
- Email client with thread support
- Instant messenger with conversation threads
- Calendar app with events
- File explorer with folder navigation
- Document, image, and audio viewers
- Hybrid progression engine (time + engagement gates)
- Password-protected content support
- Progress persistence via IndexedDB
- Custom ending screens

## Technology

- **Deployment**: GitHub Pages (static site)
- **Framework**: Flexible (React, Vue, Svelte, or vanilla JS)
- **Browser Support**: Modern desktop browsers
- **Backend**: Not required for v1
- **Storage**: IndexedDB for player progress and state management

---

**Last Updated**: April 2026  
**Status**: Pre-implementation specification phase
