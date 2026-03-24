# PRD 2 — Player Experience App

## Product name

**Desktop ARG Player**

## Product type

Browser-based faux desktop experience that reads structured story data and presents a timed, gated investigative narrative through files, messages, and apps.

## 1. Product overview

### Summary

Desktop ARG Player is a browser-based interactive story interface that simulates a modern desktop computer environment. The player logs in, opens apps, reads messages, explores files, and gradually uncovers a story through timed and gated content releases.

The experience is investigative rather than choice-driven. The system does not branch based on player decisions; instead, it controls what becomes available based on elapsed session time and whether the player has engaged with key content.

### Core fantasy

> “I am inside someone’s digital world, piecing together a story from what appears on their desktop over time.”

### v1 position

v1 is a **stylised faux-OS investigative player**, not a realistic computer simulation and not a game with broad mechanical interaction.

It focuses on:
- immersion
- pacing
- persistence across sessions
- readable narrative presentation
- controlled reveal logic

---

## 2. Product goals

### Primary goals

1. Deliver a compelling faux desktop experience in-browser.
2. Present story artefacts through appropriate apps and windows.
3. Support hybrid progression using elapsed time and engagement gates.
4. Persist story state across sessions using browser storage.
5. Support a custom story ending.

### Secondary goals

1. Make the interface feel coherent and believable.
2. Allow live-feeling arrival of some messages/content when appropriate.
3. Keep the experience manageable for solo-engine production.

### Non-goals for v1

- branching storylines
- user-generated responses
- search systems
- full operating system simulation
- player notes
- mobile-first support
- multiplayer/shared sessions
- cloud saves/accounts
- complex system settings or sandbox behaviour

---

## 3. Target player experience

The player should feel like they are:

- logging into a real but stylised desktop environment
- gradually discovering sensitive or meaningful artefacts
- experiencing story progression as both time-driven and discovery-driven
- constructing their own interpretation of events
- reaching a designed ending through investigation rather than explicit win/lose mechanics

---

## 4. Product principles

### 4.1 Presentation should serve discovery
Every UI element exists to help deliver story artefacts believably.

### 4.2 The system should feel alive, but not overcomplicated
Some content may appear while the player is exploring, but the OS does not need deep simulation.

### 4.3 Reading is the core interaction
The player primarily opens, inspects, and interprets.

### 4.4 Timing and gating should remain invisible when possible
The player should feel story flow, not mechanics.

### 4.5 Persistence matters
The experience must survive multi-session play.

---

## 5. Experience scope

## Included in v1
- theatrical login flow
- desktop shell
- faux apps/windows
- email viewing
- IM conversation viewing
- calendar entry viewing
- document viewing
- image viewing
- audio playback
- folder/file exploration
- password locks
- hybrid progression engine
- state persistence using IndexedDB
- custom ending trigger and ending screen
- one default theme with configurable variables

## Excluded from v1
- search
- built-in notes
- branching
- replying/typing back
- file manipulation by player
- terminal simulation
- browser/intranet app
- spreadsheet/PDF-native rendering
- system settings management
- deep multi-theme support
- mobile-optimised redesign

---

## 6. Core user journey

### 6.1 Start
The player lands on the story app and selects/starts the story.

### 6.2 Login
The player encounters a theatrical login screen.
This is primarily framing, not a major puzzle in v1.

### 6.3 Explore
The player opens the desktop, explores folders/apps, and begins reading artefacts.

### 6.4 Progression
As elapsed session time advances and required interactions occur, new artefacts become available.

### 6.5 Investigation
The player pieces together relationships, chronology, and implications through content.

### 6.6 Ending
Once ending trigger conditions are met, a custom ending screen is shown.

---

## 7. Interaction model

## 7.1 Allowed player actions in v1
- log in
- open apps
- open folders
- open artefacts
- read/view/listen
- enter passwords for locked content
- close/minimise/move windows if supported by UI shell
- resume saved progress
- restart story if allowed

## 7.2 Disallowed player actions in v1
- reply to messages
- author new content
- alter story state arbitrarily
- branch the plot
- search across content
- take notes inside the product
- reorganise the desktop

---

## 8. Faux desktop shell

## 8.1 Desktop style
The system should resemble a **modern-feeling PC desktop** with a stylised but credible faux-OS presentation.

### v1 visual goals
- believable enough to support immersion
- clear enough not to confuse usability
- neutral enough to support later tonal variations

### v1 theming
- one default theme
- configurable values such as wallpaper, accent colour, icon/app naming, and some branding details

No full theme-pack system in v1.

---

## 8.2 Desktop components
The shell may include:
- login screen
- desktop background
- desktop icons
- taskbar/dock equivalent
- app windows
- simple status/chrome elements

The goal is a convincing presentation layer, not full OS fidelity.

---

## 9. Apps and content surfaces

## 9.1 Email app
### Requirements
- inbox/list view
- thread view
- support newly appearing messages
- show sender, subject, and body
- show messages within thread context

### v1 note
Email threads are first-class structures; messages unlock individually.

---

## 9.2 Instant messaging app
### Requirements
- conversation list
- message history per conversation
- support progressive arrival of messages where story demands it
- distinguish senders clearly

### v1 note
Conversations are first-class structures; messages unlock individually.

---

## 9.3 Calendar app
### Requirements
- view calendar entries
- show event metadata and descriptions
- operate primarily as passive contextual clue space

No reminder pop-ups in v1.

---

## 9.4 File explorer
### Requirements
- folder navigation
- file listing
- support locked items/folders
- allow opening documents, images, and audio

---

## 9.5 Document viewer
### Requirements
- display text documents clearly
- preserve tone and formatting where needed
- support read/open state tracking

---

## 9.6 Image viewer
### Requirements
- open image artefacts
- display them clearly
- record opened/viewed state

---

## 9.7 Audio player
### Requirements
- open and play audio artefacts
- basic playback controls sufficient for story use
- record accessed state appropriately

---

## 10. Progression engine

## 10.1 Core logic
Progression is governed by:
- elapsed session time since story start
- persisted across sessions
- required interaction triggers
- lock/unlock conditions
- ending trigger conditions

---

## 10.2 Supported v1 progression triggers
The player app must honour:
- elapsed time reached
- specific artefact opened
- specific artefact read/viewed
- password entered correctly
- specific app/folder opened
- manual test flag support only in preview/dev context
- AND/OR condition groups

---

## 10.3 Progression rules
The engine must support:
- content that unlocks on time alone
- content that unlocks only after required interaction
- content that uses both timing and engagement gates
- content that remains hidden until conditions are met
- custom ending trigger

### Narrative implication
The story can continue advancing in some areas while key gates hold back others.

---

## 10.4 Content arrival behaviour
The system should support both:
- static already-present artefacts
- newly appearing artefacts/messages during play

This behaviour should be controlled by story data.

---

## 11. Save and persistence model

## 11.1 Storage approach
Use **IndexedDB** for v1.

### Persisted state should include
- story started state
- elapsed play/session time model
- unlocked content
- opened/read/viewed state
- password unlock state
- app/folder visited state where relevant
- ending reached state
- restart/reset state

### Explicitly not required in v1
- cross-device sync
- user accounts
- cloud backup

---

## 11.2 Resume behaviour
The player should be able to leave and return later without losing progress.

The system should continue from:
- stored unlock state
- stored read/open state
- appropriate elapsed story/session time state

This is critical to the experience model.

---

## 12. Password-locked content

## 12.1 v1 lock behaviour
Locked content should:
- request a password
- validate correct/incorrect
- unlock on success
- persist unlocked state

### Optional story support
Hints may be discoverable elsewhere in the experience.

### Out of scope
- realistic account systems
- multiple security levels
- anti-bruteforce behaviour
- dynamic password generation

---

## 13. Ending system

## 13.1 Ending trigger
The story should support a custom ending trigger based on defined conditions.

## 13.2 Ending presentation
When triggered, the experience should display a custom ending screen.

### Ending screen may include
- title
- body text
- optional image
- restart option
- optional “continue exploring” behaviour if story config permits

This should feel intentional, not like content simply stops.

---

## 14. UX requirements

## 14.1 Overall UX goals
The interface should feel:
- immersive
- legible
- coherent
- slightly theatrical
- not mechanically noisy

## 14.2 Desktop UX goals
- clear app affordances
- readable content windows
- enough windowing behaviour to sell the fiction
- not so many controls that usability suffers

## 14.3 Content UX goals
- reading-focused
- clean visual hierarchy
- timestamps and metadata where story-relevant
- believable presentation matching content type

## 14.4 Avoid in v1
- excessive realism that harms usability
- dense interface chrome
- hidden critical interactions
- fake complexity with no narrative payoff

---

## 15. Technical constraints

### Platform
- browser-based
- desktop-first
- suitable for GitHub Pages deployment

### Architecture direction
For v1, story content may be embedded directly into the app build.

However, the player should still be architected as though it is reading structured story data, to support future separation.

### Storage
- IndexedDB for state
- no backend required

### Compatibility target
Modern desktop browsers.

### Not prioritised
- mobile browsers
- offline-first packaging
- server persistence

---

## 16. Success criteria

The player app succeeds in v1 if it can:

1. convincingly present a faux desktop environment
2. render all supported story artefact types
3. unlock content according to timed and gated conditions
4. preserve progress across sessions
5. support password-locked artefacts
6. reach a custom story ending cleanly
7. feel immersive enough that the player focuses on discovery, not mechanics

---

## 17. MVP acceptance criteria

A v1 MVP should be considered complete when it can do all of the following:

- display a login screen and transition to desktop
- render a default faux-OS shell
- open apps/windows for email, IM, calendar, files, documents, images, and audio
- display email threads and IM conversations correctly
- track opened/read/viewed state
- unlock content on elapsed-time rules
- unlock content on supported interaction gates
- combine conditions with AND/OR logic
- prompt for and validate passwords on locked items
- persist story progress in IndexedDB
- restore saved state on return
- trigger and display a custom ending screen
- reset story progress cleanly

---

## 18. Future expansion opportunities

Not for v1, but strategically relevant:

- importable story bundles
- additional file/app types
- search across emails/files/messages
- in-app notes
- multiple desktop themes
- faux browser/intranet
- PDF/spreadsheet rendering
- notification/reminder systems
- more dynamic live events
- cloud saves
- public story library
- accessibility refinements specific to long-form investigative play
