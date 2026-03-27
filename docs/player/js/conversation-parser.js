/**
 * StoryEngine Conversation Parser
 * Converts markdown conversation format to structured message objects
 * Used by the player to display emails and IM conversations
 */

class ConversationParser {
  constructor(artefact, story, globalSettings = {}) {
    this.artefact = artefact;
    this.story = story;
    this.globalSettings = globalSettings || {};
    this.messages = [];
  }

  /**
   * Parse markdown content to message array
   * Handles both email chains and IM formats
   * @returns {array} Array of message objects
   */
  parseMarkdown() {
    if (!this.artefact.markdownContent) {
      return [];
    }

    const lines = this.artefact.markdownContent.split('\n');
    const messages = [];
    let currentSubject = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for subject line (email format)
      if (this._isSubjectLine(line)) {
        currentSubject = line.match(/^Subject:\s*(.*)$/)[1];
        i++;
        continue;
      }

      // Check for sender message
      const senderMatch = line.match(this._getSenderMessagePattern());
      if (senderMatch) {
        const [, senderStr, timestamp, status, firstLine] = senderMatch;

        // Collect message body
        let body = firstLine;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (this._isMessageStart(nextLine)) {
            break;
          }
          body += '\n' + nextLine;
          i++;
        }

        const message = this._createMessageObject({
          senderStr,
          timestamp,
          status,
          body: body.trim(),
          isFromPlayer: false,
          subject: currentSubject
        });

        if (message) {
          messages.push(message);
        }
        continue;
      }

      // Check for player message
      const playerMatch = line.match(this._getPlayerMessagePattern());
      if (playerMatch) {
        const patternWithStatus = playerMatch[0].match(/^\[<=\s*([^\]|]+?)\s*\|\s*([^\]]+?)\]/);
        let timestamp, status, firstLine;

        if (patternWithStatus) {
          [, timestamp, status] = patternWithStatus;
          firstLine = line.substring(patternWithStatus[0].length).trim();
        } else {
          const patternNoStatus = line.match(/^\[<=\s*([^\]]+?)\]\s*(.*)/);
          [, timestamp, firstLine] = patternNoStatus || [];
          status = 'unread';
        }

        // Collect message body
        let body = firstLine;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (this._isMessageStart(nextLine)) {
            break;
          }
          body += '\n' + nextLine;
          i++;
        }

        const message = this._createMessageObject({
          senderStr: null,
          timestamp,
          status,
          body: body.trim(),
          isFromPlayer: true,
          subject: currentSubject
        });

        if (message) {
          messages.push(message);
        }
        continue;
      }

      // Check for email chain divider
      if (this._isChainDivider(line)) {
        i++;
        continue;
      }

      i++;
    }

    this.messages = messages;
    return messages;
  },

  /**
   * Get resolved sender information
   * Looks up participant/sender by name or email
   * @private
   */
  _resolveSender(senderStr) {
    if (!senderStr) {
      // Return player profile
      return {
        name: this.globalSettings.playerProfile?.name || 'Player',
        email: this.globalSettings.playerProfile?.email || '',
        id: 'player'
      };
    }

    // Parse sender string: "NAME (email@address.com)" or just "NAME"
    const withEmailMatch = senderStr.match(/^([^\(]+?)\s*\(([^\)]+?)\)$/);
    let name, email;

    if (withEmailMatch) {
      name = withEmailMatch[1].trim();
      email = withEmailMatch[2].trim();
    } else {
      name = senderStr.trim();
      email = null;
    }

    // Look up in email senders or IM participants
    if (email) {
      const sender = this.story.emailSenders?.find(s => s.email === email);
      if (sender) {
        return {
          name: sender.name,
          email: sender.email,
          id: sender.id
        };
      }
    }

    // Look up by name
    const sender = this.story.emailSenders?.find(s => s.name === name);
    if (sender) {
      return {
        name: sender.name,
        email: sender.email,
        id: sender.id
      };
    }

    const participant = this.story.imParticipants?.find(p => p.displayName === name);
    if (participant) {
      return {
        name: participant.displayName,
        email: null,
        id: participant.id
      };
    }

    // If not found, return as-is (will be auto-created on save)
    return {
      name: name,
      email: email,
      id: null
    };
  },

  /**
   * Create a message object from parsed data
   * @private
   */
  _createMessageObject({ senderStr, timestamp, status, body, isFromPlayer, subject }) {
    const sender = isFromPlayer ? this._resolveSender(null) : this._resolveSender(senderStr);

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderName: sender.name,
      senderEmail: sender.email,
      senderId: sender.id,
      timestamp: timestamp?.trim() || '',
      status: (status?.toLowerCase() || 'unread'),
      content: body,
      isFromPlayer: isFromPlayer,
      subject: subject || ''
    };
  },

  /**
   * Check if a line is a subject line
   * @private
   */
  _isSubjectLine(line) {
    return /^Subject:\s*(.*)$/.test(line);
  },

  /**
   * Check if a line is the start of a message (sender or player)
   * @private
   */
  _isMessageStart(line) {
    return this._getSenderMessagePattern().test(line) ||
           this._getPlayerMessagePattern().test(line) ||
           this._isChainDivider(line) ||
           this._isSubjectLine(line);
  },

  /**
   * Check if a line is an email chain divider
   * @private
   */
  _isChainDivider(line) {
    return /^---\s*On\s+(.+?),\s+(.+?)\s+wrote:\s*$/.test(line);
  },

  /**
   * Get regex pattern for sender messages
   * @private
   */
  _getSenderMessagePattern() {
    return /^\[([^\]]+?)\s*=>\s*([^\]|]+?)\s*\|\s*([^\]]+?)\]\s*(.*)$/;
  },

  /**
   * Get regex pattern for player messages
   * @private
   */
  _getPlayerMessagePattern() {
    return /^\[<=\s*([^\]]*?)\s*(?:\|\s*([^\]]*?))?\]\s*(.*)$/;
  },

  /**
   * Get all messages (call parseMarkdown first)
   * @returns {array}
   */
  getMessages() {
    return this.messages;
  },

  /**
   * Get message visibility state based on game time
   * @param {number} currentGameTime - Current elapsed minutes
   * @returns {array} Messages with added 'visible' and 'unread' properties
   */
  getMessageStates(currentGameTime = 0) {
    const storyStartTime = this.globalSettings.storyStartDateTime || '';

    return this.messages.map(msg => {
      // Determine visibility based on reveal time
      let visible = true;

      if (this.artefact.revealTime && storyStartTime) {
        // Calculate when this artefact should be revealed
        const revealMinutes = this._calculateMinutesFromStart(storyStartTime, this.artefact.revealTime);
        visible = revealMinutes !== null && currentGameTime >= revealMinutes;
      } else if (this.artefact.releaseAtTime !== undefined) {
        // Fallback to old releaseAtTime field
        visible = currentGameTime >= this.artefact.releaseAtTime;
      }

      // Determine read status
      const unread = msg.status === 'unread' && visible;

      return {
        ...msg,
        visible,
        unread
      };
    });
  },

  /**
   * Calculate minutes from game start to a timestamp
   * @private
   */
  _calculateMinutesFromStart(storyStartDateTime, targetDateTime) {
    if (!storyStartDateTime || !targetDateTime) return null;

    try {
      const startDate = this._parseDateTime(storyStartDateTime);
      const targetDate = this._parseDateTime(targetDateTime);

      if (!startDate || !targetDate) return null;

      const deltaMs = targetDate - startDate;
      return Math.floor(deltaMs / (1000 * 60));
    } catch (e) {
      console.error('Error calculating time delta:', e);
      return null;
    }
  },

  /**
   * Parse date/time string
   * @private
   */
  _parseDateTime(dateTimeString) {
    if (!dateTimeString) return null;

    // Try parsing with space separator
    const date = new Date(dateTimeString.replace(' ', 'T') + ':00Z');
    return isNaN(date.getTime()) ? null : date;
  }
}
