/**
 * Default story configuration and factory functions
 */

import type { Story, ThemeConfig, LoginConfig, EndingConfig, CalendarConfig } from '../types'

export function createDefaultTheme(): ThemeConfig {
  return {
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    backgroundColor: '#f3f4f6',
    textColor: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      small: 12,
      normal: 14,
      large: 18,
    },
    wallpaperUrl: undefined,
    taskbarPosition: 'bottom',
    desktopIconSize: 64,
    osName: 'DesktopOS',
  }
}

export function createDefaultLogin(): LoginConfig {
  return {
    enabled: true,
    username: 'user',
    password: 'password',
    message: 'Welcome to StoryEngine',
    requireCredentials: false,
  }
}

export function createDefaultEnding(): EndingConfig {
  return {
    id: 'ending_default',
    title: 'Story Complete',
    description: 'The story has ended',
    imageUrl: undefined,
    triggerConditions: [],
    body: 'Thank you for experiencing this story.',
    allowContinueAfter: false,
    allowRestart: true,
  }
}

export function createDefaultCalendarConfig(): CalendarConfig {
  return {
    id: 'calendar_default',
    ownerName: 'Calendar Owner',
  }
}

export function createDefaultStory(
  storyId: string,
  metadata: { title: string; description: string; author: string }
): Story {
  const now = Date.now()

  return {
    id: storyId,
    title: metadata.title,
    description: metadata.description,
    author: metadata.author,
    version: '0.1.0',
    theme: createDefaultTheme(),
    login: createDefaultLogin(),
    ending: createDefaultEnding(),
    artefacts: [],
    emailSenders: [],
    imParticipants: [],
    fileStructure: [],
    calendarConfig: createDefaultCalendarConfig(),
    created: now,
    modified: now,
  }
}
