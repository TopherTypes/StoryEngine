/**
 * DOM rendering for the player app UI
 */

class Renderer {
  constructor(story) {
    this.story = story;
    this.openWindows = new Map();
    this.focusedWindow = null;
  }

  // Show login screen
  showLoginScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';

    const titleEl = document.getElementById('storyTitle');
    const descEl = document.getElementById('storyDescription');

    titleEl.textContent = this.story.title || 'Story';
    descEl.textContent = this.story.description || '';
  }

  // Show desktop
  showDesktop(gameState) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('desktopScreen').style.display = 'flex';

    // Apply theme
    this.applyTheme(this.story.theme);

    // Set up taskbar buttons
    this.setupTaskbar();

    // Update time display
    this.updateTaskbarTime(gameState);
  }

  // Apply theme colors to the UI
  applyTheme(theme) {
    if (!theme) return;

    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--accent-primary', theme.primaryColor);
    if (theme.accentColor) root.style.setProperty('--accent-secondary', theme.accentColor);
    if (theme.backgroundColor) root.style.setProperty('--bg-primary', theme.backgroundColor);
    if (theme.textColor) root.style.setProperty('--text-primary', theme.textColor);
  }

  // Set up taskbar buttons
  setupTaskbar() {
    const taskbarBtns = document.querySelectorAll('.taskbar-btn[data-app]');
    taskbarBtns.forEach(btn => {
      btn.removeEventListener('click', this.handleTaskbarClick);
      btn.addEventListener('click', (e) => this.handleTaskbarClick(e));
    });
  }

  // Handle taskbar button click
  handleTaskbarClick(e) {
    const appName = e.target.getAttribute('data-app');
    if (appName === 'email') {
      window.playerApp.openEmailWindow();
    } else if (appName === 'im') {
      window.playerApp.openIMWindow();
    } else if (appName === 'files') {
      window.playerApp.openFileExplorerWindow();
    }
  }

  // Update taskbar time display
  updateTaskbarTime(gameState) {
    const elapsed = gameState.getElapsedMinutes();
    const timeEl = document.getElementById('taskbarTime');
    timeEl.textContent = formatTime(elapsed);
  }

  // Create a window
  createWindow(title, appName, content) {
    const windowId = generateId();
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = `window-${windowId}`;
    windowEl.innerHTML = `
      <div class="window-header" data-window-id="${windowId}">
        <span class="window-title">${title}</span>
        <div class="window-controls">
          <button class="window-btn minimize-btn" data-window-id="${windowId}">_</button>
          <button class="window-btn close-btn" data-window-id="${windowId}">×</button>
        </div>
      </div>
      <div class="window-content">
        ${content}
      </div>
    `;

    const container = document.getElementById('windowContainer');
    container.appendChild(windowEl);

    // Set up window controls
    windowEl.querySelector('.minimize-btn').addEventListener('click', () => this.minimizeWindow(windowId));
    windowEl.querySelector('.close-btn').addEventListener('click', () => this.closeWindow(windowId));
    windowEl.querySelector('.window-header').addEventListener('mousedown', (e) => this.startDragWindow(e, windowId));

    // Make window focusable
    windowEl.addEventListener('click', () => this.focusWindow(windowId));

    this.openWindows.set(windowId, { title, appName, element: windowEl });
    this.focusWindow(windowId);

    return windowId;
  }

  // Close a window
  closeWindow(windowId) {
    const window = this.openWindows.get(windowId);
    if (window) {
      window.element.remove();
      this.openWindows.delete(windowId);
      if (this.focusedWindow === windowId) {
        this.focusedWindow = null;
      }
    }
  }

  // Minimize a window
  minimizeWindow(windowId) {
    const window = this.openWindows.get(windowId);
    if (window) {
      window.element.classList.toggle('minimized');
    }
  }

  // Focus a window
  focusWindow(windowId) {
    // Unfocus others
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));

    // Focus this one
    const window = this.openWindows.get(windowId);
    if (window) {
      window.element.classList.add('focused');
      this.focusedWindow = windowId;

      // Update z-index
      let maxZ = 1000;
      this.openWindows.forEach(w => {
        const z = parseInt(window.getComputedStyle(w.element).zIndex) || 0;
        maxZ = Math.max(maxZ, z);
      });
      window.element.style.zIndex = maxZ + 1;
    }
  }

  // Start dragging a window
  startDragWindow(e, windowId) {
    if (e.target.classList.contains('window-btn')) return;

    const window = this.openWindows.get(windowId);
    if (!window) return;

    const windowEl = window.element;
    const rect = windowEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const moveHandler = (e) => {
      windowEl.style.left = (e.clientX - offsetX) + 'px';
      windowEl.style.top = (e.clientY - offsetY) + 'px';
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  // Render email inbox
  renderEmailInbox(emails, onSelectThread) {
    let html = '<div class="email-list">';

    // Group emails by threadId
    const threads = {};
    emails.forEach(email => {
      if (!threads[email.threadId]) {
        threads[email.threadId] = [];
      }
      threads[email.threadId].push(email);
    });

    // Render thread summaries
    Object.entries(threads).forEach(([threadId, threadEmails]) => {
      const latest = threadEmails[threadEmails.length - 1];
      const sender = this.story.emailSenders.find(s => s.id === latest.sender);
      const unreadCount = threadEmails.filter(e => !window.playerApp.gameState.currentState.readArtefactIds.has(e.id)).length;

      html += `
        <div class="email-thread-summary" data-thread-id="${threadId}">
          <div class="thread-sender">${sender ? sender.name : latest.sender}</div>
          <div class="thread-subject">${latest.subject}</div>
          <div class="thread-preview">${latest.body.substring(0, 50)}...</div>
          ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
        </div>
      `;
    });

    html += '</div>';

    // Add click handlers
    setTimeout(() => {
      document.querySelectorAll('.email-thread-summary').forEach(el => {
        el.addEventListener('click', () => {
          const threadId = el.getAttribute('data-thread-id');
          onSelectThread(threadId);
        });
      });
    }, 0);

    return html;
  }

  // Render email thread
  renderEmailThread(threadId, emails) {
    let html = '<div class="email-thread">';

    // Sort emails chronologically
    const sorted = [...emails].sort((a, b) => (a.timestamp || '') < (b.timestamp || '') ? -1 : 1);

    sorted.forEach(email => {
      const sender = this.story.emailSenders.find(s => s.id === email.sender);
      html += `
        <div class="email-message" data-email-id="${email.id}">
          <div class="email-header">
            <strong>${sender ? sender.name : email.sender}</strong>
            <span class="email-time">${email.timestamp || ''}</span>
          </div>
          <div class="email-subject">${email.subject}</div>
          <div class="email-body">${email.body}</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  // Render IM conversations list
  renderIMConversations(messages, onSelectConversation) {
    let html = '<div class="im-list">';

    // Group by conversation
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = [];
      }
      conversations[msg.conversationId].push(msg);
    });

    Object.entries(conversations).forEach(([convId, msgs]) => {
      const latest = msgs[msgs.length - 1];
      const participant = this.story.imParticipants.find(p => p.id === latest.senderId);
      const unreadCount = msgs.filter(m => !window.playerApp.gameState.currentState.readArtefactIds.has(m.id)).length;

      html += `
        <div class="im-conversation-summary" data-conversation-id="${convId}">
          <div class="conv-name">${participant ? participant.name : latest.senderId}</div>
          <div class="conv-preview">${latest.body.substring(0, 50)}...</div>
          ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
        </div>
      `;
    });

    html += '</div>';

    // Add click handlers
    setTimeout(() => {
      document.querySelectorAll('.im-conversation-summary').forEach(el => {
        el.addEventListener('click', () => {
          const convId = el.getAttribute('data-conversation-id');
          onSelectConversation(convId);
        });
      });
    }, 0);

    return html;
  }

  // Render IM conversation thread
  renderIMThread(conversationId, messages) {
    let html = '<div class="im-thread">';

    // Sort by display order
    const sorted = [...messages].sort((a, b) => a.displayOrder - b.displayOrder);

    sorted.forEach(msg => {
      const participant = this.story.imParticipants.find(p => p.id === msg.senderId);
      html += `
        <div class="im-message" data-message-id="${msg.id}">
          <div class="msg-sender">${participant ? participant.name : msg.senderId}</div>
          <div class="msg-time">${msg.timestamp || ''}</div>
          <div class="msg-body">${msg.body}</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  // Show ending screen
  showEnding(ending) {
    document.getElementById('desktopScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'flex';

    document.getElementById('endingTitle').textContent = ending.title || 'The End';
    document.getElementById('endingBody').innerHTML = ending.body || '';

    if (ending.image) {
      const img = document.getElementById('endingImage');
      img.src = ending.image;
      img.style.display = 'block';
    }

    if (ending.allowContinueAfter) {
      document.getElementById('continueBtn').style.display = 'block';
    }
  }

  // Show password prompt
  showPasswordPrompt(callback) {
    const password = prompt('This content is password-protected. Enter password:');
    if (password !== null) {
      callback(password);
    }
  }

  // Show error message
  showError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  // Hide error message
  hideError() {
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
  }

  // Update window content
  updateWindowContent(windowId, content) {
    const window = this.openWindows.get(windowId);
    if (window) {
      const contentEl = window.element.querySelector('.window-content');
      contentEl.innerHTML = content;
    }
  }

  // Render file explorer
  renderFileExplorer(currentPath, files, onNavigate, onOpenFile) {
    let html = '<div class="file-explorer">';

    // Breadcrumb navigation
    html += '<div class="breadcrumb">';
    const parts = currentPath.split('/').filter(p => p);

    html += '<span class="breadcrumb-item" data-path="/">🏠 Root</span>';
    let pathSoFar = '';
    parts.forEach((part, idx) => {
      pathSoFar += '/' + part;
      html += `<span class="breadcrumb-separator">/</span>`;
      html += `<span class="breadcrumb-item" data-path="${pathSoFar}">${part}</span>`;
    });
    html += '</div>';

    // File list
    html += '<div class="file-list">';
    if (files.length === 0) {
      html += '<div class="empty-folder">This folder is empty</div>';
    } else {
      files.forEach(file => {
        const icon = file.type === 'image' ? '🖼️' : file.type === 'audio' ? '🎵' : '📄';
        html += `
          <div class="file-item" data-artefact-id="${file.id}">
            <div class="file-icon">${icon}</div>
            <div class="file-info">
              <div class="file-name">${file.title}</div>
              <div class="file-type">${file.type}</div>
            </div>
          </div>
        `;
      });
    }
    html += '</div>';
    html += '</div>';

    // Add event listeners after rendering
    setTimeout(() => {
      // Breadcrumb navigation
      document.querySelectorAll('.breadcrumb-item').forEach(el => {
        el.addEventListener('click', () => {
          const path = el.getAttribute('data-path');
          onNavigate(path);
        });
      });

      // File items
      document.querySelectorAll('.file-item').forEach(el => {
        el.addEventListener('click', () => {
          const artefactId = el.getAttribute('data-artefact-id');
          onOpenFile(artefactId);
        });
        el.style.cursor = 'pointer';
      });
    }, 0);

    return html;
  }

  // Render document viewer
  renderDocumentViewer(document) {
    let html = '<div class="document-viewer">';

    html += `<div class="document-title">${document.title}</div>`;
    html += '<div class="document-content">';

    // Simple markdown rendering (replace common patterns)
    let body = document.body || '';
    body = body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    body = body.replace(/\*(.*?)\*/g, '<em>$1</em>');
    body = body.replace(/\n/g, '<br>');
    body = body.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

    html += body;
    html += '</div>';
    html += '</div>';

    return html;
  }

  // Render image viewer
  renderImageViewer(image) {
    let html = '<div class="image-viewer">';

    html += `<div class="image-title">${image.title}</div>`;

    html += '<div class="image-container">';
    if (image.assetId) {
      html += `<img src="${image.assetId}" alt="${image.title}" class="image-display">`;
    } else {
      html += '<div class="image-placeholder">Image not available</div>';
    }
    html += '</div>';

    if (image.caption) {
      html += `<div class="image-caption">${image.caption}</div>`;
    }

    html += '</div>';

    // Add zoom controls after rendering
    setTimeout(() => {
      const img = document.querySelector('.image-display');
      if (img) {
        let scale = 1;
        const container = document.querySelector('.image-container');

        // Fit to window initially
        img.style.maxWidth = '100%';
        img.style.maxHeight = '400px';
        img.style.objectFit = 'contain';
      }
    }, 0);

    return html;
  }

  // Render audio player
  renderAudioPlayer(audio) {
    let html = '<div class="audio-player">';

    html += `<div class="audio-title">${audio.title}</div>`;

    html += '<div class="audio-controls">';
    if (audio.assetId) {
      html += `<audio controls style="width: 100%; margin: 20px 0;">
        <source src="${audio.assetId}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>`;
    } else {
      html += '<div class="audio-placeholder">Audio file not available</div>';
    }
    html += '</div>';

    html += '</div>';

    return html;
  }
}

// Global instance placeholder
let renderer = null;
