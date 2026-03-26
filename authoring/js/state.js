/**
 * StoryEngine Authoring Tool - State Management
 * Handles story data structure and localStorage persistence
 */

const State = {
  // Default/new story template
  getDefaultStory() {
    return {
      id: this.generateId(),
      title: 'New Story',
      author: '',
      description: '',
      version: '1.0',
      tags: '',
      theme: 'retro-dark',
      wallpaper: '',

      // Login configuration
      loginRequired: false,
      loginMessage: '',
      loginUsername: 'player',
      loginPassword: '',

      // Ending configuration
      ending: {
        title: 'The End',
        body: '',
        triggerConditions: [
          { type: 'time', value: '60' }
        ],
        allowContinueAfter: false
      },

      // World entities
      emailSenders: [],
      emailThreads: [],
      imParticipants: [],
      imConversations: [],
      folders: [],
      calendarOwner: '',
      calendarStartDate: '',

      // Story content
      artefacts: [],

      // Metadata
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  },

  // Generate unique IDs
  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Load story from localStorage
  loadStory(storyId = null) {
    const storageKey = storyId ? `story_${storyId}` : 'story_current';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsedStory = JSON.parse(stored);
        // Merge with default story to fill in any missing properties (backward compatibility)
        return {
          ...this.getDefaultStory(),
          ...parsedStory
        };
      } catch (e) {
        console.error('Failed to parse stored story:', e);
        return this.getDefaultStory();
      }
    }

    return this.getDefaultStory();
  },

  // Save story to localStorage
  saveStory(story) {
    const storageKey = `story_${story.id}`;
    story.lastModified = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(story));
    localStorage.setItem('story_current', JSON.stringify(story));
    localStorage.setItem('story_current_id', story.id);
    return true;
  },

  // Create new artefact with defaults
  createArtefact(type = 'email') {
    const baseArtefact = {
      id: this.generateId(),
      type: type,
      title: 'Untitled',
      visibleTitle: 'Untitled',
      releaseAtTime: 0,
      releaseTriggers: [],
      locked: false,
      lockPassword: '',
      lockHint: '',
      tags: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    // Type-specific fields
    switch (type) {
      case 'email':
        return {
          ...baseArtefact,
          senderId: '',
          subject: '',
          recipients: [],
          threadId: '',
          body: ''
        };

      case 'message':
        return {
          ...baseArtefact,
          participantId: '',
          conversationId: '',
          senderIsPlayer: false,
          body: '',
          displayOrder: 0
        };

      case 'calendar':
        return {
          ...baseArtefact,
          date: '',
          time: '',
          description: '',
          attendees: []
        };

      case 'document':
        return {
          ...baseArtefact,
          folderId: '',
          content: '',
          assetPath: ''
        };

      case 'image':
        return {
          ...baseArtefact,
          folderId: '',
          assetPath: '',
          caption: ''
        };

      case 'audio':
        return {
          ...baseArtefact,
          assetPath: '',
          duration: 0,
          description: ''
        };

      default:
        return baseArtefact;
    }
  },

  // Update artefact in story
  updateArtefact(story, artefactId, updates) {
    const index = story.artefacts.findIndex(a => a.id === artefactId);
    if (index !== -1) {
      story.artefacts[index] = {
        ...story.artefacts[index],
        ...updates,
        modified: new Date().toISOString()
      };
      return true;
    }
    return false;
  },

  // Delete artefact from story
  deleteArtefact(story, artefactId) {
    const index = story.artefacts.findIndex(a => a.id === artefactId);
    if (index !== -1) {
      story.artefacts.splice(index, 1);
      return true;
    }
    return false;
  },

  // Get artefacts sorted by release time
  getArtefactsByTime(story) {
    return [...story.artefacts].sort((a, b) => a.releaseAtTime - b.releaseAtTime);
  },

  // Filter artefacts by type
  filterArtefacts(story, type = null) {
    if (!type) return story.artefacts;
    return story.artefacts.filter(a => a.type === type);
  },

  // Calculate story statistics
  calculateStats(story) {
    const stats = {
      totalArtefacts: story.artefacts.length,
      lockedCount: story.artefacts.filter(a => a.locked).length,
      conditionalCount: story.artefacts.filter(a => a.releaseTriggers && a.releaseTriggers.length > 0).length,
      typeBreakdown: {
        email: 0,
        message: 0,
        calendar: 0,
        document: 0,
        image: 0,
        audio: 0
      }
    };

    story.artefacts.forEach(artefact => {
      if (stats.typeBreakdown.hasOwnProperty(artefact.type)) {
        stats.typeBreakdown[artefact.type]++;
      }
    });

    return stats;
  },

  // Validate story for errors
  validateStory(story) {
    const issues = [];

    // Check for duplicate artefact IDs
    const ids = story.artefacts.map(a => a.id);
    if (ids.length !== new Set(ids).size) {
      issues.push({ type: 'error', message: 'Duplicate artefact IDs found' });
    }

    // Check for missing required fields
    story.artefacts.forEach((artefact, index) => {
      if (!artefact.title) {
        issues.push({ type: 'warning', message: `Artefact ${index + 1} missing title` });
      }

      if (!artefact.type) {
        issues.push({ type: 'error', message: `Artefact ${index + 1} missing type` });
      }

      // Check for referenced entities that don't exist
      if (artefact.type === 'email' && artefact.senderId) {
        const sender = story.emailSenders.find(s => s.id === artefact.senderId);
        if (!sender) {
          issues.push({ type: 'warning', message: `Artefact "${artefact.title}" references non-existent email sender` });
        }
      }

      if (artefact.type === 'message') {
        // Check for required fields
        if (!artefact.participantId) {
          issues.push({ type: 'error', message: `IM message "${artefact.title}" is missing required participant` });
        } else {
          const participant = story.imParticipants.find(p => p.id === artefact.participantId);
          if (!participant) {
            issues.push({ type: 'error', message: `IM message "${artefact.title}" references non-existent participant` });
          }
        }

        if (!artefact.conversationId) {
          issues.push({ type: 'error', message: `IM message "${artefact.title}" is missing required conversation` });
        } else {
          const conversation = story.imConversations.find(c => c.id === artefact.conversationId);
          if (!conversation) {
            issues.push({ type: 'error', message: `IM message "${artefact.title}" references non-existent conversation` });
          }
        }
      }

      if (artefact.folderId) {
        const folder = story.folders.find(f => f.id === artefact.folderId);
        if (!folder) {
          issues.push({ type: 'warning', message: `Artefact "${artefact.title}" references non-existent folder` });
        }
      }
    });

    // Check for missing story metadata
    if (!story.title) {
      issues.push({ type: 'warning', message: 'Story missing title' });
    }

    return issues;
  },

  // Export story as JSON
  exportStory(story) {
    return JSON.stringify(story, null, 2);
  },

  // List all saved stories
  listSavedStories() {
    const stories = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('story_') && key !== 'story_current' && key !== 'story_current_id') {
        try {
          const story = JSON.parse(localStorage.getItem(key));
          stories.push({
            id: story.id,
            title: story.title,
            author: story.author,
            lastModified: story.lastModified,
            artefactCount: story.artefacts.length
          });
        } catch (e) {
          console.error('Failed to parse story:', key);
        }
      }
    }
    return stories;
  },

  // Delete story from localStorage
  deleteStory(storyId) {
    localStorage.removeItem(`story_${storyId}`);
    return true;
  }
};
