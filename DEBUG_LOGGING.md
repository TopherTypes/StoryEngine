# Story Validation Debug Logging

This document explains the comprehensive debug logging that has been added to help diagnose story validation failures.

## Overview

Debug console messages have been added at key points during story loading and validation to help understand why a story validation check might fail. Open your browser's Developer Tools (F12) and look at the Console tab to see detailed diagnostic output.

## Console Prefixes

All console messages use clear prefixes to identify their source:

- **`[StoryEngine]`** - Main player application events (loading, initialization, etc.)
- **`[Validation]`** - Story validation checks and results
- **`[Bundle]`** - Bundle format parsing and integrity verification
- **`[Selector]`** - Story selection UI (file upload, URL loading, etc.)

## Detailed Logging Points

### 1. Story Loading (`player/js/app.js`)

When a story is loaded from any source (bundle, URL, or localStorage), the `logLoadedStoryStructure()` method outputs:

```
[StoryEngine] Loaded Story Structure (from source)
├─ ID: [id value]
├─ Title: [title value]
├─ Author: [author or "(not set)"]
├─ Description: [description or "(not set)"]
├─ Version: [version or "(not set)"]
├─ Login configured: [true/false] { hasUsername: [bool], hasPassword: [bool] }
├─ Theme: [theme object or "(not set)"]
├─ Artefacts: [count] items
│  └─ First artefact: { id, type, title }
├─ Email Senders: [count] items
├─ IM Participants: [count] items
├─ Ending: { title }
├─ File Structure: [count] items
└─ Calendar Events: [count] items
```

### 2. Story Validation (`validateStory()`)

Each required field is validated with detailed logging showing:

- **Field name** being checked
- **Actual value** found in the story
- **Pass/fail status** (✓ or ❌)

Example output for a validation failure:
```
[Validation] Starting story validation...
[Validation] Story object keys: [keys...]
[Validation] ✓ story.id: abc-123-def
[Validation] ✓ story.title: My Story Title
[Validation] ✓ story.login: { username: (set), password: (set) }
[Validation] ✓ story.artefacts is array with 5 items
[Validation] ✓ story.emailSenders is array with 3 items
[Validation] ✓ story.imParticipants is array with 2 items
[Validation] Validating artefacts...
[Validation] ✓ All 5 artefacts have id and type
[Validation] ✓ story.ending.title: The End
[Validation] ✅ All validation checks passed!
```

If a check fails, you'll see:
```
[Validation] ❌ FAILED: story.artefacts is not an array. Got: undefined Type: undefined
```

### 3. Bundle Parsing (`js/bundle.js`)

When parsing a `.story` bundle file, detailed validation steps are logged:

```
[Bundle] Starting bundle parsing...
[Bundle] Bundle size: X.XX KB
[Bundle] Checking magic number...
[Bundle] ✓ Magic number valid (STORY)
[Bundle] Checking version: expected 1 got 1
[Bundle] ✓ Version check passed
[Bundle] Compression flag: NONE (0)
[Bundle] ✓ Compression check passed
[Bundle] Header size: 16 bytes, starting content parsing at offset 16
[Bundle] Searching for MANIFEST_END marker...
[Bundle] ✓ Found manifest at offset X to Y
[Bundle] Manifest parsed: {
  bundleVersion: 1,
  storyId: "abc-123",
  storyTitle: "Story Title",
  assetCount: 5
}
[Bundle] Verifying bundle integrity (CRC32)...
[Bundle] CRC32 check: expected 0x12345678, calculated 0x12345678
[Bundle] ✓ CRC32 verification passed
[Bundle] Searching for STORY_END marker...
[Bundle] ✓ Found story data from offset X to Y
[Bundle] Story parsed: {
  id: "abc-123",
  title: "Story Title",
  author: "Author Name",
  artefactCount: 5,
  emailSenderCount: 3,
  imParticipantCount: 2
}
[Bundle] Reading assets, current offset: X buffer end: Y
[Bundle] Loaded asset: asset-1 (image/png, X.XX KB)
[Bundle] Loaded asset: asset-2 (audio/mp3, X.XX KB)
[Bundle] ✓ Loaded 2 assets
[Bundle] Verifying asset hashes (2 to verify)...
[Bundle] ✓ Asset asset-1 hash verified
[Bundle] ✓ Asset asset-2 hash verified
[Bundle] ✓ All asset hashes verified
[Bundle] ✅ Bundle parsing complete
```

### 4. Story Selection (`player/js/selector.js`)

#### File Upload:
```
[Selector] Processing file: my-story.story
[Selector] File size: X.XX KB
[Selector] File type: application/octet-stream
[Selector] Detected .story bundle format
[Bundle] Starting bundle parsing...
[Bundle] ...
[Selector] ✓ Bundle parsed, story ID: abc-123 title: My Story
[Selector] ✓ Story validation passed, adding to recent stories
```

#### URL Loading:
```
[Selector] Loading from URL: https://example.com/story.json
[Selector] Response status: 200 OK
[Selector] Response content-type: application/json
[Selector] Response content-length: 12345 bytes
[Selector] Parsing response as JSON
[Selector] ✓ JSON parsed from URL, story ID: abc-123 title: My Story
[Selector] ✓ Story validation passed, adding to recent stories
```

## Using These Logs to Debug Validation Failures

### Step-by-Step Debugging

1. **Open Developer Tools**: Press F12 in your browser
2. **Go to Console tab**: Look for the Console tab in DevTools
3. **Load your story**: Use any loading method (file upload, URL, etc.)
4. **Look for error messages**: Search for `❌` or `[Validation]` in the console

### Common Issues and What to Look For

#### Issue: "Story validation failed"

1. Look for `[Validation] ❌ FAILED:` messages in the console
2. Note which field is missing or has wrong type
3. Common missing fields:
   - `story.id` - Must be a non-empty string
   - `story.title` - Must be a non-empty string
   - `story.login.username` and `story.login.password` - Login credentials
   - `story.artefacts` - Must be an array (even if empty)
   - `story.emailSenders` - Must be an array (even if empty)
   - `story.imParticipants` - Must be an array (even if empty)
   - `story.ending.title` - Must have an ending with a title

#### Issue: Bundle parsing fails

1. Look for `[Bundle] ❌` error messages
2. Check what specific validation failed:
   - **Magic number**: File is not a valid .story bundle
   - **Version**: Bundle format is too old or too new
   - **Manifest/Story markers**: Bundle file is corrupted
   - **CRC32 mismatch**: Bundle data may be corrupted
   - **Hash mismatch**: Asset files within bundle are corrupted

#### Issue: File doesn't load

1. Check `[Selector]` messages for file processing
2. Look for HTTP errors in URL loading (e.g., 404, 500)
3. Verify file format (`.story` bundle vs `.json` file)

## Console Log Organization

Bundle parsing uses `console.group()` to organize related messages, making them collapsible in DevTools for easier reading.

## Example: Complete Load and Validation Flow

Here's what a successful story load looks like in the console:

```
[StoryEngine] App initialization starting
[StoryEngine] Initializing player state...
[StoryEngine] Player state initialized successfully
[StoryEngine] Loading story...
[StoryEngine] Loading story from localStorage
[StoryEngine] Loaded Story Structure (from localStorage)
  [... structure details ...]
[StoryEngine] Story loaded: abc-123-def
[StoryEngine] Validating story data...
[Validation] Starting story validation...
[Validation] Story object keys: [...]
[Validation] ✓ story.id: abc-123-def
[Validation] ✓ story.title: My Story
[Validation] ✓ story.login: { username: (set), password: (set) }
[Validation] ✓ story.artefacts is array with 5 items
[Validation] ✓ story.emailSenders is array with 3 items
[Validation] ✓ story.imParticipants is array with 2 items
[Validation] Validating artefacts...
[Validation] ✓ All 5 artefacts have id and type
[Validation] ✓ story.ending.title: The End
[Validation] ✅ All validation checks passed!
[StoryEngine] Story validation passed
[StoryEngine] Checking for saved game state...
[StoryEngine] Saved state retrieved: not found
[StoryEngine] Showing login screen for new game
[StoryEngine] App initialization complete
```

## Disabling or Customizing Logging

These console messages can be easily controlled:

1. **Open DevTools Filter**: Click the Filter icon in the Console tab
2. **Filter by prefix**: Type `[Validation]` to see only validation logs, `[Bundle]` for bundle logs, etc.
3. **Mute sources**: Right-click on a message and select "Hide messages from..." to suppress that source

## Notes for Developers

- All logging uses standard `console.log()`, `console.error()`, and `console.group()` methods
- No external logging library is required
- Messages include actual values to help identify data issues
- Error messages are prefixed with ❌ for quick visual identification
- Success/pass messages are prefixed with ✓ or ✅

