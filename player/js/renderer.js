/**
 * DOM rendering for the player app UI
 */

class Renderer {
  constructor(story) {
    this.story = story;
    this.openWindows = new Map();
    this.focusedWindow = null;
    this.isFullscreen = false;
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
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('desktopScreen').style.display = 'flex';

    // Apply theme
    this.applyTheme(this.story.theme);

    // Set up taskbar buttons
    this.setupTaskbar();

    // Update time display
    this.updateTaskbarTime(gameState);

    // Auto-fullscreen when desktop loads
    setTimeout(() => this.enterFullscreen(), 100);
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

    // Setup fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Setup reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.playerApp) {
          window.playerApp.resetStory();
        }
      });
    }
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
    } else if (appName === 'calendar') {
      window.playerApp.openCalendarWindow();
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
      <div class="window-resize-handle" data-window-id="${windowId}"></div>
    `;

    const container = document.getElementById('windowContainer');
    container.appendChild(windowEl);

    // Set up window controls
    windowEl.querySelector('.minimize-btn').addEventListener('click', () => this.minimizeWindow(windowId));
    windowEl.querySelector('.close-btn').addEventListener('click', () => this.closeWindow(windowId));
    windowEl.querySelector('.window-header').addEventListener('mousedown', (e) => this.startDragWindow(e, windowId));
    windowEl.querySelector('.window-resize-handle').addEventListener('mousedown', (e) => this.startResizeWindow(e, windowId));

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
    if (e.target.classList.contains('window-resize-handle')) return;

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

  // Start resizing a window
  startResizeWindow(e, windowId) {
    e.preventDefault();
    e.stopPropagation();

    const window = this.openWindows.get(windowId);
    if (!window) return;

    const windowEl = window.element;
    const rect = windowEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = rect.width;
    const initialHeight = rect.height;

    windowEl.classList.add('resizing');

    const moveHandler = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const newWidth = Math.max(300, initialWidth + deltaX);
      const newHeight = Math.max(200, initialHeight + deltaY);

      windowEl.style.width = newWidth + 'px';
      windowEl.style.height = newHeight + 'px';
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      windowEl.classList.remove('resizing');
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  // Update window dimensions
  updateWindowDimensions(windowId, width, height) {
    const window = this.openWindows.get(windowId);
    if (window) {
      // Clamp to minimum constraints
      const constrainedWidth = Math.max(300, width);
      const constrainedHeight = Math.max(200, height);

      window.element.style.width = constrainedWidth + 'px';
      window.element.style.height = constrainedHeight + 'px';
    }
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
      `;

      // Render attachments if present
      if (email.hasAttachment && email.attachments && email.attachments.length > 0) {
        html += '<div class="email-attachments">';
        email.attachments.forEach(attachment => {
          if (attachment.mimeType.startsWith('image/')) {
            html += `<img src="${attachment.assetId}" alt="Attachment" class="email-attachment-image" style="max-width: 100%; max-height: 300px; margin: 10px 0;">`;
          } else if (attachment.mimeType.startsWith('audio/')) {
            html += `<audio controls style="display: block; margin: 10px 0;">
              <source src="${attachment.assetId}" type="${attachment.mimeType}">
              Your browser does not support the audio element.
            </audio>`;
          }
        });
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // Helper: Generate avatar HTML for a participant
  getAvatarHTML(participant) {
    if (!participant) {
      return '<div class="im-avatar im-avatar-initials">?</div>';
    }

    if (participant.profilePicture) {
      return `<img src="${participant.profilePicture}" class="im-avatar">`;
    }

    // Generate initials fallback
    const displayName = participant.displayName || participant.name || '?';
    const initials = displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return `<div class="im-avatar im-avatar-initials">${initials}</div>`;
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
      const displayName = participant ? (participant.displayName || participant.name) : latest.senderId;

      html += `
        <div class="im-conversation-summary" data-conversation-id="${convId}">
          <div class="conv-header">
            ${this.getAvatarHTML(participant)}
            <div class="conv-name">${displayName}</div>
          </div>
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
      const displayName = participant ? (participant.displayName || participant.name) : msg.senderId;

      html += `
        <div class="im-message" data-message-id="${msg.id}">
          <div class="msg-header">
            ${this.getAvatarHTML(participant)}
            <div class="msg-sender-info">
              <div class="msg-sender">${displayName}</div>
              <div class="msg-time">${msg.timestamp || ''}</div>
            </div>
          </div>
          <div class="msg-body">${msg.body}</div>
      `;

      // Render attachments if present
      if (msg.hasAttachment && msg.attachments && msg.attachments.length > 0) {
        html += '<div class="im-attachments">';
        msg.attachments.forEach(attachment => {
          if (attachment.mimeType.startsWith('image/')) {
            html += `<img src="${attachment.assetId}" alt="Attachment" class="im-attachment-image" style="max-width: 100%; max-height: 300px; margin: 10px 0;">`;
          } else if (attachment.mimeType.startsWith('audio/')) {
            html += `<audio controls style="display: block; margin: 10px 0;">
              <source src="${attachment.assetId}" type="${attachment.mimeType}">
              Your browser does not support the audio element.
            </audio>`;
          }
        });
        html += '</div>';
      }

      html += '</div>';
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

  // Show password prompt (old alert-based version, kept for compatibility)
  showPasswordPrompt(callback) {
    const password = prompt('This content is password-protected. Enter password:');
    if (password !== null) {
      callback(password);
    }
  }

  // Show password prompt modal (new version with proper UI)
  showPasswordPromptModal(artefactId, callback) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'password-prompt-modal';
    modal.id = `password-modal-${artefactId}`;
    modal.innerHTML = `
      <div class="password-prompt-container">
        <div class="password-prompt-title">🔒 Password Protected</div>
        <div class="password-prompt-message">This content is password protected. Please enter the password:</div>
        <input type="password" class="password-prompt-input" placeholder="Enter password" autocomplete="off">
        <div class="password-error-message" style="display: none; color: #ff6b6b; margin-top: 0.5rem;"></div>
        <div class="password-prompt-buttons">
          <button class="password-submit-btn">Unlock</button>
          <button class="password-cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Get elements
    const input = modal.querySelector('.password-prompt-input');
    const submitBtn = modal.querySelector('.password-submit-btn');
    const cancelBtn = modal.querySelector('.password-cancel-btn');
    const errorMsg = modal.querySelector('.password-error-message');

    // Focus input
    setTimeout(() => input.focus(), 100);

    // Handle submit
    const handleSubmit = () => {
      const password = input.value;
      modal.remove();
      callback(password);
    };

    // Handle cancel
    const handleCancel = () => {
      modal.remove();
      callback(null);
    };

    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') handleCancel();
    });
  }

  // Show password error
  showPasswordError(message) {
    const modal = document.querySelector('.password-prompt-modal');
    if (modal) {
      const errorMsg = modal.querySelector('.password-error-message');
      if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
      }
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

  // Show error modal (for critical errors)
  showErrorModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
      <div class="error-modal-container">
        <div class="error-modal-title">⚠️ ${title}</div>
        <div class="error-modal-message">${message}</div>
        <button class="error-modal-btn">OK</button>
      </div>
    `;

    document.body.appendChild(modal);

    const btn = modal.querySelector('.error-modal-btn');
    btn.addEventListener('click', () => {
      modal.remove();
    });

    btn.focus();
  }

  // Render empty state
  renderEmptyState(title, message) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-message">${message}</div>
      </div>
    `;
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
    const assetSrc = image.assetId || image.assetPath; // Support both formats
    if (assetSrc) {
      html += `<img src="${assetSrc}" alt="${image.title}" class="image-display">`;
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
    const assetSrc = audio.assetId || audio.assetPath; // Support both formats
    if (assetSrc) {
      html += `<audio controls style="width: 100%; margin: 20px 0;">
        <source src="${assetSrc}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>`;
    } else {
      html += '<div class="audio-placeholder">Audio file not available</div>';
    }
    html += '</div>';

    html += '</div>';

    return html;
  }

  // Render calendar view
  renderCalendar(events, onSelectEvent) {
    let html = '<div class="calendar-view">';

    // Month header
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    html += `<div class="calendar-header">${monthName}</div>`;

    // Calendar grid
    html += '<div class="calendar-grid">';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Days
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);

      html += `<div class="calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}">
        <div class="calendar-day-number">${day}</div>`;

      if (dayEvents.length > 0) {
        dayEvents.forEach(event => {
          html += `<div class="calendar-event-dot" data-event-id="${event.id}" title="${event.title}">•</div>`;
        });
      }

      html += '</div>';
    }

    html += '</div>';

    // Events list
    if (events.length > 0) {
      html += '<div class="events-list">';
      html += '<div class="events-title">Events</div>';
      events.forEach(event => {
        html += `
          <div class="event-item" data-event-id="${event.id}">
            <div class="event-date">${event.date}</div>
            <div class="event-title">${event.title}</div>
            ${event.time ? `<div class="event-time">${event.time}</div>` : ''}
          </div>
        `;
      });
      html += '</div>';
    } else {
      html += '<div class="empty-calendar">No events available</div>';
    }

    html += '</div>';

    // Add event listeners after rendering
    setTimeout(() => {
      document.querySelectorAll('[data-event-id]').forEach(el => {
        el.addEventListener('click', () => {
          const eventId = el.getAttribute('data-event-id');
          onSelectEvent(eventId);
        });
        el.style.cursor = 'pointer';
      });
    }, 0);

    return html;
  }

  // Render event details
  renderEventDetails(event) {
    let html = '<div class="event-details">';

    html += `<div class="event-detail-title">${event.title}</div>`;

    if (event.date) {
      html += `<div class="event-detail-field"><strong>Date:</strong> ${event.date}</div>`;
    }

    if (event.time) {
      html += `<div class="event-detail-field"><strong>Time:</strong> ${event.time}</div>`;
    }

    if (event.location) {
      html += `<div class="event-detail-field"><strong>Location:</strong> ${event.location}</div>`;
    }

    if (event.description) {
      html += `<div class="event-detail-field event-description">${event.description}</div>`;
    }

    html += '<button class="event-back-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent-primary); color: #000; border: none; border-radius: 4px; cursor: pointer;">← Back to Calendar</button>';

    html += '</div>';

    // Add back button handler
    setTimeout(() => {
      const backBtn = document.querySelector('.event-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          const events = window.playerApp.getAvailableCalendarEvents();
          const content = window.playerApp.renderer.renderCalendar(events, (eventId) => {
            window.playerApp.showEventDetails(eventId);
          });
          const windowEl = document.querySelector('.window.focused');
          if (windowEl) {
            const windowId = windowEl.id.replace('window-', '');
            window.playerApp.renderer.updateWindowContent(windowId, content);
          }
        });
      }
    }, 0);

    return html;
  }

  // Enter fullscreen mode
  enterFullscreen() {
    const desktopScreen = document.getElementById('desktopScreen');
    if (!desktopScreen || this.isFullscreen) return;

    // Try to use Fullscreen API first
    if (document.fullscreenEnabled) {
      desktopScreen.requestFullscreen?.().catch(() => {
        // Fallback to CSS-based fullscreen
        document.body.classList.add('fullscreen');
        this.isFullscreen = true;
      }).then(() => {
        document.body.classList.add('fullscreen');
        this.isFullscreen = true;
      });
    } else {
      // Fallback to CSS-based fullscreen
      document.body.classList.add('fullscreen');
      this.isFullscreen = true;
    }
  }

  // Toggle fullscreen mode
  toggleFullscreen() {
    if (this.isFullscreen) {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
      document.body.classList.remove('fullscreen');
      this.isFullscreen = false;
    } else {
      // Enter fullscreen
      this.enterFullscreen();
    }
  }
}

// Global instance placeholder
let renderer = null;
