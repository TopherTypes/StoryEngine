/**
 * Utility functions for the player app
 */

// Generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Parse JSON safely
function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('JSON parse error:', e);
    return null;
  }
}

// Get URL parameter
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Load JSON from URL
async function loadJSONFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to load JSON from URL:', e);
    return null;
  }
}

// Load story from localStorage (from authoring tool)
function loadStoryFromLocalStorage(key = 'storyData') {
  const data = localStorage.getItem(key);
  return data ? parseJSON(data) : null;
}

// Calculate elapsed minutes from start time
function getElapsedMinutes(startTime) {
  return Math.floor((Date.now() - startTime) / 60000);
}

// Format time as HH:MM
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if artefact should be shown (unlocked and released)
function isArtefactAvailable(artefact, gameState, elapsedMinutes) {
  // Check time-based release
  if (artefact.releaseAtTime !== null && artefact.releaseAtTime !== undefined) {
    if (elapsedMinutes < artefact.releaseAtTime) {
      return false;
    }
  }

  // Check release triggers
  if (artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
    const allTriggersPass = artefact.releaseTriggers.every(trigger => {
      return evaluateTrigger(trigger, gameState, elapsedMinutes);
    });
    if (!allTriggersPass) {
      return false;
    }
  }

  return true;
}

// Evaluate a single trigger (simple, will be enhanced by progression.js)
function evaluateTrigger(trigger, gameState, elapsedMinutes) {
  if (trigger.type === 'time') {
    return elapsedMinutes >= trigger.minutes;
  }
  if (trigger.type === 'artefact_opened') {
    return gameState.openedArtefactIds && gameState.openedArtefactIds.has(trigger.artefactId);
  }
  if (trigger.type === 'artefact_read') {
    return gameState.readArtefactIds && gameState.readArtefactIds.has(trigger.artefactId);
  }
  if (trigger.type === 'app_opened') {
    return gameState.visitedApps && gameState.visitedApps.has(trigger.appName);
  }
  if (trigger.type === 'condition_group') {
    if (trigger.operator === 'AND') {
      return trigger.rules.every(rule => evaluateTrigger(rule, gameState, elapsedMinutes));
    } else if (trigger.operator === 'OR') {
      return trigger.rules.some(rule => evaluateTrigger(rule, gameState, elapsedMinutes));
    }
  }
  return false;
}

// Validate login credentials
function validateLogin(username, password, loginConfig) {
  if (!loginConfig) return false;
  return loginConfig.username === username && loginConfig.password === password;
}
