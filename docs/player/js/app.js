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
  }

  async init() {
    try {
      // Initialize state management
      await playerState.init();

      // Load story from localStorage or URL parameter
      await this.loadStory();

      if (!this.story) {
        this.showError('Failed to load story');
        return;
      }

      // Check if saved game exists
      const savedState = await playerState.getGameState(this.story.id);

      if (savedState) {
        // Resume saved game
        playerState.currentState = savedState;
        this.gameState = playerState;
        this.continueGame();
      } else {
        // Show login screen for new game
        this.renderer = new Renderer(this.story);
        this.renderer.showLoginScreen();
        this.setupLoginHandler();
      }
    } catch (e) {
      console.error('Failed to initialize app:', e);
      this.showError('Failed to initialize app: ' + e.message);
    }
  }

  async loadStory() {
    // Try URL parameter first
    const storyUrl = getUrlParam('story');
    if (storyUrl) {
      this.story = await loadJSONFromUrl(storyUrl);
    }

    // Try localStorage (from authoring tool)
    if (!this.story) {
      this.story = loadStoryFromLocalStorage('storyData');
    }

    // Try hardcoded test story
    if (!this.story) {
      this.story = this.createTestStory();
    }

    return !!this.story;
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
    // Initialize progression engine
    progressionEngine = new ProgressionEngine(this.story, this.gameState);

    // Show desktop
    this.renderer = new Renderer(this.story);
    this.renderer.showDesktop(this.gameState);
    this.setupDesktopHandlers();

    // Start update loop
    this.startUpdateLoop();
  }

  setupDesktopHandlers() {
    // Taskbar handlers
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => this.resetStory());

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
      alert('No emails available yet');
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

    // Show thread view
    const content = this.renderer.renderEmailThread(threadId, threadEmails);
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
      alert('No messages available yet');
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

    // Show thread view
    const content = this.renderer.renderIMThread(conversationId, convMessages);
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
  }

  // Create test story for development
  createTestStory() {
    return {
      id: 'test-story',
      title: 'Test Story',
      description: 'A test story for the player app',
      author: 'Test Author',
      version: '1.0.0',
      theme: {
        primaryColor: '#00ff00',
        textColor: '#00ff00'
      },
      login: {
        username: 'test',
        password: 'test'
      },
      ending: {
        title: 'The End',
        body: 'You have completed the story!',
        triggerConditions: [
          { type: 'artefact_read', artefactId: 'email-001' }
        ],
        allowContinueAfter: false
      },
      artefacts: [
        {
          id: 'email-001',
          type: 'email',
          title: 'Test Email 1',
          sender: 'sender-001',
          recipients: ['player@test.com'],
          subject: 'Welcome',
          body: 'This is a test email.',
          threadId: 'thread-001',
          releaseAtTime: 0
        },
        {
          id: 'im-001',
          type: 'im',
          title: 'Test Message 1',
          conversationId: 'conv-001',
          senderId: 'participant-001',
          body: 'Hello from IM!',
          displayOrder: 1,
          releaseAtTime: 2
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
      calendarConfig: {}
    };
  }
}

// Initialize app when DOM is ready
window.playerApp = new PlayerApp();

document.addEventListener('DOMContentLoaded', () => {
  window.playerApp.init();
});
