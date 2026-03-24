/**
 * Error Boundary for Player App
 * Catches and displays errors gracefully
 */

import React from 'react'
import type { Story } from '../../types'

interface Props {
  children: React.ReactNode
  story?: Story
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Player app error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const story = this.props.story

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            backgroundColor: story?.theme.backgroundColor || '#1a1a1a',
          }}
        >
          <div
            className="max-w-md rounded-lg p-6"
            style={{
              backgroundColor: '#2a2a2a',
              borderLeft: `4px solid ${story?.theme.primaryColor || '#ff0000'}`,
            }}
          >
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: '#ff6666' }}
            >
              Oops!
            </h1>
            <p
              className="mb-4 text-sm"
              style={{ color: story?.theme.textColor || '#cccccc' }}
            >
              Something went wrong. The application encountered an error and had to stop.
            </p>
            {this.state.error && (
              <div
                className="mb-4 p-3 rounded text-xs font-mono overflow-auto max-h-40"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#888888',
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: story?.theme.primaryColor || '#0066cc',
                color: '#ffffff',
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
