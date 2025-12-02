'use client'

import { useState, useRef, useEffect } from 'react'
import { Exercise, Workout } from '@/types/database'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBarProps {
  workoutId: string
  exercises: Exercise[]
  workout: Workout
  onUpdate: (exercises: Exercise[], workout?: Workout) => void
}

export function ChatBar({ workoutId, exercises, workout, onUpdate }: ChatBarProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showHistory && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setShowHistory(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          workoutId,
          exercises,
          workout,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])

        // Update the exercises and workout in the parent
        if (data.exercises) {
          onUpdate(data.exercises, data.workout)
        }
      } else {
        const error = await res.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: error.error || 'Something went wrong. Please try again.' },
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to send message. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-bg border-t border-dark-border">
      {/* Chat History (collapsible) */}
      {showHistory && messages.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border">
            <span className="text-xs text-gray-500">Chat History</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Hide
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`text-sm ${
                  message.role === 'user' ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                <span className="font-medium">
                  {message.role === 'user' ? 'You: ' : 'AI: '}
                </span>
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="text-sm text-gray-500">
                <span className="animate-pulse">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {messages.length > 0 && !showHistory && (
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try "3 sets of 8 bench press at 135 lbs"'
              disabled={isLoading}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50 placeholder:text-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-600 text-center mt-2">
          Use natural language to log your workout
        </p>
      </div>
    </div>
  )
}
