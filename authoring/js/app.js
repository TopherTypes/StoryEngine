/**
 * StoryEngine Authoring Tool - Main Application
 * Core app logic and event handling
 */

const app = {
  story: null,
  selectedArtefactId: null,
  assetFiles: new Map(), // Store File objects for bundle export: assetId -> File

  // Initialize the application
  init() {
    console.log('Initializing StoryEngine Authoring Tool...');

    // Load story from localStorage
    this.story = State.loadStory();
    console.log('Loaded story:', this.story.title);

    // Initialize UI
    UI.init();

    // Initial render
    this.render();

    // Set up auto-save
    this.setupAutoSave();

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log('Initialization complete');
  },

  // Render the entire application
  render() {
    if (!this.story) return;

    Renderer.updateHeader(this.story);
    Renderer.updateDashboard(this.story);
    Renderer.renderArtefactList(this.story);
    Renderer.renderTimeline(this.story);
    Renderer.renderWorldBuilder(this.story);
  },

  // Save story to localStorage
  saveStory() {
    if (!this.story) return;
    State.saveStory(this.story);
  },

  // Update a story field and save
  updateStoryField(field, value) {
    if (!this.story) return;

    this.story[field] = value;
    this.story.lastModified = new Date().toISOString();
    this.saveStory();

    // Update dependent UI elements if needed
    if (field === 'loginRequired') {
      Renderer.toggleLoginFields();
    }
    if (field === 'title') {
      Renderer.updateHeader(this.story);
    }
    if (field === 'theme') {
      // Theme will be applied on next load or page refresh
    }
  },

  // Auto-save periodically
  setupAutoSave() {
    setInterval(() => {
      if (this.story) {
        State.saveStory(this.story);
        console.log('Auto-saved story');
      }
    }, 30000); // Every 30 seconds
  },

  // Set up keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S: Save & Validate
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveStory();
        this.showToast('✓ Story saved');
      }

      // Ctrl/Cmd + N: Create new artefact
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.createArtefact();
        this.showToast('New artefact created');
      }

      // Ctrl/Cmd + P: Open preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        this.previewStory();
      }

      // Ctrl/Cmd + ?: Show keyboard shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        this.showKeyboardShortcuts();
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        const conditionModal = document.getElementById('condition-modal');
        if (conditionModal && conditionModal.classList.contains('active')) {
          this.closeConditionModal();
        }
      }
    });
  },

  // Show keyboard shortcuts help dialog
  showKeyboardShortcuts() {
    const shortcuts = [
      { key: 'Ctrl+S / Cmd+S', action: 'Save story' },
      { key: 'Ctrl+N / Cmd+N', action: 'Create new artefact' },
      { key: 'Ctrl+P / Cmd+P', action: 'Preview story' },
      { key: 'Ctrl+Shift+? / Cmd+Shift+?', action: 'Show this help' },
      { key: 'Escape', action: 'Close modal' }
    ];

    const shortcutList = shortcuts
      .map(s => `<tr><td style="padding: 8px; border-bottom: 1px solid var(--border-color); font-family: monospace; color: var(--terminal-green);">${s.key}</td><td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${s.action}</td></tr>`)
      .join('');

    const html = `
      <div style="margin-bottom: 16px;">
        <p style="color: var(--text-secondary); margin-top: 0;">Use these keyboard shortcuts to speed up your workflow:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${shortcutList}</tbody>
        </table>
      </div>
    `;

    UI.alert(html, 'Keyboard Shortcuts');
  },

  // Show toast notification
  showToast(message) {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 12px 16px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  // Navigation
  goToSection(sectionName) {
    // Update dashboard when going to dashboard
    if (sectionName === 'dashboard') {
      Renderer.updateDashboard(this.story);
    }

    // Update world builder when going there
    if (sectionName === 'world-builder') {
      Renderer.renderWorldBuilder(this.story);
    }

    // Update timeline when going there
    if (sectionName === 'timeline') {
      Renderer.renderTimeline(this.story);
    }

    UI.goToSection(sectionName);
  },

  // Artefacts
  createNewArtefact() {
    const typeFilter = document.getElementById('type-filter');
    const selectedType = typeFilter ? typeFilter.value : 'email';
    const type = selectedType || 'email';

    const newArtefact = State.createArtefact(type);
    this.story.artefacts.push(newArtefact);
    this.selectedArtefactId = newArtefact.id;

    this.saveStory();
    this.render();

    // Auto-select the new artefact
    setTimeout(() => {
      this.selectArtefact(newArtefact.id);
    }, 100);
  },

  // Select an artefact to edit
  selectArtefact(artefactId) {
    this.selectedArtefactId = artefactId;

    // Update UI
    document.querySelectorAll('.artefact-item').forEach(item => {
      item.classList.remove('selected');
      if (item.dataset.artefactId === artefactId) {
        item.classList.add('selected');
      }
    });

    // Render editor
    Renderer.renderArtefactEditor(this.story, artefactId);
  },

  // Update current artefact
  updateCurrentArtefact(field, value) {
    if (!this.selectedArtefactId) return;

    const artefact = this.story.artefacts.find(a => a.id === this.selectedArtefactId);
    if (artefact) {
      artefact[field] = value;
      artefact.modified = new Date().toISOString();
      this.saveStory();

      // Update header if title changed
      if (field === 'title') {
        Renderer.updateHeader(this.story);
      }

      // Re-render timeline if release time changed
      if (field === 'releaseAtTime') {
        Renderer.renderTimeline(this.story);
      }

      // Update list
      Renderer.renderArtefactList(this.story, document.getElementById('type-filter')?.value);
    }
  },

  // Delete artefact
  deleteArtefact(artefactId) {
    if (!UI.confirm('Are you sure you want to delete this artefact?')) {
      return;
    }

    State.deleteArtefact(this.story, artefactId);
    if (this.selectedArtefactId === artefactId) {
      this.selectedArtefactId = null;
    }

    this.saveStory();
    this.render();
  },

  // Filter artefacts
  filterArtefacts() {
    const searchText = document.getElementById('artefact-search')?.value.toLowerCase() || '';
    const filterType = document.getElementById('type-filter')?.value || '';
    const filterStatus = document.getElementById('status-filter')?.value || '';

    // Filter artefacts based on all criteria
    const filtered = this.story.artefacts.filter(artefact => {
      // Type filter
      if (filterType && artefact.type !== filterType) return false;

      // Status filter
      if (filterStatus === 'locked' && !artefact.locked && (!artefact.releaseTriggers || artefact.releaseTriggers.length === 0)) return false;
      if (filterStatus === 'unlocked' && (artefact.locked || (artefact.releaseTriggers && artefact.releaseTriggers.length > 0))) return false;

      // Search filter - search in title and tags
      if (searchText) {
        const title = artefact.title.toLowerCase();
        const tags = (artefact.tags || []).join(' ').toLowerCase();
        if (!title.includes(searchText) && !tags.includes(searchText)) return false;
      }

      return true;
    });

    // Render filtered list
    Renderer.renderArtefactListFiltered(this.story, filtered);
  },

  clearArtefactFilters() {
    document.getElementById('artefact-search').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('status-filter').value = '';
    this.filterArtefacts();
  },

  // Condition builder
  openConditionBuilder() {
    if (!this.selectedArtefactId) return;
    UI.openConditionBuilder();
    // Populate condition field dropdowns after modal opens
    setTimeout(() => {
      const typeSelect = document.getElementById('condition-type');
      if (typeSelect) {
        const type = typeSelect.value;
        if (type === 'opened' || type === 'read') {
          UI.populateArtefactDropdown();
        } else if (type === 'app') {
          UI.populateFolderDropdown();
        }
      }
    }, 50);
  },

  closeConditionModal() {
    return UI.closeConditionModal();
  },

  updateConditionFields() {
    UI.updateConditionFields();
  },

  saveCondition() {
    if (!this.selectedArtefactId) return;

    const type = document.getElementById('condition-type')?.value;
    const andLogic = document.getElementById('condition-and')?.checked;

    // Build trigger object based on condition type
    let trigger = null;

    switch (type) {
      case 'time':
        trigger = {
          type: 'time',
          minutes: parseInt(document.getElementById('condition-time-value')?.value || 0)
        };
        break;
      case 'opened':
        trigger = {
          type: 'artefact_opened',
          artefactId: document.getElementById('condition-artefact-id')?.value
        };
        break;
      case 'read':
        trigger = {
          type: 'artefact_read',
          artefactId: document.getElementById('condition-artefact-id')?.value
        };
        break;
      case 'password':
        trigger = {
          type: 'password',
          value: document.getElementById('condition-password-key')?.value
        };
        break;
      case 'app':
        trigger = {
          type: 'app_opened',
          appName: document.getElementById('condition-app-id')?.value
        };
        break;
    }

    if (!trigger) return;

    // Update artefact with proper condition logic
    const artefact = this.story.artefacts.find(a => a.id === this.selectedArtefactId);
    if (artefact) {
      // If AND logic is selected and there are existing triggers, wrap in condition_group
      if (andLogic && artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
        artefact.releaseTriggers = [{
          type: 'condition_group',
          operator: 'AND',
          rules: [...artefact.releaseTriggers, trigger]
        }];
      } else {
        // Otherwise just set the single trigger
        artefact.releaseTriggers = [trigger];
      }

      artefact.modified = new Date().toISOString();
      this.saveStory();

      // Close modal and re-render
      this.closeConditionModal();
      Renderer.renderArtefactEditor(this.story, this.selectedArtefactId);
      Renderer.renderArtefactList(this.story, document.getElementById('type-filter')?.value);
      Renderer.renderTimeline(this.story);
    }
  },

  // World Builder
  addEntity(type) {
    let entity = null;

    switch (type) {
      case 'sender':
        const email = document.getElementById('new-sender-email')?.value.trim();
        const name = document.getElementById('new-sender-name')?.value.trim();
        if (!email || !name) {
          UI.alert('Please fill in both email and name');
          return;
        }
        entity = {
          id: State.generateId(),
          type: 'sender',
          email: email,
          name: name
        };
        this.story.emailSenders.push(entity);
        document.getElementById('new-sender-email').value = '';
        document.getElementById('new-sender-name').value = '';
        break;

      case 'participant':
        const username = document.getElementById('new-participant-name')?.value.trim();
        const display = document.getElementById('new-participant-display')?.value.trim();
        const avatarInput = document.getElementById('new-participant-avatar');

        if (!username || !display) {
          UI.alert('Please fill in both username and display name');
          return;
        }

        // Handle avatar file if provided
        if (avatarInput?.files?.length > 0) {
          const file = avatarInput.files[0];
          const reader = new FileReader();

          reader.onload = (e) => {
            entity = {
              id: State.generateId(),
              type: 'participant',
              username: username,
              displayName: display,
              profilePicture: e.target.result  // Base64 data URI
            };
            this.story.imParticipants.push(entity);
            document.getElementById('new-participant-name').value = '';
            document.getElementById('new-participant-display').value = '';
            document.getElementById('new-participant-avatar').value = '';
            document.getElementById('avatar-preview').innerHTML = '';
            Renderer.renderWorldBuilder(this.story);
          };

          reader.readAsDataURL(file);
          return;
        }

        // No avatar file
        entity = {
          id: State.generateId(),
          type: 'participant',
          username: username,
          displayName: display
        };
        this.story.imParticipants.push(entity);
        document.getElementById('new-participant-name').value = '';
        document.getElementById('new-participant-display').value = '';
        break;

      case 'folder':
        const folderName = document.getElementById('new-folder-name')?.value.trim();
        if (!folderName) {
          UI.alert('Please enter a folder name');
          return;
        }
        entity = {
          id: State.generateId(),
          type: 'folder',
          name: folderName
        };
        this.story.folders.push(entity);
        document.getElementById('new-folder-name').value = '';
        break;

      case 'thread':
        const threadName = document.getElementById('new-thread-name')?.value.trim();
        if (!threadName) {
          UI.alert('Please enter a thread name');
          return;
        }
        entity = {
          id: State.generateId(),
          type: 'thread',
          name: threadName
        };
        this.story.emailThreads.push(entity);
        document.getElementById('new-thread-name').value = '';
        break;

      case 'conversation':
        const conversationName = document.getElementById('new-conversation-name')?.value.trim();
        if (!conversationName) {
          UI.alert('Please enter a conversation name');
          return;
        }
        entity = {
          id: State.generateId(),
          type: 'conversation',
          name: conversationName
        };
        this.story.imConversations.push(entity);
        document.getElementById('new-conversation-name').value = '';
        break;
    }

    this.saveStory();
    Renderer.renderWorldBuilder(this.story);
  },

  deleteEntity(type, entityId) {
    if (!UI.confirm('Delete this item?')) {
      return;
    }

    switch (type) {
      case 'sender':
        this.story.emailSenders = this.story.emailSenders.filter(s => s.id !== entityId);
        break;
      case 'participant':
        this.story.imParticipants = this.story.imParticipants.filter(p => p.id !== entityId);
        break;
      case 'folder':
        this.story.folders = this.story.folders.filter(f => f.id !== entityId);
        break;
      case 'thread':
        this.story.emailThreads = this.story.emailThreads.filter(t => t.id !== entityId);
        // Clear threadId from all emails that referenced this thread
        this.story.artefacts.forEach(a => {
          if (a.type === 'email' && a.threadId === entityId) {
            a.threadId = '';
          }
        });
        break;
      case 'conversation':
        this.story.imConversations = this.story.imConversations.filter(c => c.id !== entityId);
        // Clear conversationId from all messages that referenced this conversation
        this.story.artefacts.forEach(a => {
          if (a.type === 'message' && a.conversationId === entityId) {
            a.conversationId = '';
          }
        });
        break;
    }

    this.saveStory();
    Renderer.renderWorldBuilder(this.story);
  },

  // Validation
  validateStory() {
    // Update story metadata from forms
    this.story.title = document.getElementById('story-name')?.value || this.story.title;
    this.story.author = document.getElementById('story-author')?.value || this.story.author;
    this.story.description = document.getElementById('story-description')?.value || this.story.description;

    const issues = State.validateStory(this.story);
    UI.showValidation(issues);
  },

  // Normalize login properties from flat to nested structure for export
  normalizeLoginPropertiesForExport(story) {
    // Create a copy to avoid mutating the working story
    const storyForExport = JSON.parse(JSON.stringify(story));

    // Transform flat login properties into nested structure
    if (storyForExport.loginUsername !== undefined || storyForExport.loginPassword !== undefined || storyForExport.loginRequired !== undefined) {
      storyForExport.login = {
        enabled: storyForExport.loginRequired || false,
        username: storyForExport.loginUsername || '',
        password: storyForExport.loginPassword || '',
        message: storyForExport.loginMessage || ''
      };
    } else {
      // Default login object if no login properties exist
      storyForExport.login = {
        enabled: false,
        username: '',
        password: '',
        message: ''
      };
    }

    // Remove flat login properties to avoid duplication
    delete storyForExport.loginRequired;
    delete storyForExport.loginUsername;
    delete storyForExport.loginPassword;
    delete storyForExport.loginMessage;

    return storyForExport;
  },

  // Export as JSON
  exportStory() {
    const storyForExport = this.normalizeLoginPropertiesForExport(this.story);
    const json = State.exportStory(storyForExport);
    const filename = `${this.story.title.replace(/\s+/g, '-').toLowerCase()}_${Date.now()}.json`;
    UI.downloadFile(json, filename);
  },

  // Export as bundle (includes assets)
  async exportBundle() {
    try {
      UI.showSpinner('Creating bundle...');

      // Normalize login properties for export
      const storyForExport = this.normalizeLoginPropertiesForExport(this.story);

      // Collect assets from artefacts
      const assets = [];
      const assetMap = new Map();

      for (const artefact of storyForExport.artefacts) {
        if (artefact.assetPath && this.assetFiles.has(artefact.assetPath)) {
          const file = this.assetFiles.get(artefact.assetPath);
          const assetId = artefact.assetPath.split('/').pop();

          if (!assetMap.has(assetId)) {
            assets.push({
              assetId,
              file
            });
            assetMap.set(assetId, true);
          }
        }
      }

      // Collect wallpaper asset if present
      if (storyForExport.wallpaper && this.assetFiles.has(storyForExport.wallpaper)) {
        const file = this.assetFiles.get(storyForExport.wallpaper);
        const assetId = storyForExport.wallpaper.split('/').pop();

        if (!assetMap.has(assetId)) {
          assets.push({
            assetId,
            file
          });
          assetMap.set(assetId, true);
        }
      }

      // Create bundle
      const bundleBlob = await StoryBundle.createBundle(storyForExport, assets);
      const filename = `${this.story.title.replace(/\s+/g, '-').toLowerCase()}_${Date.now()}.story`;

      // Download
      const url = URL.createObjectURL(bundleBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      UI.hideSpinner();
      UI.alert(`Bundle exported successfully: ${filename}`);
    } catch (error) {
      console.error('Failed to export bundle:', error);
      UI.hideSpinner();
      UI.alert(`Failed to export bundle: ${error.message}`);
    }
  },

  // Preview
  openPreview() {
    const playerUrl = '../player/index.html?story=' + encodeURIComponent(JSON.stringify(this.story));
    window.open(playerUrl, 'preview');
  },

  // Asset upload handlers
  handleImageUpload(artefactId) {
    const fileInput = document.getElementById('artefact-image-file');
    if (!fileInput || !fileInput.files.length) {
      UI.alert('Please select an image file first');
      return;
    }

    const file = fileInput.files[0];
    const filename = file.name;
    const path = `assets/images/${filename}`;

    // Store file for bundle export
    this.assetFiles.set(path, file);

    this.updateCurrentArtefact('assetPath', path);

    // Update path input for user verification
    const pathInput = document.getElementById('artefact-asset');
    if (pathInput) pathInput.value = path;

    // Show file size for feedback
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`Image asset uploaded: ${filename} (${sizeKB} KB)`);

    // Clear file input
    fileInput.value = '';
  },

  handleAudioUpload(artefactId) {
    const fileInput = document.getElementById('artefact-audio-file');
    if (!fileInput || !fileInput.files.length) {
      UI.alert('Please select an audio file first');
      return;
    }

    const file = fileInput.files[0];
    const filename = file.name;
    const path = `assets/audio/${filename}`;

    // Store file for bundle export
    this.assetFiles.set(path, file);

    this.updateCurrentArtefact('assetPath', path);

    // Update path input for user verification
    const pathInput = document.getElementById('artefact-audio-asset');
    if (pathInput) pathInput.value = path;

    // Show file size for feedback
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`Audio asset uploaded: ${filename} (${sizeKB} KB)`);

    // Clear file input
    fileInput.value = '';
  },

  // Wallpaper upload handler
  handleWallpaperUpload(file) {
    if (!file) {
      const fileInput = document.getElementById('settings-wallpaper');
      if (!fileInput?.files?.length) {
        return;
      }
      file = fileInput.files[0];
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const wallpaperId = State.generateId().substring(0, 8);
    const path = `assets/wallpaper/wallpaper-${wallpaperId}.${ext}`;

    // Store file for bundle export
    this.assetFiles.set(path, file);

    // Update story
    this.story.wallpaper = path;
    this.saveStory();

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('wallpaper-preview');
      if (preview) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Wallpaper preview" style="width: 100%; height: 100%; object-fit: cover;">`;
      }

      // Enable clear button
      const clearBtn = document.getElementById('wallpaper-clear-btn');
      if (clearBtn) clearBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);

    // Clear file input
    const fileInput = document.getElementById('settings-wallpaper');
    if (fileInput) fileInput.value = '';

    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`Wallpaper uploaded: ${file.name} (${sizeKB} KB)`);
  },

  // Clear wallpaper
  clearWallpaper() {
    // Clear from story
    this.story.wallpaper = '';

    // Remove from asset files if present
    for (const [path, file] of this.assetFiles) {
      if (path.startsWith('assets/wallpaper/')) {
        this.assetFiles.delete(path);
        break;
      }
    }

    // Save story
    this.saveStory();

    // Update preview
    const preview = document.getElementById('wallpaper-preview');
    if (preview) {
      preview.innerHTML = '<p class="preview-placeholder">No wallpaper selected</p>';
    }

    // Disable clear button
    const clearBtn = document.getElementById('wallpaper-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    console.log('Wallpaper cleared');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();

  // Set up avatar preview for participant image selection
  const avatarInput = document.getElementById('new-participant-avatar');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const preview = document.getElementById('avatar-preview');
      if (file && preview) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.innerHTML = `<img src="${event.target.result}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #ddd;">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
