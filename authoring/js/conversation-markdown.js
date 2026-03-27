/**
 * StoryEngine Conversation Markdown Utilities
 * Handles parsing, validation, and formatting of conversation markdown
 * Supports both IM and Email conversation formats
 */

const ConversationMarkdown = {
  // Regex patterns for parsing markdown
  PATTERNS: {
    // Sender message: [ALICE (alice@example.com) => 12/03/2026 12:22 | unread] Message
    // or for IM: [JAMES => 12/03/2026 12:22 | unread] Message
    senderMessage: /^\[([^\]]+?)\s*=>\s*([^\]|]+?)\s*\|\s*([^\]]+?)\]\s*(.*)$/,

    // Player message: [<= 12:22 | unread] Response
    playerMessage: /^\[<=\s*([^\]|]+?)\s*\|\s*([^\]]+?)\]\s*(.*)$/,

    // Alternative player message without status: [<= 12:22] Response
    playerMessageNoStatus: /^\[<=\s*([^\]]+?)\]\s*(.*)$/,

    // Email subject line: Subject: Topic
    emailSubject: /^Subject:\s*(.*)$/,

    // Email chain divider: --- On DATE, SENDER wrote:
    emailChainDivider: /^---\s*On\s+(.+?),\s+(.+?)\s+wrote:\s*$/,

    // Extract name and email from sender: ALICE (alice@example.com)
    senderWithEmail: /^([^\(]+?)\s*\(([^\)]+?)\)$/
  },

  /**
   * Validate markdown syntax for a conversation
   * @param {string} markdown - The markdown content
   * @param {string} type - 'email' or 'message'
   * @returns {array} Array of validation issues: { line, type, message }
   */
  validateMarkdown(markdown, type = 'message') {
    const issues = [];
    const lines = markdown.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Skip empty lines
      if (!line.trim()) {
        return;
      }

      // Check for valid line format
      const isSenderMessage = this.PATTERNS.senderMessage.test(line);
      const isPlayerMessage = this.PATTERNS.playerMessage.test(line) ||
                              this.PATTERNS.playerMessageNoStatus.test(line);
      const isSubject = this.PATTERNS.emailSubject.test(line);
      const isChainDivider = this.PATTERNS.emailChainDivider.test(line);

      if (!isSenderMessage && !isPlayerMessage && !isSubject && !isChainDivider) {
        // Only flag as error if it doesn't look like message content
        if (line.match(/^\[/) && line.includes(']')) {
          issues.push({
            line: lineNum,
            type: 'error',
            message: 'Invalid message format. Use [SENDER => TIME | STATUS] Message or [<= TIME | STATUS] Message'
          });
        }
      }

      // For sender messages, validate format
      if (isSenderMessage) {
        const match = line.match(this.PATTERNS.senderMessage);
        if (match) {
          const [, sender, timestamp, status] = match;

          // Validate status values
          const validStatuses = ['sent', 'delivered', 'read', 'unread'];
          if (!validStatuses.includes(status.toLowerCase())) {
            issues.push({
              line: lineNum,
              type: 'warning',
              message: `Status "${status}" may not be recognized. Use: sent, delivered, read, unread`
            });
          }

          // If email format with email, validate it's somewhat email-like
          if (sender.includes('(') && sender.includes(')')) {
            const emailMatch = sender.match(this.PATTERNS.senderWithEmail);
            if (!emailMatch) {
              issues.push({
                line: lineNum,
                type: 'warning',
                message: 'Email format appears invalid. Use: NAME (email@address.com)'
              });
            }
          }
        }
      }

      // For email chains, validate divider format
      if (isChainDivider) {
        const match = line.match(this.PATTERNS.emailChainDivider);
        if (!match) {
          issues.push({
            line: lineNum,
            type: 'error',
            message: 'Invalid email chain divider. Use: --- On DATE, SENDER wrote:'
          });
        }
      }
    });

    return issues;
  },

  /**
   * Extract all participant/sender mentions from markdown
   * @param {string} markdown - The markdown content
   * @returns {array} Array of participants: { name, email (optional) }
   */
  extractParticipants(markdown) {
    const participants = new Map(); // Use map to deduplicate by email or name
    const lines = markdown.split('\n');

    lines.forEach(line => {
      // Check sender messages
      const senderMatch = line.match(this.PATTERNS.senderMessage);
      if (senderMatch) {
        const sender = senderMatch[1].trim();
        const emailMatch = sender.match(this.PATTERNS.senderWithEmail);

        if (emailMatch) {
          const [, name, email] = emailMatch;
          participants.set(email, {
            name: name.trim(),
            email: email.trim()
          });
        } else {
          // No email, just name
          if (!participants.has(sender)) {
            participants.set(sender, {
              name: sender,
              email: null
            });
          }
        }
      }

      // Check email chain dividers
      const chainMatch = line.match(this.PATTERNS.emailChainDivider);
      if (chainMatch) {
        const [, date, sender] = chainMatch;
        const emailMatch = sender.match(this.PATTERNS.senderWithEmail);

        if (emailMatch) {
          const [, name, email] = emailMatch;
          participants.set(email, {
            name: name.trim(),
            email: email.trim()
          });
        } else {
          if (!participants.has(sender.trim())) {
            participants.set(sender.trim(), {
              name: sender.trim(),
              email: null
            });
          }
        }
      }
    });

    return Array.from(participants.values());
  },

  /**
   * Parse markdown to structured message objects
   * @param {string} markdown - The markdown content
   * @param {string} type - 'email' or 'message'
   * @param {object} playerProfile - { name, email }
   * @returns {array} Array of message objects
   */
  parseMarkdown(markdown, type = 'message', playerProfile = {}) {
    const messages = [];
    const lines = markdown.split('\n');
    let currentSubject = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for subject line (email format)
      if (this.PATTERNS.emailSubject.test(line)) {
        currentSubject = line.match(this.PATTERNS.emailSubject)[1];
        i++;
        continue;
      }

      // Check for sender message
      const senderMatch = line.match(this.PATTERNS.senderMessage);
      if (senderMatch) {
        const [, sender, timestamp, status, firstLine] = senderMatch;
        const senderData = this._parseSenderName(sender);

        // Collect message body (may span multiple lines until next message)
        let body = firstLine;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (this.PATTERNS.senderMessage.test(nextLine) ||
              this.PATTERNS.playerMessage.test(nextLine) ||
              this.PATTERNS.playerMessageNoStatus.test(nextLine) ||
              this.PATTERNS.emailChainDivider.test(nextLine) ||
              this.PATTERNS.emailSubject.test(nextLine)) {
            break;
          }
          body += '\n' + nextLine;
          i++;
        }

        messages.push({
          senderName: senderData.name,
          senderEmail: senderData.email,
          timestamp: timestamp.trim(),
          status: status.toLowerCase(),
          content: body.trim(),
          isFromPlayer: false,
          subject: currentSubject
        });
        continue;
      }

      // Check for player message
      const playerMatch = line.match(this.PATTERNS.playerMessage);
      if (playerMatch) {
        const [, timestamp, status, firstLine] = playerMatch;

        // Collect message body
        let body = firstLine;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (this.PATTERNS.senderMessage.test(nextLine) ||
              this.PATTERNS.playerMessage.test(nextLine) ||
              this.PATTERNS.playerMessageNoStatus.test(nextLine) ||
              this.PATTERNS.emailChainDivider.test(nextLine) ||
              this.PATTERNS.emailSubject.test(nextLine)) {
            break;
          }
          body += '\n' + nextLine;
          i++;
        }

        messages.push({
          senderName: playerProfile.name || 'Player',
          senderEmail: playerProfile.email,
          timestamp: timestamp.trim(),
          status: status.toLowerCase(),
          content: body.trim(),
          isFromPlayer: true,
          subject: currentSubject
        });
        continue;
      }

      // Check for email chain divider
      if (this.PATTERNS.emailChainDivider.test(line)) {
        const match = line.match(this.PATTERNS.emailChainDivider);
        if (match) {
          const [, date, sender] = match;
          // Just note it, don't create a message for it
          i++;
          continue;
        }
      }

      i++;
    }

    return messages;
  },

  /**
   * Helper to parse sender name and email
   * @private
   */
  _parseSenderName(sender) {
    const match = sender.match(this.PATTERNS.senderWithEmail);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim()
      };
    }
    return {
      name: sender.trim(),
      email: null
    };
  },

  /**
   * Format conversation markdown for display
   * Makes it pretty for the preview
   * @param {string} markdown - Raw markdown
   * @returns {string} Formatted markdown
   */
  formatMarkdown(markdown) {
    const lines = markdown.split('\n');
    const formatted = [];

    let lastWasMessage = false;

    for (const line of lines) {
      if (this.PATTERNS.senderMessage.test(line) ||
          this.PATTERNS.playerMessage.test(line) ||
          this.PATTERNS.playerMessageNoStatus.test(line) ||
          this.PATTERNS.emailSubject.test(line)) {

        // Add spacing before message lines for readability
        if (lastWasMessage && formatted.length > 0) {
          // Don't add double spacing
        }
        formatted.push(line);
        lastWasMessage = true;
      } else if (line.trim()) {
        formatted.push(line);
        lastWasMessage = false;
      } else {
        // Preserve empty lines but skip consecutive ones
        if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
          formatted.push('');
        }
      }
    }

    return formatted.join('\n').trim();
  },

  /**
   * Get earliest timestamp from conversation
   * @param {string} markdown - The markdown content
   * @returns {string} Earliest timestamp or empty string
   */
  getEarliestTimestamp(markdown) {
    const messages = this.parseMarkdown(markdown);
    if (messages.length === 0) return '';

    // Find message with earliest timestamp
    // This is a simplified version - in real implementation would parse times properly
    return messages[0].timestamp;
  },

  /**
   * Check if markdown uses email chain format
   * @param {string} markdown - The markdown content
   * @returns {boolean} True if contains email chain dividers or subjects
   */
  isEmailChainFormat(markdown) {
    return this.PATTERNS.emailChainDivider.test(markdown) ||
           this.PATTERNS.emailSubject.test(markdown);
  }
};
