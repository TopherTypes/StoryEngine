/**
 * Player game state management using IndexedDB
 */

class PlayerState {
  constructor() {
    this.db = null;
    this.currentState = null;
    this.useInMemoryStorage = false;
    this.inMemoryGames = new Map(); // Fallback in-memory storage
  }

  // Initialize database with timeout protection
  async init() {
    console.log('[PlayerState] Initializing IndexedDB...');

    return new Promise((resolve, reject) => {
      // Set a 5-second timeout for IndexedDB to respond
      const timeoutId = setTimeout(() => {
        console.warn('[PlayerState] IndexedDB initialization timeout - falling back to in-memory state');
        this.useInMemoryStorage = true;
        resolve();
      }, 5000);

      try {
        const request = indexedDB.open('StoryEnginePlayer', 1);

        request.onerror = () => {
          clearTimeout(timeoutId);
          console.error('[PlayerState] IndexedDB error:', request.error);
          console.warn('[PlayerState] Falling back to in-memory state');
          this.useInMemoryStorage = true;
          resolve(); // Don't reject, fall back gracefully
        };

        request.onsuccess = () => {
          clearTimeout(timeoutId);
          this.db = request.result;
          console.log('[PlayerState] IndexedDB initialized successfully');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          console.log('[PlayerState] IndexedDB upgrade needed');
          const db = event.target.result;
          if (!db.objectStoreNames.contains('games')) {
            db.createObjectStore('games', { keyPath: 'storyId' });
          }
        };
      } catch (e) {
        clearTimeout(timeoutId);
        console.error('[PlayerState] Exception during IndexedDB init:', e);
        console.warn('[PlayerState] Falling back to in-memory state');
        this.useInMemoryStorage = true;
        resolve(); // Don't reject, fall back gracefully
      }
    });
  }

  // Get game state for a story
  async getGameState(storyId) {
    // Use in-memory storage if IndexedDB is unavailable
    if (this.useInMemoryStorage || !this.db) {
      console.log('[PlayerState] Using in-memory storage for getGameState');
      const state = this.inMemoryGames.get(storyId);
      if (state) {
        this.convertArraysToSets(state);
      }
      return state || null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['games'], 'readonly');
        const store = transaction.objectStore('games');
        const request = store.get(storyId);

        request.onerror = () => {
          console.error('[PlayerState] Error retrieving game state:', request.error);
          resolve(null);
        };
        request.onsuccess = () => {
          const state = request.result;
          if (state) {
            // Convert Sets back from arrays
            this.convertArraysToSets(state);
          }
          resolve(state || null);
        };
      } catch (e) {
        console.error('[PlayerState] Exception during getGameState:', e);
        resolve(null);
      }
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
    // Use in-memory storage if IndexedDB is unavailable
    if (this.useInMemoryStorage || !this.db) {
      console.log('[PlayerState] Using in-memory storage for saveGameState');
      const stateToStore = this.convertSetsToArrays(gameState);
      this.inMemoryGames.set(gameState.storyId, stateToStore);
      this.currentState = gameState;
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['games'], 'readwrite');
        const store = transaction.objectStore('games');

        // Convert Sets and Maps to arrays for storage
        const stateToStore = this.convertSetsToArrays(gameState);

        const request = store.put(stateToStore);

        request.onerror = () => {
          console.error('[PlayerState] Error saving game state:', request.error);
          // Fall back to in-memory storage
          this.inMemoryGames.set(gameState.storyId, stateToStore);
          this.currentState = gameState;
          resolve();
        };
        request.onsuccess = () => {
          this.currentState = gameState;
          resolve();
        };
      } catch (e) {
        console.error('[PlayerState] Exception during saveGameState:', e);
        const stateToStore = this.convertSetsToArrays(gameState);
        this.inMemoryGames.set(gameState.storyId, stateToStore);
        this.currentState = gameState;
        resolve();
      }
    });
  }

  // Delete game state
  async deleteGameState(storyId) {
    // Use in-memory storage if IndexedDB is unavailable
    if (this.useInMemoryStorage || !this.db) {
      console.log('[PlayerState] Using in-memory storage for deleteGameState');
      this.inMemoryGames.delete(storyId);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['games'], 'readwrite');
        const store = transaction.objectStore('games');
        const request = store.delete(storyId);

        request.onerror = () => {
          console.error('[PlayerState] Error deleting game state:', request.error);
          this.inMemoryGames.delete(storyId);
          resolve();
        };
        request.onsuccess = () => {
          resolve();
        };
      } catch (e) {
        console.error('[PlayerState] Exception during deleteGameState:', e);
        this.inMemoryGames.delete(storyId);
        resolve();
      }
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
