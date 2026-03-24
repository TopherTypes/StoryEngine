/**
 * Calendar App
 * Displays calendar events in list view
 */

import { useMemo, useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useProgressionEngine } from '../../hooks/useProgressionEngine'
import { getCalendarEvents } from '../../engine/artefactResolver'
import type { Story, CalendarArtefact } from '../../../types'

interface CalendarAppProps {
  story: Story
}

export function CalendarApp({ story }: CalendarAppProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarArtefact | null>(null)

  const playerState = usePlayerStore((state) => state.playerState)
  const recordAppVisited = usePlayerStore((state) => state.recordAppVisited)
  const recordArtefactRead = usePlayerStore((state) => state.recordArtefactRead)

  // Track app visit on mount
  useMemo(() => {
    recordAppVisited('calendar')
  }, [recordAppVisited])

  const events = useMemo(() => {
    if (!playerState) return []
    return getCalendarEvents(story, playerState)
  }, [story, playerState])

  const handleEventClick = (event: CalendarArtefact) => {
    setSelectedEvent(event)
    recordArtefactRead(event.id)
  }

  // If an event is selected, show details
  if (selectedEvent) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{
            backgroundColor: '#2a2a2a',
            borderColor: story.theme.accentColor || '#555555',
          }}
        >
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-sm hover:opacity-75 transition-opacity mb-1"
              style={{ color: story.theme.primaryColor || '#0066cc' }}
            >
              ← Back
            </button>
            <h2
              className="font-semibold truncate"
              style={{ color: story.theme.textColor || '#ffffff' }}
            >
              {selectedEvent.eventTitle}
            </h2>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {/* Date & Time */}
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: story.theme.primaryColor || '#0066cc' }}
              >
                Date
              </p>
              <p style={{ color: story.theme.textColor || '#cccccc' }}>
                {new Date(selectedEvent.date).toLocaleDateString()}
                {selectedEvent.time && ` at ${selectedEvent.time}`}
              </p>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: story.theme.primaryColor || '#0066cc' }}
                >
                  Details
                </p>
                <p
                  className="text-sm whitespace-pre-wrap break-words"
                  style={{ color: story.theme.textColor || '#cccccc' }}
                >
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Location */}
            {selectedEvent.location && (
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: story.theme.primaryColor || '#0066cc' }}
                >
                  Location
                </p>
                <p style={{ color: story.theme.textColor || '#cccccc' }}>
                  {selectedEvent.location}
                </p>
              </div>
            )}

            {/* Attendees */}
            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: story.theme.primaryColor || '#0066cc' }}
                >
                  Attendees
                </p>
                <ul style={{ color: story.theme.textColor || '#cccccc' }}>
                  {selectedEvent.attendees.map((attendee) => (
                    <li key={attendee} className="text-sm">
                      • {attendee}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: '#2a2a2a',
          borderColor: story.theme.accentColor || '#555555',
        }}
      >
        <h2
          className="font-semibold"
          style={{ color: story.theme.primaryColor || '#0066cc' }}
        >
          Calendar ({events.length})
        </h2>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-auto">
        {events.length === 0 ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: story.theme.textColor || '#999999' }}
          >
            <p>No events scheduled</p>
          </div>
        ) : (
          events.map((event) => (
            <button
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="w-full px-4 py-4 text-left border-b hover:bg-white hover:bg-opacity-5 transition-colors flex flex-col gap-1"
              style={{
                borderColor: story.theme.accentColor || '#333333',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="px-2 py-1 rounded text-xs font-semibold min-w-fit"
                  style={{
                    backgroundColor: story.theme.primaryColor || '#0066cc',
                    color: '#ffffff',
                  }}
                >
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: story.theme.textColor || '#ffffff' }}
                  >
                    {event.eventTitle}
                  </p>
                  {event.time && (
                    <p
                      className="text-xs"
                      style={{ color: story.theme.accentColor || '#888888' }}
                    >
                      {event.time}
                    </p>
                  )}
                </div>
              </div>
              {event.location && (
                <p
                  className="text-xs px-10"
                  style={{ color: story.theme.accentColor || '#888888' }}
                >
                  📍 {event.location}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
