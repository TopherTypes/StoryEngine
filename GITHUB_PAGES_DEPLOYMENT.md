# GitHub Pages Deployment Guide

This guide explains how to deploy StoryEngine (both authoring tool and player) to GitHub Pages.

## Overview

StoryEngine is a fully static, client-side application that works perfectly on GitHub Pages. There is no backend server required.

### What Works on GitHub Pages
✅ Authoring tool (story creation and editing)
✅ Player app (story playback)
✅ All data stored in browser (IndexedDB)
✅ No API calls or server dependencies
✅ Story export/import for sharing

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

This creates a `dist/` folder with optimized, minified production code.

### 2. Deploy to GitHub Pages

**Option A: Using GitHub's built-in Pages (recommended)**

1. Push code to your repository
2. Go to repository Settings → Pages
3. Set Build and deployment to:
   - Source: Deploy from a branch
   - Branch: main (or your default branch)
   - Folder: /docs or /(root)
4. Move `dist/` contents to `/docs` or root (depending on your setting)
5. Push changes

**Option B: Using GitHub Actions**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Using the Player on GitHub Pages

### Method 1: Same-Domain (Authoring + Playing)

If you deploy both the authoring tool and player together:

1. Open authoring tool
2. Create and save a story
3. Copy the story ID (visible in dashboard or browser DevTools)
4. Access player with: `?mode=player&storyId=<storyId>`
5. Story loads from browser IndexedDB (same domain)

**URL Example:**
```
https://yourusername.github.io/StoryEngine/?mode=player&storyId=story_12345
```

### Method 2: Story URL (GitHub Pages Distribution)

For sharing stories across different domains:

1. In authoring tool, export story as JSON:
   - Create story
   - (Feature to be added) Export as JSON
   - Save the JSON file

2. Host JSON file:
   - Put `story.json` in GitHub Pages root
   - Or upload to any publicly accessible URL

3. Access player with story URL:
   ```
   https://yourusername.github.io/StoryEngine/?mode=player&storyUrl=https://yourusername.github.io/stories/my-story.json
   ```

4. Story loads from the provided JSON URL
5. Assets must be embedded (as base64) or hosted at accessible URLs

### Method 3: Pre-embedded Demo Story

For a self-contained, shareable link:

1. Create story in authoring tool
2. Export as JSON with all assets embedded (base64)
3. Upload to GitHub Pages
4. Share the player URL with the story JSON

## Story Export Format

Stories are stored as JSON with this structure:

```json
{
  "id": "story_abc123",
  "title": "My ARG Story",
  "description": "...",
  "author": "Your Name",
  "theme": { ... },
  "login": { ... },
  "artefacts": [ ... ],
  "assets": [ { "id": "...", "data": "base64..." }, ... ],
  "fileStructure": [ ... ],
  ...
}
```

**Assets must be embedded as base64** for standalone stories (Method 2 & 3).

## Configuration for Different Hosting

### GitHub Pages Subdirectory

If deploying to `yourusername.github.io/project-name/`:

Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/project-name/',
  ...
})
```

## Browser Storage & Privacy

All data is stored locally in the browser:
- **IndexedDB**: Story data, player progress
- **LocalStorage**: UI preferences
- **No data sent to servers**

This means:
- Each visitor has their own independent games and progress
- Progress doesn't sync across devices
- Clearing browser data loses saved progress
- Perfect for privacy-first deployments

## Sharing Stories

### Share via GitHub Pages URL
```
https://yourusername.github.io/StoryEngine/?mode=player&storyUrl=https://yourusername.github.io/stories/story-name.json
```

### Share via JSON File
1. Export story from authoring tool
2. Host JSON file publicly
3. Share player URL with the storyUrl parameter
4. Recipient gets full game with all content

### Share via Story ID (Same Domain Only)
```
https://yourusername.github.io/StoryEngine/?mode=player&storyId=story_12345
```
- Only works if recipient uses same domain (same IndexedDB)
- Good for internal teams

## Features Available on GitHub Pages

### ✅ Fully Supported
- Story creation and editing
- Story playback
- Time-based and interaction-based unlocking
- Password-protected content
- Session persistence (page reload recovery)
- Auto-save to browser storage
- Story export/import
- Error recovery
- Multiple concurrent games

### ⚠️ Limitations
- No cloud sync (data stored locally per browser)
- No collaborative editing (one author per browser)
- No analytics/backend tracking
- Assets must be embedded or hosted externally

## Troubleshooting

### Story won't load
1. Check story ID or URL is correct
2. Verify story exists in IndexedDB (authoring tool on same domain)
3. Check browser console for errors
4. Try returning to dashboard first

### Assets (images/audio) not loading
1. For Method 2: Ensure assets are embedded as base64
2. For external URLs: Verify CORS headers allow access
3. Check file paths and URLs

### Progress lost after reload
1. Browser storage is cleared (check incognito/private mode)
2. IndexedDB disabled in browser
3. Browser doesn't support IndexedDB

## Building for Distribution

To create a portable story for distribution:

1. Create story in authoring tool
2. Export as JSON (with base64-encoded assets)
3. Host the JSON file on GitHub Pages
4. Share the player URL with `?mode=player&storyUrl=<json-url>`

Recipients can then play without creating an account or installing anything.

## Summary

StoryEngine works great on GitHub Pages because:
- ✅ No backend required
- ✅ All data stored in browser (IndexedDB)
- ✅ No API calls
- ✅ Works offline (after initial load)
- ✅ Easy to deploy via `npm run build`
- ✅ Multiple ways to share stories

Just build, deploy to GitHub Pages, and share the URL!
