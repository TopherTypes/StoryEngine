/**
 * Progression engine for evaluating release rules and unlocking content
 */

class ProgressionEngine {
  constructor(story, gameState) {
    this.story = story;
    this.gameState = gameState;
  }

  // Evaluate all artefacts and unlock those that should be available
  evaluateAllArtefacts() {
    const elapsedMinutes = this.gameState.getElapsedMinutes();
    const unlocked = new Set();

    this.story.artefacts.forEach(artefact => {
      if (this.isArtefactUnlocked(artefact, elapsedMinutes)) {
        this.gameState.unlockArtefact(artefact.id);
        unlocked.add(artefact.id);
      }
    });

    return unlocked;
  }

  // Check if a single artefact should be unlocked
  isArtefactUnlocked(artefact, elapsedMinutes) {
    // Already unlocked
    if (this.gameState.getUnlockedArtefactIds().has(artefact.id)) {
      return true;
    }

    // Check new revealTime format (absolute game timestamp)
    if (artefact.revealTime) {
      const storyStart = this.story.globalSettings?.storyStartDateTime;
      if (storyStart) {
        const revealMinutes = this._calculateMinutesFromStart(storyStart, artefact.revealTime);
        if (revealMinutes !== null && elapsedMinutes < revealMinutes) {
          return false;
        }
      }
    }

    // Check legacy releaseAtTime format (minutes from start)
    if (artefact.releaseAtTime !== null && artefact.releaseAtTime !== undefined) {
      if (elapsedMinutes < artefact.releaseAtTime) {
        return false;
      }
    }

    // Check release triggers
    if (artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
      // All triggers must pass (AND logic between multiple triggers)
      const allPass = artefact.releaseTriggers.every(trigger => {
        return this.evaluateRule(trigger, elapsedMinutes);
      });
      return allPass;
    }

    // No release conditions, always available
    return true;
  }

  // Helper: Calculate minutes from game start to a target datetime
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
  }

  // Helper: Parse datetime string
  _parseDateTime(dateTimeString) {
    if (!dateTimeString) return null;

    // Try parsing with space separator
    const date = new Date(dateTimeString.replace(' ', 'T') + ':00Z');
    return isNaN(date.getTime()) ? null : date;
  }

  // Evaluate a release rule
  evaluateRule(rule, elapsedMinutes) {
    if (!rule) return false;

    switch (rule.type) {
      case 'time':
        return elapsedMinutes >= rule.minutes;

      case 'artefact_opened':
        return this.gameState.currentState &&
               this.gameState.currentState.openedArtefactIds.has(rule.artefactId);

      case 'artefact_read':
        return this.gameState.currentState &&
               this.gameState.currentState.readArtefactIds.has(rule.artefactId);

      case 'app_opened':
        return this.gameState.currentState &&
               this.gameState.currentState.visitedApps.has(rule.appName);

      case 'condition_group':
        return this.evaluateConditionGroup(rule, elapsedMinutes);

      case 'password':
        // Password is handled separately in UI, not here
        return false;

      default:
        return false;
    }
  }

  // Evaluate AND/OR condition groups
  evaluateConditionGroup(group, elapsedMinutes) {
    if (!group.rules || group.rules.length === 0) return false;

    if (group.operator === 'AND') {
      return group.rules.every(rule => this.evaluateRule(rule, elapsedMinutes));
    } else if (group.operator === 'OR') {
      return group.rules.some(rule => this.evaluateRule(rule, elapsedMinutes));
    }

    return false;
  }

  // Check if ending condition is met
  checkEndingCondition() {
    if (!this.story.ending || !this.story.ending.triggerConditions) {
      return false;
    }

    const elapsedMinutes = this.gameState.getElapsedMinutes();
    const conditions = this.story.ending.triggerConditions;

    // All conditions must be met (AND logic)
    return conditions.every(condition => this.evaluateRule(condition, elapsedMinutes));
  }

  // Get all available artefacts of a type
  getAvailableArtefacts(type) {
    const elapsedMinutes = this.gameState.getElapsedMinutes();
    const types = Array.isArray(type) ? type : [type];

    return this.story.artefacts.filter(a => {
      if (!types.includes(a.type)) return false;
      return this.isArtefactUnlocked(a, elapsedMinutes);
    });
  }

  // Get artefact by ID
  getArtefactById(id) {
    return this.story.artefacts.find(a => a.id === id);
  }
}

// Global instance placeholder
let progressionEngine = null;
