# PRD 1 — Story Authoring Tool

## Product name

**Desktop ARG Story Builder**

## Product type

Browser-based authoring tool for creating timed, gated story data and associated assets for a faux-desktop investigative narrative experience.

## 1. Product overview

### Summary

Desktop ARG Story Builder is a browser-based authoring tool that allows a creator to build story-driven desktop ARG experiences by defining:

- story artefacts such as emails, IMs, calendar entries, documents, images, and audio
- where those artefacts appear in the simulated desktop
- when they become available
- what conditions gate their release
- how the story ends

The tool is intended primarily for a solo creator building one or more playable stories for a separate player-facing browser experience.

### Core fantasy

> “I can build a convincing timed digital mystery by arranging artefacts, release conditions, and presentation rules without hand-authoring the entire experience directly in code.”

### v1 position

v1 is a **constrained hybrid authoring system**:
- **artefact-first editing**
- with a **lightweight timeline/release view**
- and **basic condition logic**
- plus **preview/testing controls**

It is not a full cinematic editor, not a node graph story engine, and not a collaboration platform.

---

## 2. Product goals

### Primary goals

1. Allow a creator to define a complete playable story from 50–150 artefacts.
2. Support hybrid progression using:
   - elapsed session time
   - interaction gates
   - password locks
   - simple condition groups
3. Keep authoring comprehensible for a solo creator.
4. Support preview/testing so story pacing and logic can be validated quickly.
5. Produce story output that can be consumed by the separate player app.

### Secondary goals

1. Make assets manageable without external manual file bookkeeping.
2. Make release logic inspectable enough to debug broken progression.
3. Lay groundwork for future packaging/export models beyond embedded build content.

### Non-goals for v1

- multi-user collaboration
- cloud sync
- version control built into the tool
- branching narrative design
- dialogue trees
- live reminders/notification scripting for calendars
- in-tool story publishing
- complex theming systems
- search across story content
- embedded player notes authoring
- procedural content generation

---

## 3. Target user

### Primary user

A solo creator designing ARG-like, story-rich faux desktop experiences for web delivery.

### Likely characteristics

- comfortable with structured systems
- willing to work with metadata and conditions
- wants control over pacing and reveal order
- values preview/testing over flashy tooling
- may later want to release stories publicly

---

## 4. Product principles

### 4.1 Artefacts are the centre of the model
The story is built from discrete pieces of evidence/content, not scenes or branches.

### 4.2 Timing matters, but timing alone is not enough
Elapsed session time drives pacing, but narrative control requires engagement gates.

### 4.3 The tool should reduce mental bookkeeping
The creator should not need to manually remember every dependency or release condition.

### 4.4 Preview is a core feature, not an extra
If the creator cannot easily test unlock logic and pacing, the product fails.

### 4.5 v1 favours clarity over expressive power
A smaller condition model that is easy to debug is better than a flexible but opaque system.

---

## 5. User problems

The tool should solve these problems:

1. **Release complexity problem**  
   Manually tracking when each file/message should appear becomes difficult as the story grows.

2. **Dependency problem**  
   Later reveals may depend on the player opening, reading, or unlocking earlier items.

3. **Asset organisation problem**  
   A story includes many content types, senders, folders, threads, and presentation contexts.

4. **Testing problem**  
   It is slow and error-prone to repeatedly play through a timed story to check pacing.

5. **Debugging problem**  
   When a reveal fails to unlock, the creator needs to see why.

---

## 6. Scope for v1

### Included in v1

- story metadata definition
- artefact creation/editing
- asset upload/association
- release timing
- condition-based gating
- simple password locking
- email threads
- IM conversations
- calendar entries
- file/folder placement
- lightweight release timeline view
- preview/testing mode
- restart/reset story state in preview
- inspect unlock conditions
- jump to timestamp
- force-unlock for testing
- ending trigger and ending screen definition
- output consumable by the player app

### Excluded from v1

- story search tools
- branching narrative structures
- player note systems
- advanced condition scripting language
- reusable theme packs
- collaboration and permissions
- analytics dashboards
- public story publishing workflows
- in-tool cloud asset hosting
- localisation workflows
- asset editing beyond basic metadata/association

---

## 7. Core content model

## 7.1 Story
A story is the top-level playable experience.

### Story fields
- story ID
- title
- description
- author
- version
- default theme/config values
- opening/login config
- ending config
- global settings

---

## 7.2 Artefact
An artefact is any player-facing content object.

### Supported v1 artefact types
- email message
- instant message
- calendar entry
- text document
- image
- audio file

### Common artefact fields
- artefact ID
- title/internal label
- type
- visible title
- body/content reference
- associated asset(s)
- location/app placement
- locked/unlocked status rules
- release rules
- tags/internal notes
- thread or conversation membership where relevant

---

## 7.3 Containers and presentation contexts

Artefacts do not exist in a void; they appear somewhere in the faux OS.

### Supported v1 contexts
- email inbox/thread
- IM conversation window
- calendar app
- file explorer folders
- desktop shortcuts/icons
- image viewer
- audio player
- document viewer

---

## 7.4 Threads and conversations

### Email threads
Emails belong to a thread.
Individual emails can unlock at different times or conditions.

### IM conversations
IM messages belong to a conversation.
Individual messages can unlock progressively.

This model is required in v1.

---

## 7.5 Locks
Some artefacts or folders can be locked.

### v1 lock model
- preset password
- optional hint stored elsewhere in the story
- player enters password
- correct/incorrect feedback only

No brute-force simulation, no account recovery logic, no adaptive security systems.

---

## 8. Release and condition model

## 8.1 Core progression model

Story progression is based on:
- **elapsed session time since story start**
- **interaction-trigger conditions**
- **condition groups**
- optional combinations of both

Progress should persist across sessions using saved state.

---

## 8.2 Supported v1 trigger types

The following triggers must be supported:

1. elapsed time reached
2. specific artefact opened
3. specific artefact read/viewed
4. password entered correctly
5. specific app or folder opened
6. manual preview/test flag set
7. AND/OR condition groups combining the above

---

## 8.3 Release rule structure

Each artefact may define:
- earliest release time
- zero or more unlock conditions
- optional dependency group
- optional visibility state until unlocked

### Example conceptual logic
- Release at 10 minutes regardless
- Release after 10 minutes **and** email_003 has been opened
- Unlock file only if password has been entered correctly
- Show ending only when all final conditions are satisfied

---

## 8.4 v1 design constraint
To keep logic debuggable, v1 should avoid:
- nested logic more than one layer deep if possible
- arbitrary scripting
- custom event code authored by users

A structured rule builder is preferred over free-form logic scripting.

---

## 9. Authoring workflow

## 9.1 Primary workflow shape
v1 will follow **Option 3**:

- **form/database editor first**
- **lightweight timeline view second**
- **preview mode for validation**

This is the core design decision for the product.

---

## 9.2 Recommended workflow

### Step 1 — Create story shell
Define:
- title
- theme config
- login framing
- basic desktop structure
- ending screen placeholder

### Step 2 — Define world entities
Define:
- email accounts/senders
- IM participants
- folders/locations
- calendar identity/context

### Step 3 — Create artefacts
Add artefacts with:
- content
- asset attachments
- placement
- thread/conversation membership

### Step 4 — Define release logic
Set:
- elapsed time
- gating conditions
- locks/passwords if needed

### Step 5 — View in timeline/release view
Check pacing and clustering.

### Step 6 — Preview and debug
Use:
- jump to timestamp
- force unlock
- inspect conditions
- restart from clean state

### Step 7 — Finalise output
Produce story data consumable by the player app.

---

## 10. Feature requirements

## 10.1 Story dashboard
The authoring tool should provide a top-level story dashboard showing:

- story metadata
- total artefact count
- artefacts by type
- count of locked items
- count of conditional items
- count of items with missing assets or invalid references
- quick access to preview

---

## 10.2 Artefact library
The artefact library is the main management surface.

### Required capabilities
- create new artefact
- duplicate artefact
- edit artefact
- delete artefact
- filter by type
- filter by thread/conversation/container
- sort by release time
- identify locked items
- identify items with unmet/invalid configuration

### Recommended fields visible in list/table
- title
- type
- placement
- release time
- gated yes/no
- locked yes/no
- status/validation

---

## 10.3 Artefact editor

Each artefact editor should support:

### Common
- internal label
- visible label/title
- content body or linked asset
- app/context placement
- release timing
- condition rules
- lock settings
- preview snippet

### Email-specific
- sender
- recipients
- subject
- thread
- body
- timestamp display metadata

### IM-specific
- conversation
- sender
- message body
- display order in conversation

### Calendar-specific
- event title
- date/time metadata
- description
- attendees optionally represented
- passive clue role only in v1

### Text document
- title
- body text or file asset
- folder placement

### Image
- image asset
- optional caption/title
- folder placement

### Audio
- audio asset
- title
- folder placement

---

## 10.4 Asset management
The tool should support asset upload and association.

### v1 requirements
- upload asset files
- see asset filename/type
- associate asset with artefact
- flag missing asset reference
- prevent broken output where possible

### Out of scope
- cropping
- editing
- transcoding
- waveform editing
- OCR
- advanced metadata extraction

---

## 10.5 Release/timeline view
A secondary view should visualise pacing.

### v1 purpose
- help the creator understand story flow
- reveal clusters and gaps
- not serve as the only editing interface

### v1 requirements
- list or lane view by elapsed time
- show artefacts at their release points
- indicate which items are gated
- indicate locked items
- allow clicking through to edit

This can be implemented as a structured release board rather than a full drag-and-drop cinematic timeline if needed.

---

## 10.6 Condition builder
A condition builder is required.

### v1 requirements
- select supported trigger types
- combine rules via AND/OR groups
- attach conditions to artefacts and ending trigger
- show human-readable rule summary

### Example summary
- “Unlock after 15m AND once email_004 is opened”
- “Unlock when password for folder_medical_archive is entered”

### Critical requirement
The UI must make it obvious **why** an item is still locked.

---

## 10.7 Preview mode
Preview mode is essential.

### v1 requirements
- launch playable preview
- jump to timestamp
- inspect unlock conditions
- force-unlock artefacts
- restart from clean state

### Nice-to-have if easy
- show current triggered events list
- show read/opened state summary
- show unmet condition breakdown

---

## 10.8 Ending configuration
The creator must be able to define:

- ending trigger conditions
- ending screen title/text
- optional ending asset/image
- whether the story freezes, fades, or remains explorable after ending

v1 should support a clear custom ending screen.

---

## 11. Validation and error handling

The tool should validate story configuration and flag:

- missing asset references
- invalid thread/conversation references
- invalid folder/container references
- impossible condition references
- circular or contradictory dependencies where detectable
- ending trigger with no reachable path where detectable
- artefacts with no placement
- duplicate IDs

### Validation principle
The tool should prefer **clear warnings** over silent failure.

---

## 12. Data/output model

## 12.1 v1 delivery model
For v1, story data will likely be **embedded directly into the player app build**.

However, the authoring tool should still conceptually output a structured story definition rather than relying on hardcoded UI state.

### Practical implication
Internally, the authoring tool should generate a clean story object model that could later become:
- JSON manifest + assets
- packaged story bundle
- external import/export format

---

## 12.2 Output responsibilities
The output should include:
- story metadata
- desktop/app config
- artefact definitions
- conversation/thread structures
- release and gating rules
- asset references
- ending rules

---

## 13. UX requirements

### Authoring UX should feel:
- structured
- legible
- table/form oriented
- low-friction
- not overdesigned

### Preferred UI characteristics
- desktop-first layout
- left navigation or tab structure
- list/detail workflow
- clear validation state
- minimal but useful timeline visualisation

### Avoid in v1
- node graph editor
- elaborate animation-heavy interfaces
- overly abstract story modelling

---

## 14. Technical constraints

### Platform
- browser-based
- desktop-first

### Storage
- local browser storage acceptable for v1 authoring state
- export/import optional later

### Likely stack direction
- front-end web app
- structured local state management
- asset references managed within project scope

### Not required in v1
- backend
- auth system
- multi-user persistence
- server-side rendering

---

## 15. Success criteria

The tool succeeds in v1 if a solo creator can:

1. build a complete 50–150 artefact story
2. define mixed timed and gated progression
3. preview and debug story flow without manual code edits
4. create a final playable story consumed by the player app
5. understand why locked or gated content is not appearing

---

## 16. MVP acceptance criteria

A v1 MVP should be considered complete when it can do all of the following:

- create a story
- create and manage artefacts across all supported v1 content types
- support email threads and IM conversations
- assign artefacts to desktop/app locations
- upload and associate assets
- define elapsed-time release rules
- define supported gating conditions using AND/OR combinations
- lock items with preset passwords
- preview the story
- jump preview to timestamp
- inspect unlock conditions
- force-unlock content for testing
- restart from clean state
- define and trigger a custom ending screen
- produce structured story data consumable by the player app

---

## 17. Future expansion opportunities

Not for v1, but worth acknowledging:

- external story bundle import/export
- theme packs
- search modelling
- in-story notes
- richer file types such as PDFs/spreadsheets/web pages
- notification scripting
- collaboration
- analytics
- branching variants
- more advanced logic/event scripting
- reusable story templates
- public release mode
