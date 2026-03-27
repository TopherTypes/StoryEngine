/**
 * StoryEngine Time Utilities
 * Handles game time calculations, formatting, and conversions
 */

const TimeUtils = {
  /**
   * Parse ISO datetime string to Date object
   * Supports formats: "2026-03-15 09:00" or "2026-03-15T09:00:00Z"
   * @param {string} dateTimeString - DateTime string
   * @returns {Date|null} Parsed date or null if invalid
   */
  parseGameDateTime(dateTimeString) {
    if (!dateTimeString) return null;

    // Try ISO format first
    let date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      // Try space-separated format
      const formatted = dateTimeString.replace(' ', 'T') + ':00Z';
      date = new Date(formatted);
    }

    return isNaN(date.getTime()) ? null : date;
  },

  /**
   * Format date object to ISO string with space separator
   * @param {Date} date - Date to format
   * @returns {string} "2026-03-15 09:00" format
   */
  formatGameDateTime(date) {
    if (!date) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * Calculate minutes between game start and a revelation time
   * @param {string} storyStartDateTime - Game start date/time
   * @param {string} revealDateTime - Reveal date/time
   * @returns {number|null} Minutes delta, or null if invalid
   */
  calculateMinutesFromStart(storyStartDateTime, revealDateTime) {
    const startDate = this.parseGameDateTime(storyStartDateTime);
    const revealDate = this.parseGameDateTime(revealDateTime);

    if (!startDate || !revealDate) return null;

    const deltaMs = revealDate - startDate;
    return Math.floor(deltaMs / (1000 * 60)); // Convert to minutes
  },

  /**
   * Format time in game for display
   * Returns relative time (< 1 hour) or absolute time (>= 1 hour)
   * @param {string} messageTimestamp - Message timestamp ("12:22" or "2026-03-15 12:22")
   * @param {string} storyStartDateTime - Game start date/time
   * @param {number} elapsedMinutes - Current elapsed minutes in game
   * @returns {string} Formatted time string
   */
  formatMessageTime(messageTimestamp, storyStartDateTime, elapsedMinutes) {
    // Parse message timestamp
    const timestamp = this._normalizeTimestamp(messageTimestamp, storyStartDateTime);
    if (!timestamp) return messageTimestamp;

    const startDate = this.parseGameDateTime(storyStartDateTime);
    if (!startDate) return messageTimestamp;

    // Calculate when message was revealed
    const messageDate = this.parseGameDateTime(timestamp);
    if (!messageDate) return messageTimestamp;

    const messageMinutes = this.calculateMinutesFromStart(storyStartDateTime, timestamp);
    if (messageMinutes === null) return messageTimestamp;

    // Determine if within 1 hour
    const minutesSinceMessage = elapsedMinutes - messageMinutes;

    if (minutesSinceMessage >= 0 && minutesSinceMessage <= 60) {
      // Show relative time
      return this._formatRelativeTime(minutesSinceMessage);
    } else {
      // Show absolute time
      return this._formatAbsoluteTime(messageDate);
    }
  },

  /**
   * Normalize timestamp to full datetime if only time is provided
   * @private
   */
  _normalizeTimestamp(timestamp, storyStartDateTime) {
    // If it's already a full datetime, return as-is
    if (timestamp && timestamp.includes('-') && timestamp.includes(':')) {
      return timestamp;
    }

    // If it's just a time (HH:MM), combine with game start date
    if (timestamp && timestamp.match(/^\d{1,2}:\d{2}$/)) {
      const startDate = this.parseGameDateTime(storyStartDateTime);
      if (!startDate) return null;

      const pad = (n) => String(n).padStart(2, '0');
      const year = startDate.getFullYear();
      const month = pad(startDate.getMonth() + 1);
      const day = pad(startDate.getDate());
      return `${year}-${month}-${day} ${timestamp}`;
    }

    return timestamp;
  },

  /**
   * Format relative time string
   * @private
   */
  _formatRelativeTime(minutes) {
    if (minutes < 0) {
      return 'future';
    }

    if (minutes === 0) {
      return 'now';
    }

    if (minutes < 60) {
      return `${Math.round(minutes)} min ago`;
    }

    return `${Math.round(minutes / 60)} hour ago`;
  },

  /**
   * Format absolute time string
   * @private
   */
  _formatAbsoluteTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);

    // Return as "HH:MM" or "YYYY-MM-DD HH:MM" depending on context
    return `${hours}:${minutes}`;
  },

  /**
   * Format date in US format with time
   * @param {Date} date - Date to format
   * @param {boolean} includeTime - Include time portion
   * @returns {string} "3/15/2026" or "3/15/2026 2:45 PM"
   */
  formatDateUS(date, includeTime = false) {
    if (!date) return '';

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    let result = `${month}/${day}/${year}`;

    if (includeTime) {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      result += ` ${displayHours}:${minutes} ${ampm}`;
    }

    return result;
  },

  /**
   * Determine if message should be revealed based on game time
   * @param {string} revealTime - Message reveal time
   * @param {string} storyStartDateTime - Game start time
   * @param {number} elapsedMinutes - Elapsed minutes since game start
   * @returns {boolean} True if message should be visible
   */
  isMessageRevealed(revealTime, storyStartDateTime, elapsedMinutes) {
    if (!revealTime) {
      // No reveal time means always visible
      return true;
    }

    const revealMinutes = this.calculateMinutesFromStart(storyStartDateTime, revealTime);
    if (revealMinutes === null) {
      // Invalid times, assume visible
      return true;
    }

    // Message is visible if game time >= reveal time
    return elapsedMinutes >= revealMinutes;
  },

  /**
   * Convert time string to minutes offset
   * Supports formats: "12:30", "90" (minutes)
   * @param {string} timeStr - Time string
   * @returns {number|null} Minutes as number or null if invalid
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;

    // If it's already just a number, treat as minutes
    if (/^\d+$/.test(timeStr)) {
      return parseInt(timeStr);
    }

    // If it's HH:MM format, convert to total minutes
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return hours * 60 + minutes;
    }

    return null;
  },

  /**
   * Format minutes to HH:MM string
   * @param {number} totalMinutes - Total minutes
   * @returns {string} "HH:MM" format
   */
  formatMinutesToTime(totalMinutes) {
    if (typeof totalMinutes !== 'number' || totalMinutes < 0) {
      return '';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}`;
  }
};
