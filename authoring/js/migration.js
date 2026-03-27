/**
 * StoryEngine Migration Utilities
 * Handles converting old single-message artefact format to new markdown-based conversations
 */

const Migration = {
  /**
   * Upgrade a story from old format to new format
   * Detects old email/message artefacts and converts them to new markdown format
   * @param {object} story - The story to upgrade
   * @returns {object} Upgraded story
   */
  upgradeStory(story) {
    if (!story) return story;

    // Check if already upgraded (has globalSettings)
    if (story.globalSettings) {
      return story; // Already in new format
    }

    console.log('[Migration] Starting story upgrade...');

    // Add globalSettings if missing
    if (!story.globalSettings) {
      story.globalSettings = {
        storyStartDateTime: story.calendarStartDate || '',
        timeZone: 'UTC',
        playerProfile: {
          name: 'Player',
          email: 'player@email.com'
        }
      };
      console.log('[Migration] Added globalSettings');
    }

    // Group email artefacts by thread
    const emailsByThread = {};
    const convertedEmails = [];

    story.artefacts = story.artefacts.filter(artefact => {
      if (artefact.type === 'email' && !artefact.markdownContent) {
        // Old email format
        if (!emailsByThread[artefact.threadId]) {
          emailsByThread[artefact.threadId] = [];
        }
        emailsByThread[artefact.threadId].push(artefact);
        return false; // Remove from artefacts (will add converted version)
      }
      return true;
    });

    // Convert grouped emails to new markdown format
    Object.entries(emailsByThread).forEach(([threadId, emails]) => {
      const converted = this._convertEmailThreadToMarkdown(emails, story);
      if (converted) {
        convertedEmails.push(converted);
      }
    });

    // Add converted emails back to artefacts
    story.artefacts = [...story.artefacts, ...convertedEmails];

    // Group message artefacts by conversation
    const messagesByConversation = {};
    const convertedMessages = [];

    story.artefacts = story.artefacts.filter(artefact => {
      if (artefact.type === 'message' && !artefact.markdownContent) {
        // Old message format
        if (!messagesByConversation[artefact.conversationId]) {
          messagesByConversation[artefact.conversationId] = [];
        }
        messagesByConversation[artefact.conversationId].push(artefact);
        return false; // Remove from artefacts (will add converted version)
      }
      return true;
    });

    // Convert grouped messages to new markdown format
    Object.entries(messagesByConversation).forEach(([conversationId, messages]) => {
      const converted = this._convertMessagesToMarkdown(messages, story);
      if (converted) {
        convertedMessages.push(converted);
      }
    });

    // Add converted messages back to artefacts
    story.artefacts = [...story.artefacts, ...convertedMessages];

    console.log('[Migration] Story upgrade complete');
    console.log('[Migration] Converted', convertedEmails.length, 'email threads and', convertedMessages.length, 'conversations');

    return story;
  },

  /**
   * Convert a group of old email artefacts to a single new-format email artefact
   * @private
   */
  _convertEmailThreadToMarkdown(emails, story) {
    if (!emails || emails.length === 0) return null;

    // Sort emails chronologically
    const sorted = [...emails].sort((a, b) => {
      const timeA = a.timestamp || '';
      const timeB = b.timestamp || '';
      return timeA < timeB ? -1 : 1;
    });

    // Build markdown content
    let markdown = '';
    const subjects = new Set();

    sorted.forEach((email, index) => {
      const sender = story.emailSenders.find(s => s.id === email.senderId);
      const senderName = sender ? sender.name : (email.senderId || 'Unknown');
      const senderEmail = sender ? sender.email : '';

      // Add subject if different from previous
      if (email.subject && !subjects.has(email.subject)) {
        markdown += `Subject: ${email.subject}\n`;
        subjects.add(email.subject);
      }

      // Add message header
      if (senderEmail) {
        markdown += `[${senderName} (${senderEmail}) => ${email.timestamp || '00:00'} | read]\n`;
      } else {
        markdown += `[${senderName} => ${email.timestamp || '00:00'} | read]\n`;
      }

      // Add message body
      markdown += `${email.body}\n\n`;
    });

    // Create new email artefact
    const baseEmail = emails[emails.length - 1]; // Use latest email as base
    const newArtefact = {
      id: State.generateId(),
      type: 'email',
      title: `Email Thread: ${baseEmail.subject || baseEmail.threadId}`,
      visibleTitle: baseEmail.subject || `Thread ${baseEmail.threadId.substring(0, 8)}`,
      markdownContent: markdown.trim(),
      revealTime: baseEmail.timestamp || '',
      releaseAtTime: baseEmail.releaseAtTime || 0,
      threadId: baseEmail.threadId || '',
      releaseTriggers: baseEmail.releaseTriggers || [],
      locked: baseEmail.locked || false,
      lockPassword: baseEmail.lockPassword || '',
      lockHint: baseEmail.lockHint || '',
      tags: baseEmail.tags || [],
      notes: `[Migrated from ${emails.length} individual email artefacts]`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isUpgraded: true
    };

    return newArtefact;
  },

  /**
   * Convert a group of old message artefacts to a single new-format message artefact
   * @private
   */
  _convertMessagesToMarkdown(messages, story) {
    if (!messages || messages.length === 0) return null;

    // Sort by displayOrder
    const sorted = [...messages].sort((a, b) => a.displayOrder - b.displayOrder);

    // Build markdown content
    let markdown = '';

    sorted.forEach((msg) => {
      if (msg.senderIsPlayer) {
        // Message from player
        markdown += `[<= ${msg.timestamp || '00:00'} | ${msg.body.length > 0 ? 'read' : 'sent'}] ${msg.body}\n\n`;
      } else {
        // Message from participant
        const participant = story.imParticipants.find(p => p.id === msg.participantId);
        const participantName = participant ? participant.displayName : msg.participantId;
        markdown += `[${participantName} => ${msg.timestamp || '00:00'} | ${msg.body.length > 0 ? 'read' : 'sent'}] ${msg.body}\n\n`;
      }
    });

    // Determine title
    const firstMsg = sorted[0];
    const participant = story.imParticipants.find(p => p.id === firstMsg.participantId);
    const participantName = participant ? participant.displayName : 'Unknown';
    const title = `Conversation: ${participantName}`;

    // Create new message artefact
    const newArtefact = {
      id: State.generateId(),
      type: 'message',
      title: title,
      visibleTitle: participantName,
      markdownContent: markdown.trim(),
      revealTime: firstMsg.timestamp || '',
      releaseAtTime: firstMsg.releaseAtTime || 0,
      conversationId: firstMsg.conversationId || '',
      releaseTriggers: firstMsg.releaseTriggers || [],
      locked: firstMsg.locked || false,
      lockPassword: firstMsg.lockPassword || '',
      lockHint: firstMsg.lockHint || '',
      tags: firstMsg.tags || [],
      notes: `[Migrated from ${messages.length} individual message artefacts]`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isUpgraded: true
    };

    return newArtefact;
  },

  /**
   * Initialize global settings from story metadata if not present
   * @param {object} story - The story to initialize
   */
  initializeGlobalSettings(story) {
    if (!story.globalSettings) {
      story.globalSettings = {
        storyStartDateTime: story.calendarStartDate || '',
        timeZone: 'UTC',
        playerProfile: {
          name: 'Player',
          email: 'player@email.com'
        }
      };
    }

    // Ensure all properties exist
    if (!story.globalSettings.storyStartDateTime) {
      story.globalSettings.storyStartDateTime = '';
    }
    if (!story.globalSettings.timeZone) {
      story.globalSettings.timeZone = 'UTC';
    }
    if (!story.globalSettings.playerProfile) {
      story.globalSettings.playerProfile = {
        name: 'Player',
        email: 'player@email.com'
      };
    }
    if (!story.globalSettings.playerProfile.name) {
      story.globalSettings.playerProfile.name = 'Player';
    }
    if (!story.globalSettings.playerProfile.email) {
      story.globalSettings.playerProfile.email = 'player@email.com';
    }
  }
};
