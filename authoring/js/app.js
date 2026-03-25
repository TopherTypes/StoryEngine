/**
 * StoryEngine Authoring Tool - Main Application
 * Core app logic and event handling
 */

const app = {
  story: null,
  selectedArtefactId: null,

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
    const filterType = document.getElementById('type-filter')?.value || '';
    Renderer.renderArtefactList(this.story, filterType);
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
        if (!username || !display) {
          UI.alert('Please fill in both username and display name');
          return;
        }
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

  // Export
  exportStory() {
    const json = State.exportStory(this.story);
    const filename = `${this.story.title.replace(/\s+/g, '-').toLowerCase()}_${Date.now()}.json`;
    UI.downloadFile(json, filename);
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

    const filename = fileInput.files[0].name;
    const path = `assets/images/${filename}`;

    this.updateCurrentArtefact('assetPath', path);

    // Update path input for user verification
    const pathInput = document.getElementById('artefact-asset');
    if (pathInput) pathInput.value = path;

    // Clear file input
    fileInput.value = '';
  },

  handleAudioUpload(artefactId) {
    const fileInput = document.getElementById('artefact-audio-file');
    if (!fileInput || !fileInput.files.length) {
      UI.alert('Please select an audio file first');
      return;
    }

    const filename = fileInput.files[0].name;
    const path = `assets/audio/${filename}`;

    this.updateCurrentArtefact('assetPath', path);

    // Update path input for user verification
    const pathInput = document.getElementById('artefact-audio-asset');
    if (pathInput) pathInput.value = path;

    // Clear file input
    fileInput.value = '';
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
