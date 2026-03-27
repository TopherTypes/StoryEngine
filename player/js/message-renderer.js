/**
 * StoryEngine Player - Message Renderer
 * Formats and renders conversation messages for display to the player
 */

class MessageRenderer {
  constructor(messages, story, globalSettings, gameState) {
    this.messages = messages;        // Parsed message objects
    this.story = story || {};
    this.globalSettings = globalSettings || {};
    this.gameState = gameState || {};
  }

  /**
   * Render messages as HTML for email or IM display
   * @param {string} type - 'email' or 'message' (for IM)
   * @returns {string} HTML string
   */
  renderConversation(type = 'message') {
    if (!this.messages || this.messages.length === 0) {
      return '<div class="conversation-empty">No messages</div>';
    }

    if (type === 'email') {
      return this._renderEmailThread();
    } else {
      return this._renderIMThread();
    }
  }

  /**
   * Render messages as an email thread
   * @private
   */
  _renderEmailThread() {
    const html = [];

    // Display emails in reverse chronological order (newest first)
    const sortedMessages = [...this.messages].reverse();

    sortedMessages.forEach((msg, index) => {
      const messageHtml = this._renderEmailMessage(msg, index);
      html.push(messageHtml);
    });

    return html.join('');
  }

  /**
   * Render a single email message
   * @private
   */
  _renderEmailMessage(msg, index) {
    const fromName = msg.isFromPlayer
      ? this.globalSettings.playerProfile?.name || 'You'
      : msg.senderName;

    const fromEmail = msg.isFromPlayer
      ? this.globalSettings.playerProfile?.email || ''
      : msg.senderEmail || '';

    const headerHtml = `
      <div class="email-header">
        <div class="email-from">
          <strong>From:</strong> ${this._escapeHtml(fromName)}${fromEmail ? ` &lt;${this._escapeHtml(fromEmail)}&gt;` : ''}
        </div>
        ${msg.timestamp ? `<div class="email-date">${this._formatTime(msg.timestamp)}</div>` : ''}
        ${msg.subject ? `<div class="email-subject"><strong>Subject:</strong> ${this._escapeHtml(msg.subject)}</div>` : ''}
      </div>
    `;

    const bodyHtml = `
      <div class="email-body">
        ${this._formatMessageContent(msg.content)}
      </div>
    `;

    const statusClass = msg.status === 'unread' ? 'unread' : 'read';
    const emailDiv = `
      <div class="email-message ${statusClass}">
        ${headerHtml}
        ${bodyHtml}
      </div>
    `;

    // Add email chain divider between emails
    if (index < this.messages.length - 1) {
      return emailDiv + '<div class="email-divider">━━━━━━━━━━━━</div>';
    }

    return emailDiv;
  }

  /**
   * Render messages as an IM conversation thread
   * @private
   */
  _renderIMThread() {
    const html = [];

    this.messages.forEach((msg) => {
      const messageHtml = this._renderIMMessage(msg);
      html.push(messageHtml);
    });

    return html.join('');
  }

  /**
   * Render a single IM message with chat bubble styling
   * @private
   */
  _renderIMMessage(msg) {
    const isFromPlayer = msg.isFromPlayer;
    const senderName = isFromPlayer
      ? this.globalSettings.playerProfile?.name || 'You'
      : msg.senderName;

    // Get sender's avatar
    const avatarHtml = this._getAvatarHtml(msg);

    const timeHtml = msg.timestamp
      ? `<span class="msg-time">${this._formatTime(msg.timestamp)}</span>`
      : '';

    const statusClass = msg.status === 'unread' ? 'unread' : 'read';

    const messageDiv = `
      <div class="im-message ${isFromPlayer ? 'from-player' : 'from-other'}">
        <div class="msg-info">
          ${avatarHtml}
          <div class="msg-header">
            <span class="msg-sender">${this._escapeHtml(senderName)}</span>
            ${timeHtml}
          </div>
        </div>
        <div class="msg-bubble ${statusClass}">
          ${this._formatMessageContent(msg.content)}
        </div>
      </div>
    `;

    return messageDiv;
  }

  /**
   * Format message content for display (handle line breaks, etc.)
   * @private
   */
  _formatMessageContent(content) {
    if (!content) return '';

    return this._escapeHtml(content)
      .replace(/\n/g, '<br>');
  }

  /**
   * Get HTML for avatar display
   * @private
   */
  _getAvatarHtml(msg) {
    const participant = msg.isFromPlayer
      ? null
      : this.story.imParticipants?.find(p => p.id === msg.senderId);

    if (!participant) {
      // Player avatar or default
      const name = msg.isFromPlayer
        ? (this.globalSettings.playerProfile?.name || 'P')
        : (msg.senderName || 'A');

      const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return `<div class="avatar avatar-initials">${initials}</div>`;
    }

    // Use participant's profile picture if available
    if (participant.profilePicture) {
      return `<img src="${participant.profilePicture}" class="avatar avatar-image" alt="${this._escapeHtml(participant.displayName)}">`;
    }

    // Generate avatar color from name
    const initials = participant.displayName
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const color = this._generateAvatarColor(participant.displayName);

    return `<div class="avatar avatar-initials" style="background-color: ${color};">${initials}</div>`;
  }

  /**
   * Generate consistent avatar color from name
   * @private
   */
  _generateAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  /**
   * Format timestamp for display
   * @private
   */
  _formatTime(timestamp) {
    if (!timestamp) return '';

    const currentMinutes = this.gameState.elapsedMinutes || 0;
    const storyStart = this.globalSettings.storyStartDateTime || '';

    if (!storyStart) {
      // Fallback to just showing the timestamp
      return timestamp;
    }

    // Calculate if message is within last hour
    const messageMinutes = this._calculateMinutesFromStart(storyStart, timestamp);
    if (messageMinutes === null) {
      return timestamp;
    }

    const minutesSinceMessage = currentMinutes - messageMinutes;

    // If within 1 hour, show relative time
    if (minutesSinceMessage >= 0 && minutesSinceMessage <= 60) {
      if (minutesSinceMessage === 0) {
        return 'now';
      }
      return `${Math.round(minutesSinceMessage)} min ago`;
    }

    // Otherwise show absolute time
    return this._formatAbsoluteTime(timestamp);
  }

  /**
   * Calculate minutes from game start to a timestamp
   * @private
   */
  _calculateMinutesFromStart(storyStartDateTime, targetDateTime) {
    if (!storyStartDateTime || !targetDateTime) return null;

    try {
      // Normalize target datetime if it's just a time
      let fullTargetDateTime = targetDateTime;
      if (targetDateTime && !targetDateTime.includes('-')) {
        // Just a time like "12:28", combine with game start date
        const startDate = this._parseDateTime(storyStartDateTime);
        if (startDate) {
          const pad = (n) => String(n).padStart(2, '0');
          const year = startDate.getFullYear();
          const month = pad(startDate.getMonth() + 1);
          const day = pad(startDate.getDate());
          fullTargetDateTime = `${year}-${month}-${day} ${targetDateTime}`;
        }
      }

      const startDate = this._parseDateTime(storyStartDateTime);
      const targetDate = this._parseDateTime(fullTargetDateTime);

      if (!startDate || !targetDate) return null;

      const deltaMs = targetDate - startDate;
      return Math.floor(deltaMs / (1000 * 60));
    } catch (e) {
      console.error('Error calculating time delta:', e);
      return null;
    }
  }

  /**
   * Parse datetime string
   * @private
   */
  _parseDateTime(dateTimeString) {
    if (!dateTimeString) return null;

    // Try parsing with space separator
    const date = new Date(dateTimeString.replace(' ', 'T') + ':00Z');
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Format absolute time for display
   * @private
   */
  _formatAbsoluteTime(timestamp) {
    // Try to parse as time or full datetime
    if (timestamp.includes(':')) {
      // Extract just the time portion
      const timePart = timestamp.includes(' ')
        ? timestamp.split(' ')[1]
        : timestamp;

      // Format as HH:MM
      return timePart.slice(0, 5);
    }

    return timestamp;
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Inject CSS styles for message display
   */
  static injectStyles() {
    const styleId = 'message-renderer-styles';
    if (document.getElementById(styleId)) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .conversation-empty {
        text-align: center;
        color: var(--text-secondary);
        padding: 40px 20px;
        font-style: italic;
      }

      /* Email Styles */
      .email-message {
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 12px;
        background: var(--bg-secondary);
      }

      .email-message.unread {
        background: var(--bg-primary);
        border-color: var(--terminal-green);
      }

      .email-message.read {
        background: var(--bg-secondary);
      }

      .email-header {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
        font-size: 12px;
      }

      .email-from {
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .email-date {
        color: var(--text-secondary);
        font-size: 11px;
        margin-bottom: 4px;
      }

      .email-subject {
        color: var(--text-primary);
        font-weight: bold;
        margin-top: 8px;
      }

      .email-body {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 13px;
        line-height: 1.5;
        color: var(--text-primary);
      }

      .email-divider {
        text-align: center;
        color: var(--border-color);
        margin: 16px 0;
        font-size: 10px;
      }

      /* IM Styles */
      .im-message {
        display: flex;
        margin-bottom: 12px;
        align-items: flex-end;
        gap: 8px;
      }

      .im-message.from-player {
        flex-direction: row-reverse;
      }

      .msg-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .im-message.from-player .msg-info {
        align-items: center;
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 11px;
        flex-shrink: 0;
      }

      .avatar-initials {
        background: hsl(200, 70%, 60%);
        color: white;
      }

      .avatar-image {
        object-fit: cover;
        border: 1px solid var(--border-color);
      }

      .msg-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        font-size: 11px;
      }

      .im-message.from-player .msg-header {
        align-items: flex-end;
      }

      .msg-sender {
        font-weight: bold;
        color: var(--text-primary);
      }

      .msg-time {
        color: var(--text-secondary);
        font-size: 10px;
      }

      .msg-bubble {
        max-width: 60%;
        padding: 8px 12px;
        border-radius: 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        word-wrap: break-word;
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.4;
        color: var(--text-primary);
      }

      .im-message.from-player .msg-bubble {
        background: var(--terminal-green);
        color: #000;
        border-color: var(--terminal-green);
      }

      .msg-bubble.unread {
        font-weight: bold;
        border-width: 2px;
      }

      @media (max-width: 768px) {
        .msg-bubble {
          max-width: 80%;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
