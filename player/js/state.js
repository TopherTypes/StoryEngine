/**
 * Player game state management using IndexedDB
 */

class PlayerState {
  constructor() {
    this.db = null;
    this.currentState = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StoryEnginePlayer', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'storyId' });
        }
      };
    });
  }

  // Get game state for a story
  async getGameState(storyId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['games'], 'readonly');
      const store = transaction.objectStore('games');
      const request = store.get(storyId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const state = request.result;
        if (state) {
          // Convert Sets back from arrays
          this.convertArraysToSets(state);
        }
        resolve(state || null);
      };
    });
  }

  // Create new game state
  createNewGameState(storyId) {
    const now = Date.now();
    return {
      storyId,
      startTime: now,
      currentSessionTime: now,
      currentFilePath: '/',
      unlockedArtefactIds: new Set(),
      openedArtefactIds: new Set(),
      readArtefactIds: new Set(),
      visitedApps: new Set(),
      visitedFolders: new Set(),
      unlockedPasswords: new Map(),
      endingTriggered: false,
      endingTriggeredAt: null,
      createdAt: now,
      lastPlayedAt: now,
      totalPlayTime: 0,
      completionPercentage: 0
    };
  }

  // Save game state
  async saveGameState(gameState) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['games'], 'readwrite');
      const store = transaction.objectStore('games');

      // Convert Sets and Maps to arrays for storage
      const stateToStore = this.convertSetsToArrays(gameState);

      const request = store.put(stateToStore);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.currentState = gameState;
        resolve();
      };
    });
  }

  // Delete game state
  async deleteGameState(storyId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['games'], 'readwrite');
      const store = transaction.objectStore('games');
      const request = store.delete(storyId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Convert Sets and Maps to arrays for storage
  convertSetsToArrays(state) {
    const stored = { ...state };
    if (state.unlockedArtefactIds instanceof Set) {
      stored.unlockedArtefactIds = Array.from(state.unlockedArtefactIds);
    }
    if (state.openedArtefactIds instanceof Set) {
      stored.openedArtefactIds = Array.from(state.openedArtefactIds);
    }
    if (state.readArtefactIds instanceof Set) {
      stored.readArtefactIds = Array.from(state.readArtefactIds);
    }
    if (state.visitedApps instanceof Set) {
      stored.visitedApps = Array.from(state.visitedApps);
    }
    if (state.visitedFolders instanceof Set) {
      stored.visitedFolders = Array.from(state.visitedFolders);
    }
    if (state.unlockedPasswords instanceof Map) {
      stored.unlockedPasswords = Array.from(state.unlockedPasswords.entries());
    }
    return stored;
  }

  // Convert arrays back to Sets and Maps
  convertArraysToSets(state) {
    if (Array.isArray(state.unlockedArtefactIds)) {
      state.unlockedArtefactIds = new Set(state.unlockedArtefactIds);
    }
    if (Array.isArray(state.openedArtefactIds)) {
      state.openedArtefactIds = new Set(state.openedArtefactIds);
    }
    if (Array.isArray(state.readArtefactIds)) {
      state.readArtefactIds = new Set(state.readArtefactIds);
    }
    if (Array.isArray(state.visitedApps)) {
      state.visitedApps = new Set(state.visitedApps);
    }
    if (Array.isArray(state.visitedFolders)) {
      state.visitedFolders = new Set(state.visitedFolders);
    }
    if (Array.isArray(state.unlockedPasswords)) {
      state.unlockedPasswords = new Map(state.unlockedPasswords);
    }
    return state;
  }

  // Mark artefact as opened
  markArtefactOpened(artefactId) {
    if (!this.currentState) return;
    this.currentState.openedArtefactIds.add(artefactId);
    this.currentState.lastPlayedAt = Date.now();
  }

  // Mark artefact as read
  markArtefactRead(artefactId) {
    if (!this.currentState) return;
    this.currentState.readArtefactIds.add(artefactId);
    this.currentState.lastPlayedAt = Date.now();
  }

  // Mark app as visited
  markAppVisited(appName) {
    if (!this.currentState) return;
    this.currentState.visitedApps.add(appName);
  }

  // Mark folder as visited
  markFolderVisited(folderPath) {
    if (!this.currentState) return;
    this.currentState.visitedFolders.add(folderPath);
  }

  // Unlock password
  unlockPassword(passwordKey, password) {
    if (!this.currentState) return;
    this.currentState.unlockedPasswords.set(passwordKey, password);
  }

  // Check if password is unlocked
  isPasswordUnlocked(passwordKey) {
    if (!this.currentState) return false;
    return this.currentState.unlockedPasswords.has(passwordKey);
  }

  // Get unlocked artefacts for current state
  getUnlockedArtefactIds() {
    if (!this.currentState) return new Set();
    return this.currentState.unlockedArtefactIds;
  }

  // Mark artefact as unlocked
  unlockArtefact(artefactId) {
    if (!this.currentState) return;
    this.currentState.unlockedArtefactIds.add(artefactId);
  }

  // Get elapsed minutes
  getElapsedMinutes() {
    if (!this.currentState) return 0;
    return getElapsedMinutes(this.currentState.startTime);
  }

  // Update session time
  updateSessionTime() {
    if (!this.currentState) return;
    this.currentState.currentSessionTime = Date.now();
  }

  // Trigger ending
  triggerEnding() {
    if (!this.currentState) return;
    this.currentState.endingTriggered = true;
    this.currentState.endingTriggeredAt = Date.now();
  }

  // Check if ending triggered
  isEndingTriggered() {
    if (!this.currentState) return false;
    return this.currentState.endingTriggered;
  }
}

// Global instance
const playerState = new PlayerState();
