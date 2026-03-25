/**
 * StoryEngine Authoring Tool - UI Helpers
 * Handles modals, tabs, forms, and other UI interactions
 */

const UI = {
  // Initialize all UI event listeners
  init() {
    this.setupTabHandlers();
    this.setupNavigation();
    this.setupFormListeners();
  },

  // Setup tab switching
  setupTabHandlers() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        if (!tabName) return;

        // Find the parent tabs container
        const tabsContainer = e.target.closest('.tabs');
        if (!tabsContainer) return;

        // Remove active from all buttons and contents in this group
        const allButtons = tabsContainer.querySelectorAll('.tab-button');
        const parent = tabsContainer.parentElement;
        const allContents = parent.querySelectorAll('.tab-content');

        allButtons.forEach(btn => btn.classList.remove('active'));
        allContents.forEach(content => content.classList.remove('active'));

        // Add active to clicked button and corresponding content
        e.target.classList.add('active');
        const activeContent = parent.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });
  },

  // Setup section navigation
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const sectionName = e.target.dataset.section;
        if (!sectionName) return;

        app.goToSection(sectionName);
      });
    });
  },

  // Setup form listeners
  setupFormListeners() {
    // Login required toggle
    const loginCheckbox = document.getElementById('settings-login-required');
    if (loginCheckbox) {
      loginCheckbox.addEventListener('change', () => {
        Renderer.toggleLoginFields();
        app.updateStoryField('loginRequired', loginCheckbox.checked);
      });
    }

    // Story field bindings - map form element ID to story property
    const storyFieldBindings = {
      'story-name': 'title',
      'story-author': 'author',
      'story-description': 'description',
      'story-version': 'version',
      'settings-story-name': 'title',
      'settings-story-author': 'author',
      'settings-story-description': 'description',
      'settings-story-version': 'version',
      'settings-story-tags': 'tags',
      'settings-theme': 'theme',
      'settings-login-message': 'loginMessage',
      'settings-login-username': 'loginUsername',
      'settings-login-password': 'loginPassword',
      'settings-ending-title': 'endingTitle',
      'settings-ending-message': 'endingMessage',
      'settings-ending-condition': 'endingCondition',
      'settings-ending-value': 'endingValue',
      'calendar-owner': 'calendarOwner',
      'calendar-start-date': 'calendarStartDate'
    };

    Object.entries(storyFieldBindings).forEach(([elementId, storyField]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', () => {
          const value = element.type === 'checkbox' ? element.checked : element.value;
          app.updateStoryField(storyField, value);
        });
      }
    });

    // Wallpaper file input setup (handled separately due to file upload logic)
    const wallpaperInput = document.getElementById('settings-wallpaper');
    if (wallpaperInput) {
      wallpaperInput.addEventListener('change', (e) => {
        if (e.target.files?.length > 0) {
          app.handleWallpaperUpload(e.target.files[0]);
        }
      });
    }

    // Wallpaper drag-and-drop setup
    const uploadArea = document.getElementById('wallpaper-upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        if (e.dataTransfer?.files?.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            app.handleWallpaperUpload(file);
          } else {
            UI.alert('Please drop an image file');
          }
        }
      });
    }

    // Form auto-save for artefact fields
    document.addEventListener('change', (e) => {
      // Skip new entity inputs and condition builder fields
      if (!e.target.id.includes('new-') && !e.target.id.includes('condition-')) {
        // Only save if it's an artefact field or story field
        if (e.target.id.startsWith('artefact-') || e.target.closest('.modal')) {
          app.saveStory();
        }
      }
    });
  },

  // Go to section
  goToSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === sectionName) {
        btn.classList.add('active');
      }
    });

    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
      if (section.dataset.section === sectionName) {
        section.classList.add('active');
      }
    });

    // Scroll to top of section
    const section = document.querySelector(`.section[data-section="${sectionName}"]`);
    if (section) {
      section.scrollTop = 0;
    }
  },

  // Open modal
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      return true;
    }
    return false;
  },

  // Close modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      return true;
    }
    return false;
  },

  // Close condition modal
  closeConditionModal() {
    return this.closeModal('condition-modal');
  },

  // Open condition builder modal
  openConditionBuilder() {
    this.openModal('condition-modal');
  },

  // Update condition fields based on type
  updateConditionFields() {
    const typeSelect = document.getElementById('condition-type');
    const fieldsContainer = document.getElementById('condition-fields');
    if (!typeSelect || !fieldsContainer) return;

    const type = typeSelect.value;
    let fieldsHtml = '';

    switch (type) {
      case 'time':
        fieldsHtml = `
          <div class="form-group">
            <label>Minutes after story start</label>
            <input type="number" id="condition-time-value" min="0" placeholder="0">
          </div>
        `;
        break;

      case 'opened':
        fieldsHtml = `
          <div class="form-group">
            <label>Artefact must be opened</label>
            <select id="condition-artefact-id">
              <option value="">-- Select artefact --</option>
            </select>
          </div>
        `;
        break;

      case 'read':
        fieldsHtml = `
          <div class="form-group">
            <label>Artefact must be read</label>
            <select id="condition-artefact-id">
              <option value="">-- Select artefact --</option>
            </select>
          </div>
        `;
        break;

      case 'password':
        fieldsHtml = `
          <div class="form-group">
            <label>Password Key</label>
            <input type="text" id="condition-password-key" placeholder="e.g., correct-password">
          </div>
        `;
        break;

      case 'app':
        fieldsHtml = `
          <div class="form-group">
            <label>App/Folder opened</label>
            <select id="condition-app-id">
              <option value="">-- Select folder --</option>
            </select>
          </div>
        `;
        break;
    }

    fieldsContainer.innerHTML = fieldsHtml;

    // Populate dropdowns for artefact/folder selects
    if (type === 'opened' || type === 'read') {
      this.populateArtefactDropdown();
    } else if (type === 'app') {
      this.populateFolderDropdown();
    }
  },

  // Populate artefact dropdown in condition builder
  populateArtefactDropdown() {
    const select = document.getElementById('condition-artefact-id');
    if (!select || !app.story) return;

    app.story.artefacts.forEach(artefact => {
      const option = document.createElement('option');
      option.value = artefact.id;
      option.textContent = `${artefact.title} (${artefact.type})`;
      select.appendChild(option);
    });
  },

  // Populate folder dropdown in condition builder
  populateFolderDropdown() {
    const select = document.getElementById('condition-app-id');
    if (!select || !app.story) return;

    app.story.folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      select.appendChild(option);
    });
  },

  // Show validation message
  showValidation(issues) {
    if (issues.length === 0) {
      alert('✓ Story is valid!');
      return;
    }

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    let message = `Found ${errorCount + warningCount} issue(s):\n\n`;
    issues.forEach(issue => {
      const icon = issue.type === 'error' ? '✗' : '⚠';
      message += `${icon} ${issue.message}\n`;
    });

    alert(message);
  },

  // Download file
  downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Show spinner overlay
  showSpinner(message = 'Loading...') {
    // Remove existing spinner if any
    const existing = document.getElementById('spinner-overlay');
    if (existing) existing.remove();

    // Create spinner element
    const spinner = document.createElement('div');
    spinner.id = 'spinner-overlay';
    spinner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const spinnerContent = document.createElement('div');
    spinnerContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;

    const spinnerAnim = document.createElement('div');
    spinnerAnim.style.cssText = `
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    `;

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.cssText = `
      margin: 0;
      font-size: 14px;
      color: #333;
    `;

    spinnerContent.appendChild(spinnerAnim);
    spinnerContent.appendChild(messageText);
    spinner.appendChild(spinnerContent);

    // Add animation keyframes if not already present
    if (!document.getElementById('spinner-animation')) {
      const style = document.createElement('style');
      style.id = 'spinner-animation';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(spinner);
  },

  // Hide spinner overlay
  hideSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) {
      spinner.remove();
    }
  },

  // Confirm dialog
  confirm(message) {
    return window.confirm(message);
  },

  // Alert dialog
  alert(message) {
    return window.alert(message);
  },

  // Prompt dialog
  prompt(message, defaultValue = '') {
    return window.prompt(message, defaultValue);
  }
};
