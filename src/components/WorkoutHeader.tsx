'use client'

import { useState } from 'react'
import { Workout } from '@/types/database'
import { availableTags } from '@/lib/templates'

interface WorkoutHeaderProps {
  workout: Workout
  onUpdate: (updates: Partial<Workout>) => void
  onDelete: () => void
  onBack: () => void
}

const tagColors: Record<string, string> = {
  Lifting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Cardio: 'bg-green-500/20 text-green-400 border-green-500/30',
  HIIT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Stretching: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Sports: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export function WorkoutHeader({ workout, onUpdate, onDelete, onBack }: WorkoutHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(workout.name)
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleNameSubmit = () => {
    if (name.trim() && name !== workout.name) {
      onUpdate({ name: name.trim() })
    } else {
      setName(workout.name)
    }
    setIsEditingName(false)
  }

  const handleTagSelect = (tag: string) => {
    onUpdate({ tag })
    setShowTagMenu(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ date: e.target.value })
  }

  return (
    <header className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete()
                    }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-dark-hover transition-colors"
                  >
                    Delete Workout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workout name */}
        {isEditingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit()
              if (e.key === 'Escape') {
                setName(workout.name)
                setIsEditingName(false)
              }
            }}
            autoFocus
            className="text-2xl font-bold bg-transparent border-b border-blue-500 outline-none w-full mb-2"
          />
        ) : (
          <h1
            onClick={() => setIsEditingName(true)}
            className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors mb-2"
          >
            {workout.name}
          </h1>
        )}

        {/* Tag and date row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tag */}
          <div className="relative">
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              className={`px-3 py-1 text-sm font-medium rounded-full border ${
                tagColors[workout.tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {workout.tag}
            </button>

            {showTagMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTagMenu(false)} />
                <div className="absolute left-0 top-full mt-1 w-40 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className={`w-full text-left px-4 py-2 hover:bg-dark-hover transition-colors ${
                        tag === workout.tag ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date */}
          <div className="relative">
            <input
              type="date"
              value={workout.date}
              onChange={handleDateChange}
              className="bg-transparent text-gray-400 text-sm cursor-pointer appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
