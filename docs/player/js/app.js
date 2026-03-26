/**
 * Main player app controller
 */

class PlayerApp {
  constructor() {
    this.story = null;
    this.gameState = null;
    this.renderer = null;
    this.progressionEngine = null;
    this.updateInterval = null;
    this.selectedEmailThread = null;
    this.selectedIMConversation = null;
    this.bundleAssets = null; // Assets extracted from bundle
  }

  async init() {
    try {
      console.log('[StoryEngine] App initialization starting');

      // Initialize state management
      console.log('[StoryEngine] Initializing player state...');
      await playerState.init();
      console.log('[StoryEngine] Player state initialized successfully');

      // Load story from localStorage or URL parameter
      console.log('[StoryEngine] Loading story...');
      await this.loadStory();
      console.log('[StoryEngine] Story loaded:', this.story?.id);

      if (!this.story) {
        console.error('[StoryEngine] No story available');
        // Check if skipSelector is set
        const skipSelector = getUrlParam('skipSelector');
        if (skipSelector === 'true') {
          console.log('[StoryEngine] Using test story (skipSelector=true)');
          this.story = this.createTestStory();
        } else {
          console.log('[StoryEngine] Showing story selector');
          await this.showStorySelector();
          return;
        }
      }

      // Validate story data
      console.log('[StoryEngine] Validating story data...');
      if (!this.validateStory(this.story)) {
        console.error('[StoryEngine] Story validation failed');
        this.showError('Story data is invalid or corrupted');
        return;
      }
      console.log('[StoryEngine] Story validation passed');

      // Check if saved game exists
      console.log('[StoryEngine] Checking for saved game state...');
      const savedState = await playerState.getGameState(this.story.id);
      console.log('[StoryEngine] Saved state retrieved:', savedState ? 'found' : 'not found');

      if (savedState) {
        // Resume saved game
        console.log('[StoryEngine] Resuming saved game');
        playerState.currentState = savedState;
        this.gameState = playerState;
        this.continueGame();
      } else {
        // Show login screen for new game
        console.log('[StoryEngine] Showing login screen for new game');
        this.renderer = new Renderer(this.story);
        this.renderer.showLoginScreen();
        this.setupLoginHandler();
      }
      console.log('[StoryEngine] App initialization complete');
    } catch (e) {
      console.error('Failed to initialize app:', e);
      this.showError('Failed to initialize app: ' + e.message);
    }
  }

  async loadStory() {
    // Try bundle URL parameter first
    const bundleUrl = getUrlParam('bundle');
    if (bundleUrl) {
      try {
        console.log('[StoryEngine] Loading bundle from URL:', bundleUrl);
        const bundleBlob = await loadJSONFromUrl(bundleUrl);
        const result = await StoryBundle.parseBundle(bundleBlob);
        this.story = result.story;
        this.bundleAssets = result.assets;
        console.log('[StoryEngine] Bundle loaded successfully');
        this.logLoadedStoryStructure('bundle');
        return !!this.story;
      } catch (e) {
        console.error('[StoryEngine] Failed to load bundle from URL:', e);
        // Fall through to other methods
      }
    }

    // Try story JSON URL parameter
    const storyUrl = getUrlParam('story');
    if (storyUrl) {
      try {
        console.log('[StoryEngine] Loading story from URL:', storyUrl);
        this.story = await loadJSONFromUrl(storyUrl);
        this.logLoadedStoryStructure('URL');
      } catch (e) {
        console.error('Failed to load story from URL:', e);
      }
    }

    // Try localStorage (from authoring tool)
    if (!this.story) {
      try {
        console.log('[StoryEngine] Loading story from localStorage');
        this.story = loadStoryFromLocalStorage('storyData');
        this.logLoadedStoryStructure('localStorage');
      } catch (e) {
        console.error('Failed to load story from localStorage:', e);
      }
    }

    return !!this.story;
  }

  logLoadedStoryStructure(source) {
    if (!this.story) return;
    console.group('[StoryEngine] Loaded Story Structure (from ' + source + ')');
    console.log('ID:', this.story.id);
    console.log('Title:', this.story.title);
    console.log('Author:', this.story.author || '(not set)');
    console.log('Description:', this.story.description || '(not set)');
    console.log('Version:', this.story.version || '(not set)');
    console.log('Login configured:', !!this.story.login, {
      hasUsername: !!this.story.login?.username,
      hasPassword: !!this.story.login?.password
    });
    console.log('Theme:', this.story.theme || '(not set)');
    console.log('Artefacts:', this.story.artefacts?.length || 0, 'items');
    if (this.story.artefacts?.length > 0) {
      console.log('  - First artefact:', {
        id: this.story.artefacts[0].id,
        type: this.story.artefacts[0].type,
        title: this.story.artefacts[0].title || '(no title)'
      });
    }
    console.log('Email Senders:', this.story.emailSenders?.length || 0, 'items');
    console.log('IM Participants:', this.story.imParticipants?.length || 0, 'items');
    console.log('Ending:', this.story.ending ? { title: this.story.ending.title } : '(not set)');
    console.log('File Structure:', this.story.fileStructure?.length || 0, 'items');
    console.log('Calendar Events:', this.story.calendarEvents?.length || 0, 'items');
    console.groupEnd();
  }

  validateStory(story) {
    console.log('[Validation] Starting story validation...');
    console.log('[Validation] Story object keys:', Object.keys(story));

    // Check required fields
    if (!story.id || typeof story.id !== 'string') {
      console.error('[Validation] ❌ FAILED: story.id is missing or not a string. Got:', story.id);
      return false;
    }
    console.log('[Validation] ✓ story.id:', story.id);

    if (!story.title || typeof story.title !== 'string') {
      console.error('[Validation] ❌ FAILED: story.title is missing or not a string. Got:', story.title);
      return false;
    }
    console.log('[Validation] ✓ story.title:', story.title);

    if (!story.login) {
      console.error('[Validation] ❌ FAILED: story.login is missing. Got:', story.login);
      return false;
    }
    if (!story.login.username) {
      console.error('[Validation] ❌ FAILED: story.login.username is missing. Got:', story.login.username);
      return false;
    }
    if (!story.login.password) {
      console.error('[Validation] ❌ FAILED: story.login.password is missing. Got:', story.login.password);
      return false;
    }
    console.log('[Validation] ✓ story.login:', { username: story.login.username ? '(set)' : '(empty)', password: story.login.password ? '(set)' : '(empty)' });

    // Check arrays
    if (!Array.isArray(story.artefacts)) {
      console.error('[Validation] ❌ FAILED: story.artefacts is not an array. Got:', story.artefacts, 'Type:', typeof story.artefacts);
      return false;
    }
    console.log('[Validation] ✓ story.artefacts is array with', story.artefacts.length, 'items');

    if (!Array.isArray(story.emailSenders)) {
      console.error('[Validation] ❌ FAILED: story.emailSenders is not an array. Got:', story.emailSenders, 'Type:', typeof story.emailSenders);
      return false;
    }
    console.log('[Validation] ✓ story.emailSenders is array with', story.emailSenders.length, 'items');

    if (!Array.isArray(story.imParticipants)) {
      console.error('[Validation] ❌ FAILED: story.imParticipants is not an array. Got:', story.imParticipants, 'Type:', typeof story.imParticipants);
      return false;
    }
    console.log('[Validation] ✓ story.imParticipants is array with', story.imParticipants.length, 'items');

    // Validate artefacts
    console.log('[Validation] Validating artefacts...');
    for (let i = 0; i < story.artefacts.length; i++) {
      const artefact = story.artefacts[i];
      if (!artefact.id) {
        console.error('[Validation] ❌ FAILED: artefact[' + i + '].id is missing. Got:', artefact.id);
        return false;
      }
      if (!artefact.type) {
        console.error('[Validation] ❌ FAILED: artefact[' + i + '].type is missing. Got:', artefact.type);
        return false;
      }
    }
    console.log('[Validation] ✓ All', story.artefacts.length, 'artefacts have id and type');

    // Check ending
    if (!story.ending) {
      console.error('[Validation] ❌ FAILED: story.ending is missing. Got:', story.ending);
      return false;
    }
    if (!story.ending.title) {
      console.error('[Validation] ❌ FAILED: story.ending.title is missing. Got:', story.ending.title);
      return false;
    }
    console.log('[Validation] ✓ story.ending.title:', story.ending.title);

    console.log('[Validation] ✅ All validation checks passed!');
    return true;
  }

  setupLoginHandler() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!this.story.login) {
      this.renderer.showError('No login configured for this story');
      return;
    }

    if (validateLogin(username, password, this.story.login)) {
      this.renderer.hideError();
      this.startNewGame();
    } else {
      this.renderer.showError('Invalid username or password');
    }
  }

  async startNewGame() {
    // Create new game state
    this.gameState = playerState;
    playerState.currentState = playerState.createNewGameState(this.story.id);

    // Save initial state
    await playerState.saveGameState(playerState.currentState);

    // Initialize progression engine
    progressionEngine = new ProgressionEngine(this.story, this.gameState);

    // Show desktop
    this.renderer.showDesktop(this.gameState);
    this.setupDesktopHandlers();

    // Start update loop
    this.startUpdateLoop();
  }

  async continueGame() {
    try {
      console.log('[StoryEngine] continueGame: Initializing progression engine...');
      // Initialize progression engine
      progressionEngine = new ProgressionEngine(this.story, this.gameState);
      console.log('[StoryEngine] continueGame: Progression engine initialized');

      console.log('[StoryEngine] continueGame: Creating renderer...');
      // Show desktop
      this.renderer = new Renderer(this.story);
      console.log('[StoryEngine] continueGame: Renderer created');

      console.log('[StoryEngine] continueGame: Showing desktop...');
      this.renderer.showDesktop(this.gameState);
      console.log('[StoryEngine] continueGame: Desktop shown');

      console.log('[StoryEngine] continueGame: Setting up desktop handlers...');
      this.setupDesktopHandlers();
      console.log('[StoryEngine] continueGame: Desktop handlers set up');

      console.log('[StoryEngine] continueGame: Starting update loop...');
      // Start update loop
      this.startUpdateLoop();
      console.log('[StoryEngine] continueGame: Update loop started - game ready');
    } catch (e) {
      console.error('[StoryEngine] continueGame error:', e);
      this.showError('Failed to resume game: ' + e.message);
    }
  }

  setupDesktopHandlers() {
    // Taskbar handlers
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => this.resetStory());

    // Start menu button
    const startMenuBtn = document.getElementById('startMenuBtn');
    if (startMenuBtn) {
      startMenuBtn.addEventListener('click', () => this.showStartMenu());
    }

    // Start menu button handlers
    const startMenuOverlay = document.getElementById('startMenuOverlay');
    if (startMenuOverlay) {
      // Close menu when clicking overlay (outside popup)
      startMenuOverlay.addEventListener('click', (e) => {
        if (e.target === startMenuOverlay) {
          this.renderer.hideStartMenu();
        }
      });
    }

    const continueBtn = document.getElementById('startMenuContinueBtn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.renderer.hideStartMenu();
      });
    }

    const newStoryBtn = document.getElementById('startMenuNewStoryBtn');
    if (newStoryBtn) {
      newStoryBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    const logoutBtn = document.getElementById('startMenuLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Window handlers are set up in renderer
  }

  startUpdateLoop() {
    // Update every 5 seconds
    this.updateInterval = setInterval(() => {
      this.update();
    }, 5000);

    // Also update immediately
    this.update();
  }

  update() {
    // Update session time
    this.gameState.updateSessionTime();

    // Update taskbar time display
    this.renderer.updateTaskbarTime(this.gameState);

    // Evaluate progression
    progressionEngine.evaluateAllArtefacts();

    // Check ending condition
    if (!this.gameState.isEndingTriggered() && progressionEngine.checkEndingCondition()) {
      this.gameState.triggerEnding();
      this.triggerEnding();
      return;
    }

    // Auto-save
    playerState.saveGameState(this.gameState.currentState);
  }

  openEmailWindow() {
    // Mark email app as visited
    this.gameState.markAppVisited('email');

    // Get available emails
    const availableEmails = progressionEngine.getAvailableArtefacts('email');

    if (availableEmails.length === 0) {
      const content = this.renderer.renderEmptyState('📧 Email', 'No emails available yet. Check back later.');
      this.renderer.createWindow('📧 Email', 'email', content);
      return;
    }

    // Show email inbox
    const content = this.renderer.renderEmailInbox(availableEmails, (threadId) => {
      this.showEmailThread(threadId);
    });

    const windowId = this.renderer.createWindow('📧 Email', 'email', content);
  }

  showEmailThread(threadId) {
    // Get emails for this thread
    const availableEmails = progressionEngine.getAvailableArtefacts('email');
    const threadEmails = availableEmails.filter(e => e.threadId === threadId);

    if (threadEmails.length === 0) return;

    // Mark all emails in thread as read
    threadEmails.forEach(email => {
      this.gameState.markArtefactOpened(email.id);
      this.gameState.markArtefactRead(email.id);
    });

    // Resolve attachment assets for all emails
    const resolvedEmails = threadEmails.map(email => this._resolveArtefactAttachments(email));

    // Show thread view
    const content = this.renderer.renderEmailThread(threadId, resolvedEmails);
    const windowEl = document.querySelector('.window.focused');
    if (windowEl) {
      const windowId = windowEl.id.replace('window-', '');
      this.renderer.updateWindowContent(windowId, content);
    }
  }

  openIMWindow() {
    // Mark IM app as visited
    this.gameState.markAppVisited('im');

    // Get available IM messages
    const availableMessages = progressionEngine.getAvailableArtefacts('im');

    if (availableMessages.length === 0) {
      const content = this.renderer.renderEmptyState('💬 Messages', 'No messages available yet. Check back later.');
      this.renderer.createWindow('💬 Messages', 'im', content);
      return;
    }

    // Show conversations list
    const content = this.renderer.renderIMConversations(availableMessages, (convId) => {
      this.showIMThread(convId);
    });

    const windowId = this.renderer.createWindow('💬 Messages', 'im', content);
  }

  showIMThread(conversationId) {
    // Get messages for this conversation
    const availableMessages = progressionEngine.getAvailableArtefacts('im');
    const convMessages = availableMessages.filter(m => m.conversationId === conversationId);

    if (convMessages.length === 0) return;

    // Mark all messages as read
    convMessages.forEach(msg => {
      this.gameState.markArtefactOpened(msg.id);
      this.gameState.markArtefactRead(msg.id);
    });

    // Resolve attachment assets for all messages
    const resolvedMessages = convMessages.map(msg => this._resolveArtefactAttachments(msg));

    // Show thread view
    const content = this.renderer.renderIMThread(conversationId, resolvedMessages);
    const windowEl = document.querySelector('.window.focused');
    if (windowEl) {
      const windowId = windowEl.id.replace('window-', '');
      this.renderer.updateWindowContent(windowId, content);
    }
  }

  openFileExplorerWindow() {
    // Mark file explorer app as visited
    this.gameState.markAppVisited('files');

    // Get current folder path (default to root)
    const currentPath = this.gameState.currentFilePath || '/';

    // Get available files for current folder
    const availableFiles = this.getFilesInFolder(currentPath);

    // Show file explorer
    const content = this.renderer.renderFileExplorer(
      currentPath,
      availableFiles,
      (path) => this.navigateToFolder(path),
      (artefactId) => this.openFileContent(artefactId)
    );

    const windowId = this.renderer.createWindow('📁 Files', 'files', content);

    // Store window ID in game state for updates
    this.fileExplorerWindowId = windowId;
  }

  navigateToFolder(path) {
    // Update current path in game state
    if (!this.gameState.currentFilePath) {
      this.gameState.currentFilePath = '/';
    }
    this.gameState.currentFilePath = path;
    this.gameState.markFolderVisited(path);

    // Get available files for new folder
    const availableFiles = this.getFilesInFolder(path);

    // Update window content
    const content = this.renderer.renderFileExplorer(
      path,
      availableFiles,
      (newPath) => this.navigateToFolder(newPath),
      (artefactId) => this.openFileContent(artefactId)
    );

    const windowEl = document.querySelector('.window.focused');
    if (windowEl) {
      const windowId = windowEl.id.replace('window-', '');
      this.renderer.updateWindowContent(windowId, content);
    }
  }

  getFilesInFolder(folderPath) {
    const availableArtefacts = progressionEngine.getAvailableArtefacts(['document', 'image', 'audio']);

    // Filter to files in this folder
    const filesInFolder = availableArtefacts.filter(artefact => {
      const artPath = artefact.folderPath || '/';
      return artPath === folderPath;
    });

    return filesInFolder;
  }

  openFileContent(artefactId) {
    const artefact = this.story.artefacts.find(a => a.id === artefactId);
    if (!artefact) return;

    // Check if password protected and not yet unlocked
    if (artefact.password && !this.gameState.isPasswordUnlocked(artefactId)) {
      this.showPasswordPrompt(artefactId, (success) => {
        if (success) {
          this.markArtefactOpenAndRoute(artefact, artefactId);
        }
      });
      return;
    }

    this.markArtefactOpenAndRoute(artefact, artefactId);
  }

  markArtefactOpenAndRoute(artefact, artefactId) {
    // Mark as opened
    this.gameState.markArtefactOpened(artefactId);

    // Route to appropriate viewer based on type
    if (artefact.type === 'document') {
      this.openDocumentWindow(artefact);
    } else if (artefact.type === 'image') {
      this.openImageWindow(artefact);
    } else if (artefact.type === 'audio') {
      this.openAudioWindow(artefact);
    }
  }

  showPasswordPrompt(artefactId, callback) {
    this.renderer.showPasswordPromptModal(artefactId, (password) => {
      if (password === null) {
        callback(false);
        return;
      }

      const artefact = this.story.artefacts.find(a => a.id === artefactId);
      if (artefact && artefact.password === password) {
        this.gameState.unlockPassword(artefactId, password);
        callback(true);
      } else {
        this.renderer.showPasswordError('Incorrect password');
        // Retry
        setTimeout(() => {
          this.showPasswordPrompt(artefactId, callback);
        }, 500);
      }
    });
  }

  openDocumentWindow(document) {
    const content = this.renderer.renderDocumentViewer(document);
    const windowId = this.renderer.createWindow(`📄 ${document.title}`, 'document', content);

    // Mark as read when closed
    const closeBtn = document.querySelector(`#window-${windowId} .close-btn`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.gameState.markArtefactRead(document.id);
      });
    }
  }

  openImageWindow(image) {
    // Resolve asset URL if from bundle
    const processedImage = this._resolveAsset(image);
    const content = this.renderer.renderImageViewer(processedImage);
    const windowId = this.renderer.createWindow(`🖼️ ${image.title}`, 'image', content);

    // Mark as read when closed
    const closeBtn = document.querySelector(`#window-${windowId} .close-btn`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.gameState.markArtefactRead(image.id);
      });
    }
  }

  openAudioWindow(audio) {
    // Resolve asset URL if from bundle
    const processedAudio = this._resolveAsset(audio);
    const content = this.renderer.renderAudioPlayer(processedAudio);
    const windowId = this.renderer.createWindow(`🎵 ${audio.title}`, 'audio', content);
  }

  // Helper to resolve asset URLs from bundles
  _resolveAsset(artefact) {
    if (!this.bundleAssets) return artefact;

    const processed = { ...artefact };

    // Try to resolve assetId from bundle
    if (artefact.assetId && this.bundleAssets[artefact.assetId]) {
      const asset = this.bundleAssets[artefact.assetId];
      const blob = new Blob([asset.data], { type: asset.mimeType });
      processed.assetId = URL.createObjectURL(blob);
    }

    return processed;
  }

  // Helper to resolve attachment assets in emails and IM messages
  _resolveArtefactAttachments(artefact) {
    if (!this.bundleAssets || !artefact.attachments || artefact.attachments.length === 0) {
      return artefact;
    }

    const processed = { ...artefact };
    processed.attachments = artefact.attachments.map(assetId => {
      if (this.bundleAssets[assetId]) {
        const asset = this.bundleAssets[assetId];
        const blob = new Blob([asset.data], { type: asset.mimeType });
        return {
          assetId: URL.createObjectURL(blob),
          mimeType: asset.mimeType
        };
      }
      return { assetId, mimeType: 'application/octet-stream' };
    });

    return processed;
  }

  openCalendarWindow() {
    // Mark calendar app as visited
    this.gameState.markAppVisited('calendar');

    // Get available calendar events
    const availableEvents = this.getAvailableCalendarEvents();

    // Show calendar
    const content = this.renderer.renderCalendar(availableEvents, (eventId) => {
      this.showEventDetails(eventId);
    });

    const windowId = this.renderer.createWindow('📅 Calendar', 'calendar', content);
  }

  getAvailableCalendarEvents() {
    // Get calendar events from story
    if (!this.story.calendarEvents) {
      return [];
    }

    const elapsedMinutes = this.gameState.getElapsedMinutes();

    // Filter based on release conditions
    return this.story.calendarEvents.filter(event => {
      if (!event.releaseConditions) return true;

      // For now, simple time-based release
      if (event.releaseConditions.releaseAtTime !== undefined) {
        return elapsedMinutes >= event.releaseConditions.releaseAtTime;
      }

      return true;
    });
  }

  showEventDetails(eventId) {
    const event = this.story.calendarEvents.find(e => e.id === eventId);
    if (!event) return;

    const content = this.renderer.renderEventDetails(event);
    const windowEl = document.querySelector('.window.focused');
    if (windowEl) {
      const windowId = windowEl.id.replace('window-', '');
      this.renderer.updateWindowContent(windowId, content);
    }
  }

  triggerEnding() {
    clearInterval(this.updateInterval);
    const ending = this.story.ending;
    this.renderer.showEnding(ending);

    // Setup ending buttons
    document.getElementById('restartBtn').addEventListener('click', () => this.resetStory());
    if (ending.allowContinueAfter) {
      document.getElementById('continueBtn').addEventListener('click', () => {
        this.renderer.showDesktop(this.gameState);
      });
    }
  }

  async resetStory() {
    if (confirm('Are you sure you want to restart the story?')) {
      await playerState.deleteGameState(this.story.id);
      location.reload();
    }
  }

  showError(message) {
    // Hide loading screen so error is visible
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #333;
      color: #fff;
      padding: 20px;
      border-radius: 5px;
      z-index: 10000;
      text-align: center;
    `;
    errorContainer.innerHTML = `
      <h2>Error</h2>
      <p>${message}</p>
    `;
    document.body.appendChild(errorContainer);
    console.error('App Error:', message);
  }

  // Show story selector screen
  async showStorySelector() {
    // Initialize renderer if needed
    if (!this.renderer) {
      this.renderer = new Renderer({});
    }

    // Show selector screen
    this.renderer.showStorySelector();

    // Initialize story selector
    await storySelector.init();

    // Setup selector callbacks
    storySelector.onStorySelected = async (storyOrId, file) => {
      try {
        // Hide selector
        this.renderer.hideStorySelector();

        // Handle different input types
        if (typeof storyOrId === 'string') {
          // String ID
          if (storyOrId === 'test-story') {
            this.story = this.createTestStory();
            console.log('[StoryEngine] Test story loaded from selector');
          } else {
            console.error('[Selector] Unknown story ID:', storyOrId);
            return;
          }
        } else if (storyOrId && storyOrId.id) {
          // Story object
          this.story = storyOrId;
          storySelector.addRecentStory(this.story, file?.name || 'Unknown');
          console.log('[StoryEngine] Story loaded from selector:', this.story.id);
        }

        // Continue initialization
        if (this.validateStory(this.story)) {
          const savedState = await playerState.getGameState(this.story.id);
          if (savedState) {
            playerState.currentState = savedState;
            this.gameState = playerState;
            this.continueGame();
          } else {
            this.renderer = new Renderer(this.story);
            this.renderer.showLoginScreen();
            this.setupLoginHandler();
          }
        } else {
          this.showError('Story validation failed');
        }
      } catch (e) {
        console.error('[Selector] Error handling story selection:', e);
        this.showError('Failed to load story: ' + e.message);
      }
    };

    storySelector.onStoryLoaded = (bundleResult) => {
      console.log('[Selector] Bundle loaded with assets');
      this.bundleAssets = bundleResult.assets;
    };

    // Show recent stories
    storySelector.show();
  }

  // Show start menu in desktop
  showStartMenu() {
    if (this.renderer) {
      this.renderer.showStartMenu();
    }
  }

  // Handle logout from start menu
  handleLogout() {
    console.log('[StoryEngine] User logging out');
    // Save current game state
    if (this.gameState && this.story) {
      playerState.saveGameState(this.story.id, this.gameState.currentState);
    }
    // Return to selector
    this.story = null;
    this.gameState = null;
    this.selectedEmailThread = null;
    this.selectedIMConversation = null;
    this.bundleAssets = null;

    // Reinitialize
    this.init();
  }

  // Create test story for development
  createTestStory() {
    return {
      id: 'test-story',
      title: 'Test Story - Complete Artifact Suite',
      description: 'A comprehensive test story demonstrating all artifact types for functionality testing',
      author: 'StoryEngine Test',
      version: '1.0.0',
      theme: {
        primaryColor: '#00ff00',
        accentColor: '#00aa00',
        backgroundColor: '#001a00',
        textColor: '#00ff00'
      },
      login: {
        enabled: true,
        username: 'test',
        password: 'test'
      },
      ending: {
        title: 'Test Complete!',
        body: 'You have successfully viewed all test artifacts and completed the story!',
        triggerConditions: [
          { type: 'artefact_read', artefactId: 'email-001' }
        ],
        allowContinueAfter: false
      },
      artefacts: [
        {
          id: 'email-001',
          type: 'email',
          title: 'Welcome Email',
          visibleTitle: 'Welcome Email',
          sender: 'sender-001',
          recipients: ['player@test.com'],
          subject: 'Welcome to the Story',
          body: 'Hello! This is a test email artifact demonstrating the email functionality.',
          threadId: 'thread-001',
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'email']
        },
        {
          id: 'im-001',
          type: 'im',
          title: 'Chat Message',
          visibleTitle: 'Chat Message',
          conversationId: 'conv-001',
          senderId: 'participant-001',
          body: 'Hello from the test IM artifact! This demonstrates instant messaging functionality.',
          displayOrder: 1,
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'im']
        },
        {
          id: 'doc-001',
          type: 'document',
          title: 'Test Document',
          visibleTitle: 'Test Document',
          body: '# Welcome to the Story\n\nThis is a **test document** artifact with *markdown* formatting.\n\n## Features Demonstrated\n- Markdown formatting\n- Multiple paragraphs\n- Proper document display\n\nYou can read about the story and its artifacts here.',
          folderPath: '/',
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'document']
        },
        {
          id: 'img-001',
          type: 'image',
          title: 'Test Image',
          visibleTitle: 'Test Image',
          assetId: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%2300ff00%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23000%22 text-anchor=%22middle%22 dy=%22.3em%22%3ETest Image%3C/text%3E%3C/svg%3E',
          caption: 'This is a test image artifact demonstrating image display functionality',
          folderPath: '/',
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'image']
        },
        {
          id: 'audio-001',
          type: 'audio',
          title: 'Test Audio',
          visibleTitle: 'Test Audio',
          assetId: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
          folderPath: '/',
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'audio']
        },
        {
          id: 'calendar-001',
          type: 'calendar',
          title: 'Test Event',
          visibleTitle: 'Test Event',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          location: 'Conference Room',
          description: 'This is a test calendar event artifact. It demonstrates the calendar functionality in the story engine.',
          attendees: ['participant-001'],
          releaseAtTime: 0,
          locked: false,
          tags: ['test', 'calendar']
        }
      ],
      emailSenders: [
        {
          id: 'sender-001',
          name: 'Test Sender',
          email: 'sender@test.com'
        }
      ],
      imParticipants: [
        {
          id: 'participant-001',
          name: 'Test Participant',
          handle: '@testuser'
        }
      ],
      fileStructure: [],
      calendarConfig: {
        timezone: 'UTC'
      },
      calendarEvents: [
        {
          id: 'event-001',
          title: 'Story Briefing',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          location: 'Conference Room A',
          description: 'Initial briefing about the story events.',
          releaseAtTime: 0
        },
        {
          id: 'event-002',
          title: 'Investigation Update',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '2:00 PM',
          description: 'New findings have been discovered.',
          releaseAtTime: 30
        },
        {
          id: 'event-003',
          title: 'Final Conclusion',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          time: '5:00 PM',
          location: 'Main Office',
          description: 'Meeting to discuss the final resolution.',
          releaseAtTime: 60
        }
      ]
    };
  }

  // Bundle loading handlers
  showBundleLoadUI() {
    const loadingScreen = document.getElementById('loadingScreen');
    const bundleLoadUI = document.getElementById('bundleLoadUI');

    if (loadingScreen && bundleLoadUI) {
      loadingScreen.style.display = 'flex';
      bundleLoadUI.style.display = 'block';
    }

    this.setupBundleLoadHandlers();
  }

  setupBundleLoadHandlers() {
    const fileInput = document.getElementById('bundleFileInput');
    const dropZone = document.getElementById('dropZone');
    const bundleError = document.getElementById('bundleError');

    if (!fileInput || !dropZone) return;

    // File input change handler
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.loadBundleFile(file, bundleError);
      }
    });

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.background = 'rgba(255,255,255,0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.background = 'rgba(255,255,255,0.05)';
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.style.background = 'rgba(255,255,255,0.05)';

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.story') || file.type === 'application/x-story-bundle') {
          await this.loadBundleFile(file, bundleError);
        } else {
          this.showBundleError('Invalid file format. Please use a .story bundle.', bundleError);
        }
      }
    });
  }

  async loadBundleFile(file, errorElement) {
    try {
      if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
      }

      console.log('[StoryEngine] Loading bundle file:', file.name);
      const result = await StoryBundle.parseBundle(file);

      this.story = result.story;
      this.bundleAssets = result.assets;

      console.log('[StoryEngine] Bundle loaded successfully');

      // Continue with initialization
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.style.display = 'flex';
      }

      await this.init();
    } catch (error) {
      console.error('[StoryEngine] Failed to load bundle:', error);
      this.showBundleError(`Failed to load bundle: ${error.message}`, errorElement);
    }
  }

  showBundleError(message, errorElement) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    console.error('[StoryEngine]', message);
  }

  // Get asset data from bundle assets
  getAssetData(assetId) {
    if (this.bundleAssets && this.bundleAssets[assetId]) {
      const asset = this.bundleAssets[assetId];
      // Convert to data URL for display
      const blob = new Blob([asset.data], { type: asset.mimeType });
      return URL.createObjectURL(blob);
    }
    return null;
  }
}

// Initialize app when DOM is ready
window.playerApp = new PlayerApp();

document.addEventListener('DOMContentLoaded', () => {
  window.playerApp.init();
});
