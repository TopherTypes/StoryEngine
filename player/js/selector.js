/**
 * Story Selector - Manages story selection and recent files
 */

class StorySelector {
  constructor() {
    this.recentStories = [];
    this.onStorySelected = null;
    this.onStoryLoaded = null;
  }

  async init() {
    this.loadRecentStories();
    this.setupTabHandlers();
    this.setupFileHandlers();
    this.setupUrlHandler();
    this.setupDemoButton();
    this.setupClearHistoryButton();
  }

  setupClearHistoryButton() {
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearHistory();
      });
    }
  }

  show() {
    const selectorScreen = document.getElementById('selectorScreen');
    if (selectorScreen) {
      selectorScreen.style.display = 'flex';
      this.renderRecentStories();
    }
  }

  hide() {
    const selectorScreen = document.getElementById('selectorScreen');
    if (selectorScreen) {
      selectorScreen.style.display = 'none';
    }
  }

  loadRecentStories() {
    try {
      const stored = localStorage.getItem('storyEngineRecentStories');
      this.recentStories = stored ? JSON.parse(stored) : [];
      // Sort by most recently accessed
      this.recentStories.sort((a, b) => b.lastAccessed - a.lastAccessed);
    } catch (e) {
      console.error('[Selector] Failed to load recent stories:', e);
      this.recentStories = [];
    }
  }

  saveRecentStories() {
    try {
      // Keep only 10 most recent
      const toSave = this.recentStories.slice(0, 10);
      localStorage.setItem('storyEngineRecentStories', JSON.stringify(toSave));
    } catch (e) {
      console.error('[Selector] Failed to save recent stories:', e);
    }
  }

  addRecentStory(story, filename) {
    // Check if already in list
    const existingIndex = this.recentStories.findIndex(s => s.storyId === story.id);
    if (existingIndex >= 0) {
      this.recentStories.splice(existingIndex, 1);
    }

    this.recentStories.unshift({
      storyId: story.id,
      title: story.title || filename || 'Untitled Story',
      author: story.author || 'Unknown Author',
      version: story.version || '1.0',
      lastAccessed: Date.now(),
      filename: filename,
      description: story.description || ''
    });

    this.saveRecentStories();
  }

  renderRecentStories() {
    const recentList = document.getElementById('recentStoriesList');
    if (!recentList) return;

    if (this.recentStories.length === 0) {
      recentList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No recent stories. Upload one to get started!</p>';
      return;
    }

    recentList.innerHTML = '';
    for (const story of this.recentStories) {
      const card = this.createStoryCard(story);
      recentList.appendChild(card);
    }
  }

  createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';

    const date = new Date(story.lastAccessed);
    const dateStr = date.toLocaleDateString();

    card.innerHTML = `
      <div class="story-card-content">
        <h3>${this.escapeHtml(story.title)}</h3>
        <p class="story-author">${this.escapeHtml(story.author)}</p>
        <p class="story-meta">v${story.version} • ${dateStr}</p>
        ${story.description ? `<p class="story-desc">${this.escapeHtml(story.description.substring(0, 100))}</p>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      this.loadRecentStory(story);
    });

    return card;
  }

  loadRecentStory(story) {
    if (this.onStorySelected) {
      // Mark as accessed
      story.lastAccessed = Date.now();
      this.saveRecentStories();
      // Callback with story ID to load
      this.onStorySelected(story.storyId, story.filename);
    }
  }

  setupTabHandlers() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        tabButtons.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');

        // Hide all tabs
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tc => tc.classList.remove('active'));

        // Show selected tab
        const tabName = btn.dataset.tab;
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
          tabContent.classList.add('active');
        }
      });
    });
  }

  setupFileHandlers() {
    const fileInput = document.getElementById('selectorFileInput');
    const dropZone = document.getElementById('selectorDropZone');
    const error = document.getElementById('selectorError');

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          await this.handleFileSelected(file, error);
        }
      });
    }

    // File upload button
    const uploadBtn = document.getElementById('selectorUploadBtn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    // Drag and drop
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          if (file.name.endsWith('.story') || file.name.endsWith('.json')) {
            await this.handleFileSelected(file, error);
          } else {
            this.showError('Invalid file format. Use .story or .json files.', error);
          }
        }
      });
    }
  }

  async handleFileSelected(file, errorElement) {
    try {
      if (errorElement) {
        errorElement.style.display = 'none';
      }

      console.log('[Selector] Processing file:', file.name);
      console.log('[Selector] File size:', (file.size / 1024).toFixed(2), 'KB');
      console.log('[Selector] File type:', file.type);

      // Read and parse file
      const arrayBuffer = await file.arrayBuffer();
      let story = null;

      if (file.name.endsWith('.story')) {
        console.log('[Selector] Detected .story bundle format');
        // Parse as bundle
        const result = await StoryBundle.parseBundle(file);
        story = result.story;
        console.log('[Selector] ✓ Bundle parsed, story ID:', story?.id, 'title:', story?.title);
        if (this.onStoryLoaded) {
          this.onStoryLoaded(result);
        }
      } else {
        console.log('[Selector] Parsing as JSON file');
        // Parse as JSON
        const text = new TextDecoder().decode(arrayBuffer);
        story = JSON.parse(text);
        console.log('[Selector] ✓ JSON parsed, story ID:', story?.id, 'title:', story?.title);
      }

      if (story && story.id && story.title) {
        console.log('[Selector] ✓ Story validation passed, adding to recent stories');
        this.addRecentStory(story, file.name);
        if (this.onStorySelected) {
          this.onStorySelected(story, file);
        }
      } else {
        console.error('[Selector] ❌ Story validation failed. Story object:', story, 'has id:', story?.id, 'has title:', story?.title);
        this.showError('Invalid story file format.', errorElement);
      }
    } catch (e) {
      console.error('[Selector] File processing failed:', e);
      this.showError(`Failed to load file: ${e.message}`, errorElement);
    }
  }

  setupUrlHandler() {
    const urlInput = document.getElementById('selectorUrlInput');
    const loadUrlBtn = document.getElementById('selectorLoadUrlBtn');
    const error = document.getElementById('selectorError');

    if (loadUrlBtn) {
      loadUrlBtn.addEventListener('click', async () => {
        const url = urlInput?.value.trim();
        if (!url) {
          this.showError('Please enter a URL', error);
          return;
        }

        try {
          if (error) error.style.display = 'none';
          console.log('[Selector] Loading from URL:', url);

          const response = await fetch(url);
          console.log('[Selector] Response status:', response.status, response.statusText);
          console.log('[Selector] Response content-type:', response.headers.get('content-type'));
          console.log('[Selector] Response content-length:', response.headers.get('content-length'), 'bytes');

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          let story = null;
          if (url.endsWith('.story')) {
            console.log('[Selector] Detected .story bundle format from URL');
            const blob = await response.blob();
            console.log('[Selector] Blob created, size:', (blob.size / 1024).toFixed(2), 'KB');
            const result = await StoryBundle.parseBundle(blob);
            story = result.story;
            console.log('[Selector] ✓ Bundle parsed from URL, story ID:', story?.id, 'title:', story?.title);
            if (this.onStoryLoaded) {
              this.onStoryLoaded(result);
            }
          } else {
            console.log('[Selector] Parsing response as JSON');
            story = await response.json();
            console.log('[Selector] ✓ JSON parsed from URL, story ID:', story?.id, 'title:', story?.title);
          }

          if (story && story.id && story.title) {
            console.log('[Selector] ✓ Story validation passed, adding to recent stories');
            this.addRecentStory(story, url);
            if (this.onStorySelected) {
              this.onStorySelected(story, null);
            }
          } else {
            console.error('[Selector] ❌ Story validation failed. Story object:', story, 'has id:', story?.id, 'has title:', story?.title);
            this.showError('Invalid story data from URL', error);
          }
        } catch (e) {
          console.error('[Selector] URL load failed:', e);
          this.showError(`Failed to load from URL: ${e.message}`, error);
        }
      });

      // Allow Enter key to load
      if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            loadUrlBtn.click();
          }
        });
      }
    }
  }

  setupDemoButton() {
    const demoBtn = document.getElementById('selectorPlayDemoBtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (this.onStorySelected) {
          this.onStorySelected('test-story', null);
        }
      });
    }
  }

  showError(message, errorElement) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    console.error('[Selector]', message);
  }

  clearHistory() {
    if (confirm('Clear all recent stories?')) {
      this.recentStories = [];
      this.saveRecentStories();
      this.renderRecentStories();
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Initialize global instance
const storySelector = new StorySelector();
